"use client";

import type { PromptResponse } from "@/lib/prompt-schema";

type PromptResultProps = {
  result: PromptResponse | null;
  copied: boolean;
  onCopy: () => void;
};

export function PromptResult({ result, copied, onCopy }: PromptResultProps) {
  if (!result) {
    return (
      <aside className="flex min-h-[560px] flex-col justify-between rounded-lg border border-dashed border-slate-300 bg-white p-6">
        <div>
          <p className="text-sm font-semibold text-slate-500">Prompt Preview</p>
          <h2 className="mt-4 text-2xl font-semibold text-slate-950">
            Your English prompt will appear here.
          </h2>
          <p className="mt-3 leading-7 text-slate-600">
            မြန်မာလို ရေးပြီး Generate နှိပ်ပါ။ ရလာတဲ့ prompt ကို copy လုပ်ပြီး
            သင်နှစ်သက်တဲ့ AI tool ထဲမှာ paste လုပ်နိုင်ပါတယ်။
          </p>
        </div>
        <div className="rounded-lg bg-slate-50 p-4 text-sm leading-6 text-slate-600">
          Tip: Include the audience, goal, tone, and output style in your
          Burmese request for a better prompt.
        </div>
      </aside>
    );
  }

  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
            Generated Prompt
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">
            {result.title}
          </h2>
        </div>
        <button
          type="button"
          onClick={onCopy}
          className="rounded-md bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          {copied ? "Copied" : "Copy prompt"}
        </button>
      </div>

      {result.warnings.length > 0 ? (
        <div className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Warnings</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {result.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-5 grid gap-4">
        <Section label="Role" value={result.sections.role} />
        <Section label="Task" value={result.sections.task} />
        <Section label="Context" value={result.sections.context} />
        <ListSection label="Requirements" values={result.sections.requirements} />
        <Section label="Output Format" value={result.sections.outputFormat} />
        <ListSection
          label="Quality Criteria"
          values={result.sections.qualityCriteria}
        />
      </div>

      <div className="mt-6">
        <p className="mb-2 text-sm font-semibold text-slate-700">
          Final Copy-Ready Prompt
        </p>
        <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap rounded-lg bg-slate-950 p-5 font-mono text-sm leading-6 text-slate-50">
          {result.finalPrompt}
        </pre>
      </div>
    </aside>
  );
}

function Section({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 leading-7 text-slate-800">{value}</p>
    </div>
  );
}

function ListSection({ label, values }: { label: string; values: string[] }) {
  return (
    <div className="rounded-lg bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5 leading-7 text-slate-800">
        {values.map((value) => (
          <li key={value}>{value}</li>
        ))}
      </ul>
    </div>
  );
}
