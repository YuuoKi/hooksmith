# HookSmith LLM Proxy

Optional Cloudflare Worker proxy for using non-Gemini models (Kimi, GPT-4o, DeepSeek, Claude).

## Deploy in 30 seconds

```bash
# Install Wrangler CLI (if you haven't)
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy
npx wrangler deploy proxy/worker.js --name hooksmith-proxy
```

Your proxy URL will be: `https://hooksmith-proxy.<your-subdomain>.workers.dev`

Paste this URL into HookSmith's settings panel under "Proxy URL".

## How it works

```
Your Browser → Your CF Worker → LLM API (Kimi/GPT/DeepSeek/Claude)
```

- Your API key is sent from your browser to YOUR worker — no third party
- The worker adds CORS headers and routes to the correct LLM endpoint
- Cloudflare Workers free tier: 100k requests/day

## Supported models

| Model | Endpoint |
|-------|----------|
| Kimi K2.5 | api.moonshot.cn |
| GPT-4o | api.openai.com |
| DeepSeek V3 | api.deepseek.com |
| Claude Sonnet | api.anthropic.com |
