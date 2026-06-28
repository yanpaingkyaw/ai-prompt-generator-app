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
      <aside className="flex min-h-[560px] min-w-0 flex-col justify-between rounded-lg border border-dashed border-[#d8d3ca] bg-white/75 p-6 shadow-[0_22px_48px_rgba(47,52,55,0.08)]">
        <div>
          <p className="text-sm font-bold uppercase text-[#787774]">
            Prompt Preview
          </p>
          <h2 className="mt-4 text-2xl font-bold text-[#2f3437]">
            Your English prompt will appear here.
          </h2>
          <p className="mt-3 break-words leading-7 text-[#6f6f6f]">
            မြန်မာလို ရေးပြီး Generate နှိပ်ပါ။ ရလာတဲ့ prompt ကို copy လုပ်ပြီး
            သင်နှစ်သက်တဲ့ AI tool ထဲမှာ paste လုပ်နိုင်ပါတယ်။
          </p>
        </div>
        <div className="rounded-lg border border-[#e4e0d9] bg-[#f1f1ef] p-4 text-sm leading-6 text-[#5f5e5b]">
          Tip: Include the audience, goal, tone, and output style in your
          Burmese request for a better prompt.
        </div>
      </aside>
    );
  }

  return (
    <aside className="min-w-0 overflow-hidden rounded-lg border border-[#e4e0d9] bg-white shadow-[0_22px_48px_rgba(47,52,55,0.1)]">
      <div className="flex flex-col gap-4 border-b border-[#e4e0d9] px-5 py-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-bold uppercase text-[#787774]">
            Generated Prompt
          </p>
          <h2 className="mt-1 text-2xl font-bold text-[#2f3437]">
            {result.title}
          </h2>
        </div>
        <button
          type="button"
          onClick={onCopy}
          className="rounded-md bg-[#2f3437] px-4 py-2.5 text-sm font-bold text-white transition hover:bg-[#1f2325]"
        >
          {copied ? "Copied" : "Copy prompt"}
        </button>
      </div>

      <div className="p-5">
        {result.warnings.length > 0 ? (
          <div className="mb-5 rounded-lg border border-[#e6c58d] bg-[#fbf3db] p-4 text-sm leading-6 text-[#7a4d00]">
            <p className="font-bold">Warnings</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              {result.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="grid gap-3">
          <Section label="Role" value={result.sections.role} tone="rose" />
          <Section label="Task" value={result.sections.task} tone="blue" />
          <Section label="Context" value={result.sections.context} tone="gray" />
          <ListSection
            label="Requirements"
            values={result.sections.requirements}
            tone="green"
          />
          <Section
            label="Output Format"
            value={result.sections.outputFormat}
            tone="orange"
          />
          <ListSection
            label="Quality Criteria"
            values={result.sections.qualityCriteria}
            tone="gray"
          />
        </div>

        <div className="mt-6">
          <div className="mb-2 flex items-center justify-between gap-3 text-sm font-bold text-[#6f6f6f]">
            <p>Final copy-ready prompt</p>
            <p>English</p>
          </div>
          <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap rounded-lg bg-[#2f3437] p-5 font-mono text-sm leading-6 text-[#f7f6f3]">
            {result.finalPrompt}
          </pre>
        </div>
      </div>
    </aside>
  );
}

type BlockTone = "blue" | "green" | "gray" | "orange" | "rose";

const toneClasses: Record<BlockTone, string> = {
  blue: "border-[#d8e1e8] bg-[#eef3f8]",
  green: "border-[#dbe6d8] bg-[#edf3ec]",
  gray: "border-[#e4e0d9] bg-[#f1f1ef]",
  orange: "border-[#eadbc8] bg-[#faedde]",
  rose: "border-[#e8dada] bg-[#f4eeee]",
};

function Section({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: BlockTone;
}) {
  return (
    <div className={`rounded-lg border p-4 ${toneClasses[tone]}`}>
      <p className="text-xs font-bold uppercase text-[#6f6f6f]">
        {label}
      </p>
      <p className="mt-2 leading-7 text-[#2f3437]">{value}</p>
    </div>
  );
}

function ListSection({
  label,
  values,
  tone,
}: {
  label: string;
  values: string[];
  tone: BlockTone;
}) {
  return (
    <div className={`rounded-lg border p-4 ${toneClasses[tone]}`}>
      <p className="text-xs font-bold uppercase text-[#6f6f6f]">
        {label}
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5 leading-7 text-[#2f3437]">
        {values.map((value) => (
          <li key={value}>{value}</li>
        ))}
      </ul>
    </div>
  );
}
