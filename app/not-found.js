import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container-x py-24 text-center">
      <p className="display text-[72px] leading-none text-marigold">404</p>
      <h1 className="display mt-4 text-[32px]">There’s no page here.</h1>
      <p className="mt-3 text-ink-soft">The creator may have changed their username, or the link was typed wrong.</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/explore" className="btn-primary">Browse creators</Link>
        <Link href="/" className="btn-ghost">Go home</Link>
      </div>
    </section>
  );
}
