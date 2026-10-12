"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { Avatar } from "./Navbar";
import NoteCard, { formatINR, timeAgo } from "./NoteCard";
import TipForm from "./TipForm";
import ShareButton from "./ShareButton";

export default function CreatorPage({ creator, stats, recent, top, justPaid }) {
  const router = useRouter();
  const [tab, setTab] = useState("recent");
  const name = creator.name || creator.username;

  // After Razorpay redirects back with ?thanks=1: thank the supporter, clean the URL.
  useEffect(() => {
    if (justPaid) {
      toast.success(`Your shukriya reached ${name}. Thank you!`);
      router.replace(`/${creator.username}`, { scroll: false });
    }
  }, [justPaid, name, creator.username, router]);

  const tips = tab === "recent" ? recent : top;

  return (
    <>
      {/* Cover + identity. Left-aligned, so it reads like a profile, not a banner ad. */}
      <div className="h-44 bg-lilac sm:h-60 md:h-72">
        {creator.coverpic && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={creator.coverpic} alt="" className="h-full w-full object-cover" />
        )}
      </div>

      <section className="container-x">
        <div className="-mt-12 flex flex-col gap-5 sm:-mt-14 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            <Avatar src={creator.profilepic} name={name} size={104} className="shrink-0 ring-4 ring-white" />
            <div className="pb-1">
              <h1 className="display text-[30px] leading-none sm:text-[36px]">{name}</h1>
              <p className="mt-1 text-ink-mute">@{creator.username}</p>
            </div>
          </div>
          <ShareButton username={creator.username} name={name} />
        </div>

        {creator.bio && <p className="mt-5 max-w-[60ch] text-lg text-ink-soft">{creator.bio}</p>}

        <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-3">
          <div>
            <dt className="text-sm text-ink-mute">Raised so far</dt>
            <dd className="display text-[28px] leading-none">{formatINR(stats.total)}</dd>
          </div>
          <div>
            <dt className="text-sm text-ink-mute">Supporters</dt>
            <dd className="display text-[28px] leading-none">{stats.count}</dd>
          </div>
        </dl>
      </section>

      <section className="container-x my-12 grid gap-10 md:my-16 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:gap-14">
        {/* Primary action first on mobile, left on desktop */}
        <div>
          <h2 className="display text-[26px] leading-tight">Send a shukriya to {name}</h2>
          {creator.acceptsPayments ? (
            <TipForm creator={creator} />
          ) : (
            <div className="mt-5 rounded-2xl bg-lilac p-6">
              <p className="font-semibold">{name} hasn’t connected payments yet.</p>
              <p className="mt-1 text-[15px] text-ink-soft">
                Once they add their Razorpay keys from the dashboard, you’ll be able to tip here.
              </p>
            </div>
          )}
        </div>

        {/* Notes wall */}
        <div>
          <div className="flex items-center justify-between">
            <h2 className="display text-[26px] leading-tight">Notes from supporters</h2>
            <div role="tablist" aria-label="Sort notes" className="flex rounded-full bg-lilac p-1 text-sm font-semibold">
              {["recent", "top"].map((t) => (
                <button
                  key={t}
                  role="tab"
                  aria-selected={tab === t}
                  onClick={() => setTab(t)}
                  className={`rounded-full px-3.5 py-1.5 capitalize transition-colors ${tab === t ? "bg-white shadow-sm" : "text-ink-soft hover:text-ink"}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {tips.length === 0 ? (
            <div className="mt-6 rounded-2xl border border-dashed border-lilac-line p-8 text-center">
              <p className="font-semibold">No notes yet.</p>
              <p className="mt-1 text-[15px] text-ink-soft">Yours would be the first one on this wall.</p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.ul
                key={tab}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className="mt-8 space-y-6"
              >
                {tips.map((t, i) => (
                  <li key={t.id}>
                    <NoteCard
                      name={t.name}
                      amount={t.amount}
                      message={t.message}
                      when={timeAgo(t.createdAt)}
                      tilt={i % 2 === 0 ? -1 : 1}
                      delay={Math.min(i, 6) * 60}
                    />
                  </li>
                ))}
              </motion.ul>
            </AnimatePresence>
          )}
        </div>
      </section>
    </>
  );
}
