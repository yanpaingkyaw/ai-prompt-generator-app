# Design

## UX Direction

The app should feel like a practical writing tool, not a technical dashboard. The first screen should immediately show the prompt generator form and generated result area.

Use English interface labels with Burmese helper text where it improves clarity for beginner Myanmar users.

## Layout

- Full-width page with a constrained content area.
- Header explains the core value: Burmese ideas become clear English prompts.
- Two-column desktop layout:
  - Left: input form and controls.
  - Right: generated prompt preview/result.
- Single-column mobile layout:
  - Header.
  - Form.
  - Result.

## Form

Inputs:

- Burmese request textarea.
- Prompt category select.
- Target AI select.
- Tone select.
- Detail level select.

Actions:

- `Generate prompt`
- `Reset`
- `Use example`

States:

- Empty state: result panel explains where the generated prompt will appear.
- Loading state: generate button changes to `Generating...`.
- Error state: red bordered message under controls.
- Success state: structured prompt sections and final copy-ready prompt.

## Prompt Result

The generated result should show:

- Title.
- Optional warnings.
- Structured sections:
  - Role
  - Task
  - Context
  - Requirements
  - Output Format
  - Quality Criteria
- Final copy-ready prompt in a high-contrast block.
- Copy button with `Copied` feedback.

## Visual Style

- Light background.
- White form/result panels.
- Emerald accent for primary action and product identity.
- Slate text for readability.
- Rounded corners of 8px or less.
- No decorative hero art in v1; the actual app is the first screen.

## Accessibility

- Every form control has a label.
- Buttons use clear text.
- Focus styles are visible.
- Color is not the only error indicator.
- Layout avoids overlap on mobile.
