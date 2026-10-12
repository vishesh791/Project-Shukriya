"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { updateMyProfile } from "@/actions/creator";
import { profileSchema, fieldErrors } from "@/lib/validation";
import { Avatar } from "./Navbar";
import { formatINR } from "./NoteCard";

export default function Dashboard({ initialProfile, stats }) {
  const router = useRouter();
  const { update: refreshSession } = useSession();
  const [form, setForm] = useState({ ...initialProfile, razorpaysecret: "" });
  const [errors, setErrors] = useState({});
  const [showSecret, setShowSecret] = useState(false);
  const [pending, startTransition] = useTransition();

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const parsed = profileSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      toast.error("Please fix the highlighted fields");
      return;
    }

    const fd = new FormData();
    Object.entries(parsed.data).forEach(([k, v]) => fd.append(k, v ?? ""));

    startTransition(async () => {
      const res = await updateMyProfile(fd);
      if (res?.error) {
        if (res.fields) setErrors(res.fields);
        toast.error(res.error);
        return;
      }
      toast.success("Changes saved");
      setForm((f) => ({ ...f, razorpaysecret: "", hasRazorpaySecret: f.hasRazorpaySecret || Boolean(parsed.data.razorpaysecret) }));
      if (res.usernameChanged) await refreshSession(); // put the new username on the JWT
      router.refresh();
    });
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/${initialProfile.username}`);
      toast.success("Link copied");
    } catch {
      toast.error("Couldn’t copy the link");
    }
  };

  const paymentsReady = Boolean(initialProfile.razorpayid && initialProfile.hasRazorpaySecret);

  return (
    <section className="container-x py-12 md:py-16">
      {/* Header */}
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar src={initialProfile.profilepic} name={initialProfile.name || initialProfile.username} size={64} />
          <div>
            <h1 className="display text-[30px] leading-none sm:text-[36px]">
              {initialProfile.name ? `Hi, ${initialProfile.name.split(" ")[0]}` : "Your dashboard"}
            </h1>
            <p className="mt-1 text-ink-mute">@{initialProfile.username}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={copyLink} className="btn-ghost">Copy page link</button>
          <Link href={`/${initialProfile.username}`} className="btn-primary">View my page</Link>
        </div>
      </div>

      {/* Stats */}
      <dl className="mt-10 grid gap-4 sm:grid-cols-3">
        <Stat label="Raised so far" value={formatINR(stats.total)} />
        <Stat label="Supporters" value={stats.count} />
        <Stat
          label="Payments"
          value={paymentsReady ? "Live" : "Not set up"}
          tone={paymentsReady ? "mint" : "rose"}
          note={paymentsReady ? "Supporters can tip you" : "Add Razorpay keys below"}
        />
      </dl>

      <form onSubmit={onSubmit} noValidate className="mt-12 grid gap-12 lg:grid-cols-[1fr_1fr]">
        {/* Profile */}
        <fieldset className="min-w-0">
          <legend className="display text-[24px] leading-tight">Your page</legend>
          <p className="mt-1 text-[15px] text-ink-soft">What visitors see at the top of your page.</p>

          <div className="mt-6 space-y-5">
            <Field id="name" label="Display name" error={errors.name}>
              <input id="name" className={cls(errors.name)} value={form.name} onChange={(e) => set("name", e.target.value)} maxLength={60} />
            </Field>

            <Field id="username" label="Username" error={errors.username} hint="Letters, numbers and underscores. Changing it moves your existing notes with you.">
              <div className="flex items-stretch">
                <span className="flex items-center rounded-l-xl border border-r-0 border-lilac-line bg-lilac px-3 text-sm text-ink-mute">shukriya/</span>
                <input id="username" className={`${cls(errors.username)} rounded-l-none`} value={form.username} onChange={(e) => set("username", e.target.value.toLowerCase())} maxLength={24} autoCapitalize="off" />
              </div>
            </Field>

            <Field id="bio" label="Bio" error={errors.bio} hint={`${form.bio?.length || 0}/220`}>
              <textarea id="bio" className={`${cls(errors.bio)} min-h-[88px] resize-y`} value={form.bio} onChange={(e) => set("bio", e.target.value)} maxLength={220} placeholder="What do you make, and who is it for?" />
            </Field>

            <Field id="profilepic" label="Profile picture URL" error={errors.profilepic}>
              <input id="profilepic" className={cls(errors.profilepic)} value={form.profilepic} onChange={(e) => set("profilepic", e.target.value)} placeholder="https://…" inputMode="url" />
            </Field>

            <Field id="coverpic" label="Cover image URL" error={errors.coverpic} hint="Wide images work best (about 3:1).">
              <input id="coverpic" className={cls(errors.coverpic)} value={form.coverpic} onChange={(e) => set("coverpic", e.target.value)} placeholder="https://…" inputMode="url" />
            </Field>

            <Field id="email" label="Email">
              <input id="email" className="field bg-lilac text-ink-soft" value={form.email} readOnly />
              <p className="hint">Comes from your login provider and can’t be changed here.</p>
            </Field>
          </div>
        </fieldset>

        {/* Payouts */}
        <fieldset className="min-w-0">
          <legend className="display text-[24px] leading-tight">Getting paid</legend>
          <p className="mt-1 text-[15px] text-ink-soft">
            Tips are charged on your own Razorpay account, so we need its API keys. Find them under Settings → API Keys in the Razorpay dashboard.
          </p>

          <div className="mt-6 space-y-5">
            <Field id="razorpayid" label="Razorpay Key ID" error={errors.razorpayid}>
              <input id="razorpayid" className={cls(errors.razorpayid)} value={form.razorpayid} onChange={(e) => set("razorpayid", e.target.value.trim())} placeholder="rzp_test_… or rzp_live_…" autoComplete="off" spellCheck={false} />
            </Field>

            <Field
              id="razorpaysecret"
              label="Razorpay Key Secret"
              error={errors.razorpaysecret}
              hint={form.hasRazorpaySecret ? "A secret is already saved. Leave blank to keep it, or paste a new one to replace it." : "Paste the secret shown once when you generate keys."}
            >
              <div className="relative">
                <input
                  id="razorpaysecret"
                  type={showSecret ? "text" : "password"}
                  className={`${cls(errors.razorpaysecret)} pr-12`}
                  value={form.razorpaysecret}
                  onChange={(e) => set("razorpaysecret", e.target.value.trim())}
                  placeholder={form.hasRazorpaySecret ? "••••••••••••••••" : ""}
                  autoComplete="new-password"
                  spellCheck={false}
                />
                <button
                  type="button"
                  onClick={() => setShowSecret((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-2 text-ink-mute hover:bg-lilac hover:text-ink"
                  aria-label={showSecret ? "Hide secret" : "Show secret"}
                >
                  {showSecret ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </Field>

            <div className="flex gap-3 rounded-2xl bg-mint-pale p-4 text-[14px] text-ink-soft">
              <ShieldCheck size={20} className="mt-0.5 shrink-0 text-mint" />
              <p>
                Your secret is encrypted (AES-256-GCM) before it’s stored and is only ever decrypted on the server to create an order or verify a payment. It is never sent back to any browser — which is why this field is blank even after saving.
              </p>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-4">
            <button type="submit" disabled={pending} className="btn-marigold">
              {pending ? "Saving…" : "Save changes"}
            </button>
            {pending && <span className="text-sm text-ink-mute">Hold on…</span>}
          </div>
        </fieldset>
      </form>
    </section>
  );
}

function cls(err) {
  return `field ${err ? "field-error" : ""}`;
}

function Field({ id, label, hint, error, children }) {
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      {children}
      {error ? <p className="error-text">{error}</p> : hint ? <p className="hint">{hint}</p> : null}
    </div>
  );
}

function Stat({ label, value, note, tone }) {
  const toneCls = tone === "mint" ? "text-mint" : tone === "rose" ? "text-rose" : "text-ink";
  return (
    <div className="rounded-2xl border border-lilac-line bg-white p-5">
      <dt className="text-sm text-ink-mute">{label}</dt>
      <dd className={`display mt-1 text-[30px] leading-none ${toneCls}`}>{value}</dd>
      {note && <dd className="mt-2 text-[13px] text-ink-soft">{note}</dd>}
    </div>
  );
}
