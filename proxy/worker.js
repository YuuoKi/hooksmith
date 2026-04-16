/**
 * HookSmith LLM Proxy — Cloudflare Worker
 *
 * Routes requests to various LLM APIs that don't support browser CORS.
 * Deploy: `npx wrangler deploy proxy/worker.js --name hooksmith-proxy`
 */

const ENDPOINTS = {
  'kimi':     'https://api.moonshot.cn/v1/chat/completions',
  'gpt-4o':   'https://api.openai.com/v1/chat/completions',
  'deepseek': 'https://api.deepseek.com/v1/chat/completions',
  'claude':   'https://api.anthropic.com/v1/messages',
};

const MODEL_IDS = {
  'kimi':     'moonshot-v1-auto',
  'gpt-4o':   'gpt-4o',
  'deepseek': 'deepseek-chat',
  'claude':   'claude-sonnet-4-20250514',
};

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    if (request.method !== 'POST') {
      return json({ error: 'Method not allowed' }, 405);
    }

    try {
      const { model, apiKey, messages, stream, maxTokens } = await request.json();
      const endpoint = ENDPOINTS[model];
      if (!endpoint) {
        return json({ error: `Unknown model: ${model}` }, 400);
      }

      // Claude uses a different API format
      if (model === 'claude') {
        return proxyClaude(endpoint, apiKey, messages, stream, maxTokens);
      }

      // OpenAI-compatible APIs (Kimi, GPT, DeepSeek)
      const body = {
        model: MODEL_IDS[model],
        messages,
        stream: !!stream,
        max_tokens: maxTokens || 4096,
        temperature: 0.9,
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
      });

      return new Response(res.body, {
        status: res.status,
        headers: {
          ...corsHeaders(),
          'Content-Type': res.headers.get('Content-Type') || 'application/json',
        },
      });
    } catch (err) {
      return json({ error: err.message }, 500);
    }
  },
};

async function proxyClaude(endpoint, apiKey, messages, stream, maxTokens) {
  const system = messages.find((m) => m.role === 'system')?.content || '';
  const rest = messages.filter((m) => m.role !== 'system');

  const body = {
    model: MODEL_IDS['claude'],
    max_tokens: maxTokens || 4096,
    system,
    messages: rest,
    stream: !!stream,
  };

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify(body),
  });

  // For streaming, transform Claude SSE to OpenAI-compatible SSE
  if (stream && res.ok) {
    const { readable, writable } = new TransformStream();
    transformClaudeStream(res.body, writable);
    return new Response(readable, {
      headers: { ...corsHeaders(), 'Content-Type': 'text/event-stream' },
    });
  }

  return new Response(res.body, {
    status: res.status,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}

async function transformClaudeStream(input, writable) {
  const reader = input.getReader();
  const writer = writable.getWriter();
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const evt = JSON.parse(line.slice(6));
          if (evt.type === 'content_block_delta' && evt.delta?.text) {
            const chunk = {
              choices: [{ delta: { content: evt.delta.text } }],
            };
            await writer.write(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
          }
        } catch { /* skip */ }
      }
    }
    await writer.write(encoder.encode('data: [DONE]\n\n'));
  } finally {
    writer.close();
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
  });
}
