import type { Metadata } from 'next';
import RedirectToTop from '../RedirectToTop';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mind-eye-riddle.vercel.app';
const title = '心の眼で全ての謎を解き明かしました';
const description = '心の眼で全ての謎を解き明かしました。';
const imageUrl = '/images/allclear.png';
const image = {
  url: imageUrl,
  alt: title,
  width: 1451,
  height: 1084,
  type: 'image/png',
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title,
  description,
  alternates: {
    canonical: '/share/allclear',
  },
  openGraph: {
    title,
    description,
    url: '/share/allclear',
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

export default function AllClearSharePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 py-10 text-slate-100">
      <RedirectToTop />
      <section className="w-full max-w-md rounded-3xl border border-amber-300/20 bg-slate-900/80 p-6 text-center shadow-2xl">
        <p className="text-xs font-black tracking-[0.35em] text-amber-300">MIND&apos;S EYE</p>
        <h1 className="mt-3 text-2xl font-black text-white">ゲームページへ移動しています</h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-300">
          自動で移動しない場合は、URLを開き直してください。
        </p>
      </section>
    </main>
  );
}
