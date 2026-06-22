# Implementation Plan

## Summary

Implement a stateless Next.js MVP that converts Myanmar/Burmese user input into structured English prompts for beginner AI users.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- OpenAI SDK
- Zod
- Vercel deployment target

## Folder Structure

```text
src/app
  api/generate-prompt/route.ts
  globals.css
  layout.tsx
  page.tsx
src/components
  prompt-form.tsx
  prompt-result.tsx
src/lib
  openai.ts
  prompt-schema.ts
```

## API Contract

`POST /api/generate-prompt`

Request:

```json
{
  "inputMyanmar": "string",
  "category": "general | writing | coding | image | learning | business | marketing | analysis",
  "targetTool": "general | chatgpt | gemini | deepseek | claude",
  "tone": "simple | professional | creative | academic",
  "detailLevel": "short | balanced | detailed"
}
```

Response:

```json
{
  "title": "string",
  "finalPrompt": "string",
  "sections": {
    "role": "string",
    "task": "string",
    "context": "string",
    "requirements": ["string"],
    "outputFormat": "string",
    "qualityCriteria": ["string"]
  },
  "warnings": ["string"]
}
```

## Implementation Phases

1. Scaffold Next.js with TypeScript, Tailwind, and ESLint.
2. Add documentation files:
   - `requirements.md`
   - `design.md`
   - `plan.md`
3. Add shared Zod schemas and labels.
4. Add OpenAI server wrapper using structured output parsing.
5. Add `/api/generate-prompt` route.
6. Build single-screen UI with input controls, result panel, copy action, reset action, loading state, and error state.
7. Add `.env.example` and README setup/deployment instructions.
8. Run lint and production build.

## Environment Variables

- `OPENAI_API_KEY`: Required server-side OpenAI API key.
- `OPENAI_MODEL`: Optional model override. Defaults to `gpt-5.4-mini`.

## Testing Checklist

- `npm run lint`
- `npm run build`
- Empty input validation.
- Long input validation.
- Burmese-only generation.
- Mixed Burmese/English generation.
- All target AI options render and submit.
- Copy-to-clipboard behavior.
- Mobile responsive layout.
- API key remains server-only.

## Deployment Checklist

1. Push code to GitHub.
2. Import project into Vercel.
3. Add `OPENAI_API_KEY` and `OPENAI_MODEL`.
4. Deploy.
5. Smoke-test generation and copy behavior.
