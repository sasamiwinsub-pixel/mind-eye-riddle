import type { Metadata } from 'next';
import RedirectToTop from '../RedirectToTop';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mind-eye-riddle.vercel.app';
const title = '心の眼で謎を解き明かしました';
const description = '心の眼で謎を解き明かしました。';
const imageUrl = '/images/clear.png';
const image = {
  url: imageUrl,
  alt: title,
  width: 1050,
  height: 781,
  type: 'image/png',
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  alternates: {
    canonical: '/share/clear',
  },
  openGraph: {
    title,
    description,
    url: '/share/clear',
    type: 'website',
    images: [image],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [image],
  },
};

export default function ClearSharePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-10 text-slate-100">
      <RedirectToTop />
      <section className="w-full max-w-md rounded-3xl border border-cyan-300/20 bg-slate-900/80 p-6 text-center shadow-2xl">
        <p className="text-xs font-black tracking-[0.35em] text-cyan-300">MIND&apos;S EYE</p>
        <h1 className="mt-3 text-2xl font-black text-white">ゲームページへ移動しています</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          自動で移動しない場合は、URLを開き直してください。
        </p>
      </section>
    </main>
  );
}
