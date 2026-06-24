import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import RedirectToTop from '../RedirectToTop';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const title = '心の眼で全ての謎を解き明かしました';
const description = '心の眼で全ての謎を解き明かしました。';
const imageUrl = '/images/allclear.png';

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

export default function AllClearSharePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-10 text-slate-100">
      <RedirectToTop />
      <section className="w-full max-w-md rounded-3xl border border-amber-300/20 bg-slate-900/80 p-6 text-center shadow-2xl">
        <p className="mb-3 text-xs font-black tracking-[0.35em] text-amber-300">ALL CLEAR</p>
        <div className="relative mx-auto aspect-square w-full max-w-sm">
          <Image src={imageUrl} alt={title} fill priority className="object-contain" />
        </div>
        <h1 className="mt-4 text-2xl font-black text-white">{title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          おまけまで含めて、すべての再提出を完了しました。
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-xl border border-amber-300/40 bg-amber-500/15 px-5 py-3 text-sm font-black text-amber-100 transition-colors hover:bg-amber-500/25"
        >
          ゲームへ
        </Link>
      </section>
    </main>
  );
}
