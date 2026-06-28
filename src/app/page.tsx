import { PromptForm } from "@/components/prompt-form";

export default function Home() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-[#f7f6f3] text-[#2f3437]">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_12%_4%,rgba(51,126,169,0.12),transparent_30%),radial-gradient(circle_at_90%_82%,rgba(217,115,13,0.1),transparent_24%)]" />
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-7 px-5 py-6 sm:px-8 lg:px-10">
        <nav className="flex flex-col gap-4 border-b border-[#e4e0d9] pb-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center rounded-md bg-[#2f3437] font-mono text-sm font-bold text-[#f7f6f3] shadow-[0_12px_28px_rgba(47,52,55,0.12)]">
              AI
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-semibold">
                Myanmar Prompt Generator
              </p>
              <p className="mt-0.5 text-sm text-[#787774]">
                Burmese input to English AI prompts
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-sm text-[#5f5e5b]">
            <span className="rounded-full border border-[#e4e0d9] bg-white/70 px-3 py-2">
              Notion Modern
            </span>
            <span className="rounded-full border border-[#e4e0d9] bg-white/70 px-3 py-2">
              No login
            </span>
            <span className="rounded-full border border-[#e4e0d9] bg-white/70 px-3 py-2">
              Copy ready
            </span>
          </div>
        </nav>

        <header className="grid min-w-0 gap-6 border-b border-[#e4e0d9] pb-7 lg:grid-cols-[minmax(0,1fr)_20.5rem] lg:items-end">
          <div className="min-w-0 max-w-3xl">
            <p className="text-sm font-bold uppercase text-[#787774]">
              Myanmar AI Prompt Generator
            </p>
            <h1 className="mt-4 max-w-full break-words text-3xl font-bold leading-[1.12] text-[#2f3437] sm:text-5xl sm:leading-[1.06] lg:text-6xl">
              Burmese ideas into{" "}
              <span className="text-[#337ea9]">clear English</span> AI prompt
              blocks.
            </h1>
            <p className="mt-5 max-w-3xl break-words text-base leading-8 text-[#6f6f6f] sm:text-lg">
              မြန်မာလို ရေးထားတဲ့လိုအပ်ချက်ကို ChatGPT, Gemini, DeepSeek,
              Claude နဲ့ တခြား AI tools တွေမှာ သုံးလို့ရမယ့် English prompt
              အဖြစ် စနစ်တကျ ပြောင်းပေးတဲ့ beginner-friendly app ဖြစ်ပါတယ်။
            </p>
          </div>
          <div className="min-w-0 rounded-lg border border-[#e4e0d9] bg-white/80 p-4 shadow-[0_22px_48px_rgba(47,52,55,0.1)] backdrop-blur">
            <p className="text-sm font-semibold text-[#2f3437]">V1 focus</p>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
              <Metric value="1" label="idea input" />
              <Metric value="4" label="simple controls" />
              <Metric value="0" label="login required" />
            </div>
          </div>
        </header>

        <PromptForm />
      </section>
    </main>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="min-h-18 min-w-0 rounded-md border border-[#dedad2] bg-[#f1f1ef] p-3">
      <p className="font-mono text-xl font-bold text-[#448361]">{value}</p>
      <p className="mt-1 break-words text-xs leading-4 text-[#5f5e5b]">
        {label}
      </p>
    </div>
  );
}
