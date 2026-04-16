import { getSystemPrompt } from '../constants/systemPrompt';

/**
 * Call LLM with conversation history. Supports:
 *  - Gemini direct (mode: 'gemini')
 *  - Proxy to any model (mode: 'proxy')
 *
 * Returns an async iterator yielding text chunks (streaming).
 */
export async function* streamChat(config, messages, lang = 'zh', signal) {
  if (config.mode === 'gemini') {
    yield* streamGemini(config.geminiKey, messages, lang, signal);
  } else {
    yield* streamProxy(config, messages, lang, signal);
  }
}

/**
 * Validate that the API key / proxy is working.
 * Returns true if valid, throws with message if not.
 */
export async function validateConfig(config) {
  if (config.mode === 'gemini') {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${config.geminiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'Say "ok"' }] }],
        generationConfig: { maxOutputTokens: 10 },
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `HTTP ${res.status}`);
    }
    return true;
  }

  // Proxy validation — simple ping
  const res = await fetch(config.proxyUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.proxyModel,
      apiKey: config.proxyKey,
      messages: [{ role: 'user', content: 'Say "ok"' }],
      maxTokens: 10,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `Proxy returned HTTP ${res.status}`);
  }
  return true;
}

// ── Gemini streaming via SSE ──────────────────────────────────────────

async function* streamGemini(apiKey, messages, lang, signal) {
  const systemPrompt = getSystemPrompt(lang);

  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`;

  const res = await fetch(url, {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents,
      generationConfig: {
        temperature: 0.9,
        maxOutputTokens: 4096,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `Gemini API error: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') return;
      try {
        const parsed = JSON.parse(data);
        const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) yield text;
      } catch {
        // skip unparseable
      }
    }
  }
}

// ── Proxy streaming (OpenAI-compatible SSE) ───────────────────────────

async function* streamProxy(config, messages, lang, signal) {
  const systemPrompt = getSystemPrompt(lang);

  const allMessages = [
    { role: 'system', content: systemPrompt },
    ...messages,
  ];

  const res = await fetch(config.proxyUrl, {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.proxyModel,
      apiKey: config.proxyKey,
      messages: allMessages,
      stream: true,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `Proxy error: ${res.status}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const data = line.slice(6).trim();
      if (data === '[DONE]') return;
      try {
        const parsed = JSON.parse(data);
        const text = parsed?.choices?.[0]?.delta?.content;
        if (text) yield text;
      } catch {
        // skip
      }
    }
  }
}
