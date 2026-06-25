import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import RedirectToTop from '../RedirectToTop';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const title = '心の眼で謎を解き明かしました';
const description = '心の眼で謎を解き明かしました。';
const imageUrl = '/images/clear.png';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  openGraph: {
    title,
    description,
    images: [{ url: imageUrl, alt: title }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [imageUrl],
  },
};

export default function ClearSharePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-10 text-slate-100">
      <RedirectToTop />
      <section className="w-full max-w-md rounded-3xl border border-cyan-300/20 bg-slate-900/80 p-6 text-center shadow-2xl">
        <p className="mb-3 text-xs font-black tracking-[0.35em] text-cyan-300">GAME CLEAR</p>
        <div className="relative mx-auto aspect-square w-full max-w-sm">
          <Image src={imageUrl} alt={title} fill priority sizes="(max-width: 448px) 100vw, 384px" className="object-contain" />
        </div>
        <h1 className="mt-4 text-2xl font-black text-white">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          ゲームクリアおめでとうございます。
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl border border-cyan-300/40 bg-cyan-500/15 px-5 py-3 text-sm font-black text-cyan-100 transition-colors hover:bg-cyan-500/25"
        >
          ゲームへ
        </Link>
      </section>
    </main>
  );
}
