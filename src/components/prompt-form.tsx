"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  categoryLabels,
  detailLevelLabels,
  promptCategories,
  promptRequestSchema,
  promptTones,
  targetToolLabels,
  targetTools,
  toneLabels,
  type DetailLevel,
  type PromptCategory,
  type PromptRequest,
  type PromptResponse,
  type PromptTone,
  type TargetTool,
} from "@/lib/prompt-schema";
import { PromptResult } from "@/components/prompt-result";

const exampleRequest =
  "ကျွန်တော် online shop အတွက် Facebook post ရေးချင်တယ်။ Product က handmade bag ဖြစ်ပြီး လူငယ်မိန်းကလေးတွေကို target ထားချင်တယ်။";

export function PromptForm() {
  const [inputMyanmar, setInputMyanmar] = useState("");
  const [category, setCategory] = useState<PromptCategory>("general");
  const [targetTool, setTargetTool] = useState<TargetTool>("general");
  const [tone, setTone] = useState<PromptTone>("simple");
  const [detailLevel, setDetailLevel] = useState<DetailLevel>("balanced");
  const [result, setResult] = useState<PromptResponse | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const characterCount = inputMyanmar.trim().length;
  const canSubmit = useMemo(
    () => characterCount >= 10 && characterCount <= 2500 && !isLoading,
    [characterCount, isLoading],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setCopied(false);

    const payload: PromptRequest = {
      inputMyanmar,
      category,
      targetTool,
      tone,
      detailLevel,
    };

    const parsed = promptRequestSchema.safeParse(payload);

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your input.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/generate-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsed.data),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? "Prompt generation failed.");
      }

      setResult(data as PromptResponse);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Prompt generation failed.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function copyPrompt() {
    if (!result?.finalPrompt) {
      return;
    }

    await navigator.clipboard.writeText(result.finalPrompt);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  }

  function resetForm() {
    setInputMyanmar("");
    setCategory("general");
    setTargetTool("general");
    setTone("simple");
    setDetailLevel("balanced");
    setResult(null);
    setError("");
    setCopied(false);
  }

  return (
    <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
      <form
        onSubmit={handleSubmit}
        className="min-w-0 overflow-hidden rounded-lg border border-[#e4e0d9] bg-white shadow-[0_22px_48px_rgba(47,52,55,0.1)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#e4e0d9] px-5 py-5">
          <div>
            <h2 className="text-2xl font-bold text-[#2f3437]">Your idea</h2>
            <p className="mt-1 text-sm leading-6 text-[#6f6f6f]">
              Write naturally in Myanmar/Burmese.
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full border px-3 py-2 font-mono text-xs font-bold ${
              characterCount > 2500
                ? "border-[#dfabab] bg-[#f4eeee] text-[#a54848]"
                : "border-[#dbe6d8] bg-[#edf3ec] text-[#2f6f4f]"
            }`}
          >
            {characterCount} / 2500
          </span>
        </div>

        <div className="min-w-0 p-5">
          <div>
            <label
              htmlFor="inputMyanmar"
              className="text-sm font-bold text-[#2f3437]"
            >
              Your idea in Myanmar/Burmese
            </label>
            <p className="mt-1 text-sm leading-6 text-[#787774]">
              မြန်မာလို သင်လိုချင်တာကို ရိုးရိုးရှင်းရှင်းရေးပါ။
            </p>
            <textarea
              id="inputMyanmar"
              value={inputMyanmar}
              onChange={(event) => setInputMyanmar(event.target.value)}
              placeholder={exampleRequest}
              rows={9}
              className="mt-3 w-full min-w-0 rounded-md border border-[#e4e0d9] bg-white px-4 py-3 leading-7 text-[#2f3437] outline-none transition placeholder:text-[#8f8d89] focus:border-[#337ea9] focus:ring-4 focus:ring-[#337ea9]/10"
            />
            <div className="mt-2 flex flex-col gap-2 text-xs text-[#6f6f6f] sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <button
                type="button"
                onClick={() => setInputMyanmar(exampleRequest)}
                className="font-bold text-[#337ea9] transition hover:text-[#2b6688]"
              >
                Use example
              </button>
              <span>Better prompt needs goal, audience, and tone</span>
            </div>
          </div>

          <div className="mt-6 grid min-w-0 gap-4 sm:grid-cols-2">
            <SelectField
              id="category"
              label="Prompt category"
              value={category}
              onChange={(value) => setCategory(value as PromptCategory)}
              options={promptCategories.map((value) => ({
                value,
                label: categoryLabels[value],
              }))}
            />
            <SelectField
              id="targetTool"
              label="Target AI"
              value={targetTool}
              onChange={(value) => setTargetTool(value as TargetTool)}
              options={targetTools.map((value) => ({
                value,
                label: targetToolLabels[value],
              }))}
            />
            <SelectField
              id="tone"
              label="Tone"
              value={tone}
              onChange={(value) => setTone(value as PromptTone)}
              options={promptTones.map((value) => ({
                value,
                label: toneLabels[value],
              }))}
            />
            <SelectField
              id="detailLevel"
              label="Detail level"
              value={detailLevel}
              onChange={(value) => setDetailLevel(value as DetailLevel)}
              options={(["short", "balanced", "detailed"] as DetailLevel[]).map(
                (value) => ({
                  value,
                  label: detailLevelLabels[value],
                }),
              )}
            />
          </div>

          {error ? (
            <div className="mt-5 rounded-lg border border-[#dfabab] bg-[#f4eeee] p-4 text-sm leading-6 text-[#8f3d3d]">
              {error}
            </div>
          ) : null}

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={!canSubmit}
              className="rounded-md bg-[#337ea9] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#2b6688] disabled:cursor-not-allowed disabled:bg-[#d8d6d1] disabled:text-[#787774]"
            >
              {isLoading ? "Generating..." : "Generate prompt"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-md border border-[#e4e0d9] bg-white px-5 py-3 text-sm font-bold text-[#2f3437] transition hover:bg-[#f7f6f3]"
            >
              Reset
            </button>
          </div>

          <div className="mt-6 rounded-lg border border-[#e4e0d9] bg-[#f1f1ef] p-4 text-sm leading-6 text-[#5f5e5b]">
            <p>
              <span className="font-bold text-[#2f3437]">
                Good input includes:
              </span>{" "}
              goal, audience, topic, preferred style, and what output you want
              from the AI.
            </p>
          </div>
        </div>
      </form>

      <PromptResult result={result} copied={copied} onCopy={copyPrompt} />
    </div>
  );
}

type SelectFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
};

function SelectField({
  id,
  label,
  value,
  onChange,
  options,
}: SelectFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-bold text-[#2f3437]">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full max-w-full rounded-md border border-[#e4e0d9] bg-white px-3 py-3 text-[#2f3437] outline-none transition focus:border-[#337ea9] focus:ring-4 focus:ring-[#337ea9]/10"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
