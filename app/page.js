import Link from "next/link";
import NoteCard, { formatINR } from "@/components/NoteCard";
import CreatorCard from "@/components/CreatorCard";
import { listCreators } from "@/actions/creator";

export const dynamic = "force-dynamic";

const sampleNotes = [
  { name: "Riya S.", amount: 99, message: "Your Hindi grammar series got me through my board exam. Shukriya!", tilt: -3, delay: 0 },
  { name: "Arjun", amount: 250, message: "Three years of free DSA videos. This is the least I can do.", tilt: 2, delay: 120 },
  { name: "Meenal", amount: 50, message: "Chai for the late-night streams ☕", tilt: -1, delay: 240 },
];

const steps = [
  {
    title: "Sign in and claim your handle",
    body: "Log in with GitHub or Google. You get a page at shukriya/your-name in under a minute.",
  },
  {
    title: "Connect your own Razorpay account",
    body: "Paste your Razorpay Key ID and Secret. The secret is encrypted before it’s stored and never shown again.",
  },
  {
    title: "Share the link. Get paid directly.",
    body: "Supporters leave a note and pay by UPI, card or netbanking. Money lands in your Razorpay account — Shukriya never holds it.",
  },
];

export default async function HomePage() {
  let creators = [];
  try {
    creators = (await listCreators(6)).filter((c) => c.count > 0 || c.bio).slice(0, 3);
  } catch {
    // DB not reachable (e.g. first run without env) — the page still renders.
  }

  return (
    <>
      {/* Hero */}
      <section className="container-x grid items-center gap-12 py-16 md:grid-cols-[1.1fr_1fr] md:py-24">
        <div>
          <h1 className="display text-[44px] leading-[1.02] sm:text-[60px] md:text-[68px]">
            The nicest way to say thank you to a creator.
          </h1>
          <p className="mt-6 max-w-[52ch] text-lg text-ink-soft">
            Shukriya is a tipping page for Indian creators. Fans leave a short note and a small payment — ₹10, ₹99, whatever feels right. You keep every rupee; it goes straight to your Razorpay account.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/login" className="btn-marigold">Start your page</Link>
            <Link href="/explore" className="btn-ghost">See creators</Link>
          </div>
          <p className="mt-5 text-sm text-ink-mute">Free to use. No platform cut — only Razorpay’s standard fee.</p>
        </div>

        <div className="relative mx-auto w-full max-w-[380px] md:max-w-none" aria-hidden="true">
          <div className="absolute inset-x-6 -inset-y-4 rounded-[32px] bg-lilac" />
          <div className="relative flex flex-col gap-5 px-2 py-6 sm:px-6">
            {sampleNotes.map((n) => (
              <NoteCard key={n.name} {...n} />
            ))}
          </div>
        </div>
      </section>

      {/* How it works — a real sequence, so numbering is earned */}
      <section className="bg-lilac py-16 md:py-20">
        <div className="container-x">
          <h2 className="display text-[32px] leading-tight sm:text-[40px]">Up and running in three steps</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {steps.map((s, i) => (
              <li key={s.title} className="rounded-2xl bg-white p-6">
                <div className="display flex h-10 w-10 items-center justify-center rounded-full bg-marigold text-lg">{i + 1}</div>
                <h3 className="mt-5 text-xl font-bold leading-snug">{s.title}</h3>
                <p className="mt-2 text-[15px] text-ink-soft">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Creators */}
      <section className="container-x py-16 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="display text-[32px] leading-tight sm:text-[40px]">Creators on Shukriya</h2>
          <Link href="/explore" className="font-semibold underline decoration-marigold decoration-2 underline-offset-4">Explore all</Link>
        </div>

        {creators.length > 0 ? (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {creators.map((c) => (
              <CreatorCard key={c.username} creator={c} />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-lilac-line p-10 text-center">
            <p className="text-lg font-semibold">Be the first creator here.</p>
            <p className="mt-1 text-ink-soft">Your page appears on this list as soon as you add a bio.</p>
            <Link href="/login" className="btn-primary mt-6">Start your page</Link>
          </div>
        )}
      </section>

      {/* Why direct payouts */}
      <section className="container-x pb-20">
        <div className="grid gap-8 rounded-[28px] bg-ink px-8 py-12 text-white md:grid-cols-[1fr_auto] md:items-center md:px-14">
          <div>
            <h2 className="display text-[30px] leading-tight sm:text-[38px]">Your money never passes through us.</h2>
            <p className="mt-4 max-w-[56ch] text-white/75">
              Most tipping sites collect payments and settle with you later, minus a cut. Shukriya creates the Razorpay order on <em>your</em> account, so a {formatINR(100)} tip is {formatINR(100)} in your account the moment it clears.
            </p>
          </div>
          <Link href="/about" className="btn-marigold">How it works</Link>
        </div>
      </section>
    </>
  );
}
