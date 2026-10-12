"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { ChevronDown, LayoutDashboard, LogOut, UserRound, Menu, X } from "lucide-react";
import Logo from "./Logo";

const links = [
  { href: "/explore", label: "Explore" },
  { href: "/about", label: "How it works" },
];

export default function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuRef = useRef(null);

  // Close the account menu on outside click / Escape
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e) => menuRef.current && !menuRef.current.contains(e.target) && setMenuOpen(false);
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  useEffect(() => setMobileOpen(false), [pathname]);

  const username = session?.user?.username;

  return (
    <header className="sticky top-0 z-40 border-b border-lilac-line bg-white/90 backdrop-blur">
      <div className="container-x flex h-16 items-center justify-between">
        <Logo />

        <nav className="hidden items-center gap-7 text-[15px] font-medium text-ink-soft md:flex" aria-label="Primary">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`hover:text-ink ${pathname === l.href ? "text-ink" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {status === "loading" && <div className="h-10 w-28 animate-pulse rounded-full bg-lilac" />}

          {status === "unauthenticated" && (
            <>
              <Link href="/login" className="btn-ghost">Log in</Link>
              <Link href="/login" className="btn-marigold">Start a page</Link>
            </>
          )}

          {status === "authenticated" && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className="btn-ghost pl-2"
              >
                <Avatar src={session.user.image} name={session.user.name} />
                <span className="max-w-[140px] truncate">{session.user.name || username}</span>
                <ChevronDown size={16} className={`transition-transform ${menuOpen ? "rotate-180" : ""}`} />
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 overflow-hidden rounded-2xl border border-lilac-line bg-white p-1.5 shadow-lift"
                >
                  <MenuItem href="/dashboard" icon={LayoutDashboard} onClick={() => setMenuOpen(false)}>
                    Dashboard
                  </MenuItem>
                  {username && (
                    <MenuItem href={`/${username}`} icon={UserRound} onClick={() => setMenuOpen(false)}>
                      My public page
                    </MenuItem>
                  )}
                  <button
                    role="menuitem"
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-[15px] font-medium text-ink hover:bg-lilac"
                  >
                    <LogOut size={17} className="text-ink-soft" />
                    Log out
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <button
          type="button"
          className="btn-ghost h-10 w-10 !px-0 md:hidden"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-lilac-line bg-white md:hidden">
          <div className="container-x flex flex-col gap-1 py-3">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="rounded-xl px-3 py-2.5 font-medium hover:bg-lilac">
                {l.label}
              </Link>
            ))}
            {status === "authenticated" ? (
              <>
                <Link href="/dashboard" className="rounded-xl px-3 py-2.5 font-medium hover:bg-lilac">Dashboard</Link>
                {username && (
                  <Link href={`/${username}`} className="rounded-xl px-3 py-2.5 font-medium hover:bg-lilac">My public page</Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="rounded-xl px-3 py-2.5 text-left font-medium hover:bg-lilac"
                >
                  Log out
                </button>
              </>
            ) : (
              <Link href="/login" className="btn-marigold mt-2">Start a page</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function MenuItem({ href, icon: Icon, children, onClick }) {
  return (
    <Link
      role="menuitem"
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-[15px] font-medium text-ink hover:bg-lilac"
    >
      <Icon size={17} className="text-ink-soft" />
      {children}
    </Link>
  );
}

export function Avatar({ src, name, size = 28, className = "" }) {
  const initial = (name || "?").trim().charAt(0).toUpperCase();
  if (src) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" width={size} height={size} className={`rounded-full object-cover ${className}`} style={{ width: size, height: size }} />;
  }
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full bg-rose-pale font-bold text-rose ${className}`}
      style={{ width: size, height: size, fontSize: size * 0.45 }}
      aria-hidden="true"
    >
      {initial}
    </span>
  );
}
