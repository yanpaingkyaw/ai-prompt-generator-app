# Requirements

## Product Goal

Build a beginner-friendly web app for Myanmar/Burmese users who want help writing effective English prompts for generative AI tools.

The app accepts Myanmar/Burmese or mixed-language input and returns a structured English prompt that can be pasted into ChatGPT, Gemini, DeepSeek, Claude, or similar tools.

## Audience

- Beginner AI users.
- Myanmar/Burmese speakers who may not be comfortable writing detailed English prompts.
- Small business owners, students, creators, marketers, and general users who need practical AI prompts.

## Functional Requirements

- Users can type their request in Myanmar/Burmese.
- Users can select a prompt category:
  - General task
  - Writing
  - Coding
  - Image generation
  - Learning
  - Business
  - Marketing
  - Analysis
- Users can select a target AI tool:
  - General AI
  - ChatGPT
  - Gemini
  - DeepSeek
  - Claude
- Users can select tone and detail level.
- The app generates a structured English prompt with:
  - Role
  - Task
  - Context
  - Requirements
  - Output Format
  - Quality Criteria
  - Final Copy-Ready Prompt
- Users can copy the final prompt.
- Users can reset the form.
- Users see useful error messages for empty, invalid, or failed requests.

## Acceptance Criteria

- Burmese-only input can generate an English structured prompt.
- Mixed Burmese/English input can generate an English structured prompt.
- Empty input is rejected before calling the API.
- Input longer than 2,500 characters is rejected.
- The copy button copies only the final prompt.
- OpenAI API key is never exposed to browser code.
- The app works on desktop and mobile layouts.
- `npm run lint` passes.
- `npm run build` passes.

## Non-Functional Requirements

- Keep the MVP stateless.
- Keep the UI simple enough for beginner users.
- Keep OpenAI calls server-side.
- Avoid logging full user prompt text in production.
- Use TypeScript and schema validation for maintainability.
- Keep operating cost low by using a configurable model.

## Out Of Scope

- User accounts.
- Supabase or other database storage.
- Saved prompt history synced across devices.
- Billing or subscriptions.
- Direct API calls to Gemini, DeepSeek, or Claude.
- Admin dashboard.
