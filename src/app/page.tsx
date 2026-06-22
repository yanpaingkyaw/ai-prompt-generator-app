import { PromptForm } from "@/components/prompt-form";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f7f4] text-slate-950">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex flex-col gap-5 border-b border-slate-200 pb-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
              Myanmar AI Prompt Generator
            </p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              Burmese ideas into clear English AI prompts.
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-700 sm:text-lg">
              မြန်မာလို ရေးထားတဲ့လိုအပ်ချက်ကို ChatGPT, Gemini, DeepSeek,
              Claude နဲ့ တခြား AI tools တွေမှာ သုံးလို့ရမယ့် English prompt
              အဖြစ် စနစ်တကျ ပြောင်းပေးတဲ့ beginner-friendly app ဖြစ်ပါတယ်။
            </p>
          </div>
          <div className="grid gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950 lg:w-80">
            <p className="font-semibold">V1 focus</p>
            <p>
              No login. No saved cloud history. Generate, copy, and use the
              prompt anywhere.
            </p>
          </div>
        </header>

        <PromptForm />
      </section>
    </main>
  );
}
