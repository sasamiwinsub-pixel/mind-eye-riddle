'use client';

interface TitleScreenProps {
  onStart: () => void;
}

export default function TitleScreen({ onStart }: TitleScreenProps) {
  return (
    <div className="relative mx-auto flex h-[100dvh] max-w-md flex-col overflow-hidden bg-slate-950 px-6 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-16 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute -right-20 bottom-20 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="absolute inset-x-0 top-1/3 h-px bg-gradient-to-r from-transparent via-cyan-300/30 to-transparent" />
      </div>

      <main className="relative z-10 flex flex-1 flex-col justify-center py-8">
        <div className="mb-10 text-center">
          <p className="mb-3 text-sm font-bold tracking-[0.4em] text-cyan-300">謎解きゲーム</p>
          <h1 className="text-5xl font-black tracking-[0.18em] text-white drop-shadow-[0_0_24px_rgba(34,211,238,0.35)]">
            ～心眼～
          </h1>
          <p className="mt-3 text-sm tracking-[0.5em] text-slate-400">MIND&apos;S EYE</p>
        </div>

        <section className="rounded-2xl border border-slate-700/80 bg-slate-900/75 p-5 shadow-2xl backdrop-blur">
          <h2 className="mb-4 flex items-center gap-2 font-bold text-amber-300">
            <span className="flex h-6 w-6 items-center justify-center rounded-full border border-amber-300/50 text-xs">!</span>
            注意事項
          </h2>
          <ul className="list-disc space-y-3 pl-5 text-sm leading-relaxed text-slate-200">
            <li>インターネット検索の必要はありませんが、していただいても構いません</li>
          </ul>

          <div className="mt-5 rounded-xl border border-dashed border-slate-600 bg-slate-950/50 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-bold text-slate-300">ヒントサイト</span>
              <span className="rounded-full bg-slate-700 px-2 py-1 text-[10px] font-bold text-slate-300">準備中</span>
            </div>
            <p className="mt-1 text-xs text-slate-500">リンクは現在準備中です</p>
          </div>
        </section>
      </main>

      <div className="relative z-10 pb-8">
        <button
          type="button"
          onClick={onStart}
          className="w-full rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-600 py-4 text-lg font-black tracking-wider text-white shadow-[0_0_28px_rgba(34,211,238,0.25)] transition-all hover:from-cyan-400 hover:to-indigo-500 active:scale-95"
        >
          はじめる
        </button>
      </div>
    </div>
  );
}
