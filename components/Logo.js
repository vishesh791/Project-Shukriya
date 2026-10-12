import Link from "next/link";

/** Wordmark: a folded-hands glyph drawn as a simple two-leaf mark + the name. */
export default function Logo({ className = "" }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2 ${className}`} aria-label="Shukriya home">
      <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path d="M16 29c-6-4.5-11-10-11-15.5A6.5 6.5 0 0 1 16 10a6.5 6.5 0 0 1 11 3.5C27 19 22 24.5 16 29Z" fill="#F5B82E" />
        <path d="M16 10v19" stroke="#2B1D3F" strokeWidth="2.2" strokeLinecap="round" />
        <path d="M16 16c-2.2-1.4-4-1.6-6-1M16 20c-1.8-1.2-3.6-1.5-5.2-1M16 16c2.2-1.4 4-1.6 6-1M16 20c1.8-1.2 3.6-1.5 5.2-1" stroke="#2B1D3F" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <span className="display text-[22px] leading-none">shukriya</span>
    </Link>
  );
}
