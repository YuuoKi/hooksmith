# HookSmith

> AI-powered ad script generator for game user acquisition.
> 6 Hook angles. Any game. 3 scripts in 30 seconds.

<!-- TODO: Add screenshot/GIF of the chat interface and generated script cards -->

## The Problem

Game UA teams spend hours brainstorming ad scripts. Senior designers carry all the creative knowledge in their heads — which hooks work for RPG vs SLG, which angles convert for different audiences. When they leave, the knowledge walks out the door.

Junior designers start from zero every time. "Write me a 30-second ad script" produces generic, angle-less content that burns budget without learning.

## The Solution

HookSmith encodes proven UA creative knowledge into an AI system. Tell it your game name and genre, and it generates 3 differentiated ad scripts — each using a different angle from a battle-tested 6-angle hook classification system.

No more blank page. No more single-angle thinking. Every script comes with the hook, body, CTA, asset requirements, and a one-line explanation of why that angle works for your genre.

## The 6 Hook Angle System

| Angle | Use When |
|-------|----------|
| **Emotional** | Character stories, narrative moments, nostalgia |
| **Gameplay** | Core loop showcase, satisfying mechanics, progression |
| **UGC** | Fake user reviews, word-of-mouth style |
| **Contrast** | Before/After, noob vs pro comparisons |
| **Challenge** | "99% can't do this", dare-based hooks |
| **Plot Twist** | Short drama narrative, twists every 3-5 seconds |

Different genres need different angles. HookSmith knows that RPGs need Emotional + Gameplay, SLGs need Contrast + Challenge, and casual games need UGC + Plot Twist — and picks accordingly.

## Quick Start

1. Open HookSmith (deploy your own or run locally)
2. Enter your Gemini API key (free from [Google AI Studio](https://aistudio.google.com/apikey))
3. Tell Hook your game name and genre
4. Get 3 scripts in 30 seconds

```bash
# Run locally
git clone https://github.com/YOUR_USERNAME/hooksmith.git
cd hooksmith
npm install
npm run dev
```

## Supported Models

| Model | Browser Direct | Needs Proxy | Notes |
|-------|:-:|:-:|-------|
| **Gemini 2.5 Flash** | Yes | — | **Recommended.** Free, zero setup |
| Kimi K2.5 | — | Yes | Best for Chinese market scripts |
| GPT-4o | — | Yes | Strong overall quality |
| DeepSeek V3 | — | Yes | Best cost-performance ratio |
| Claude Sonnet | — | Yes | Best writing quality |

Gemini works directly in your browser — no server, no proxy, no backend.

Other models need a simple Cloudflare Worker proxy ([deploy in 30 seconds](./proxy/README.md)).

## Architecture

```
Zero-backend mode (default):
  Browser → Gemini API (CORS supported) → Script cards

Proxy mode (optional):
  Browser → Your CF Worker → Any LLM API
```

- **Zero backend** — deploy on GitHub Pages, no server to maintain
- **Your keys, your browser** — API keys are stored in localStorage, never leave your machine
- **Streaming** — responses stream in real-time via SSE

## Built With

- React 19 + Vite
- Tailwind CSS v4
- Gemini API (direct) + optional CF Worker proxy
- Zero runtime dependencies beyond React

## Why I Built This

After managing millions in game UA ad spend, I noticed the same pattern: the difference between a $0.50 CPI and a $2.00 CPI often comes down to the first 3 seconds — the hook angle.

The best creative leads have this knowledge intuitively. They know that RPG audiences respond to character emotion, that SLG players want power fantasy contrasts, that casual gamers click on "I bet you can't" challenges.

I built HookSmith to make that pattern recognition accessible to every UA team, regardless of size or experience level. The 6-angle system isn't theoretical — it's extracted from real campaigns, real A/B tests, real spend data.

## Development

```bash
npm install      # Install dependencies
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
```

## Contributing

Contributions welcome. The system prompt in `src/constants/systemPrompt.js` is where the creative knowledge lives — PRs that improve genre-specific guidance are especially valuable.

## License

[MIT](./LICENSE) — fork it, improve it, make it yours.
