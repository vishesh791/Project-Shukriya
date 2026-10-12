import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t border-lilac-line bg-lilac">
      <div className="container-x flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-2">
          <Logo />
          <p className="max-w-sm text-sm text-ink-soft">
            A small thank-you goes a long way. Payments go straight to the creator through Razorpay — we never hold the money.
          </p>
        </div>
        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-ink-soft" aria-label="Footer">
          <Link href="/explore" className="hover:text-ink">Explore creators</Link>
          <Link href="/about" className="hover:text-ink">How it works</Link>
          <Link href="/login" className="hover:text-ink">Start a page</Link>
        </nav>
      </div>
      <div className="container-x pb-6 text-xs text-ink-mute">
        © {new Date().getFullYear()} Shukriya. Built with Next.js, MongoDB and Razorpay.
      </div>
    </footer>
  );
}
