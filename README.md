# Myanmar AI Prompt Generator

A beginner-friendly prompt generator for Myanmar/Burmese users. Users describe what they want in Burmese, then the app generates a structured English prompt that can be copied into ChatGPT, Gemini, DeepSeek, Claude, or another generative AI tool.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- OpenAI Responses API
- Zod validation

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Add your OpenAI API key to `.env.local`:

```bash
OPENAI_API_KEY=your_api_key_here
OPENAI_MODEL=gpt-5.4-mini
```

The app uses a two-stage generation pipeline to improve Myanmar/Burmese input quality on lower-cost models:

1. Normalize the user request into a structured English intent brief.
2. Generate the final copy-ready prompt from that brief.

By default both stages use `OPENAI_MODEL`. You can tune cost and quality independently:

```bash
OPENAI_INTENT_MODEL=gpt-5.4-mini
OPENAI_PROMPT_MODEL=gpt-5.4-mini
```

For an OpenRouter key, use an OpenRouter model id:

```bash
OPENAI_API_KEY=your_openrouter_key_here
OPENAI_BASE_URL=https://openrouter.ai/api/v1
OPENAI_MODEL=openai/gpt-4o-mini
OPENAI_INTENT_MODEL=openai/gpt-4o-mini
OPENAI_PROMPT_MODEL=openai/gpt-4o-mini
APP_URL=http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
```

## Environment Variables

- `OPENAI_API_KEY`: Required. Server-side key used by `/api/generate-prompt`.
- `OPENAI_MODEL`: Optional. Defaults to `gpt-5.4-mini`.
- `OPENAI_INTENT_MODEL`: Optional. Model for Myanmar/Burmese intent normalization. Defaults to `OPENAI_MODEL`.
- `OPENAI_PROMPT_MODEL`: Optional. Model for final prompt writing. Defaults to `OPENAI_MODEL`.
- `OPENAI_BASE_URL`: Optional. Set to `https://openrouter.ai/api/v1` for OpenRouter keys.
- `APP_URL`: Optional. Used as the OpenRouter referer header.

## Deployment

Vercel is the recommended deployment target.

1. Push the project to GitHub.
2. Import the repository in Vercel.
3. Add `OPENAI_API_KEY` and `OPENAI_MODEL` in Vercel project environment variables.
4. Deploy.
5. Smoke-test Burmese input, generated English output, and copy-to-clipboard.

## V1 Scope

- No login.
- No database.
- No saved cloud history.
- No direct Gemini, DeepSeek, or Claude API calls.
- Generated prompts remain provider-neutral and copy-ready.
