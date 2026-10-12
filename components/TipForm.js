"use client";

import { useState } from "react";
import Script from "next/script";
import toast from "react-hot-toast";
import { createTipOrder } from "@/actions/payments";
import { tipSchema, fieldErrors } from "@/lib/validation";
import { formatINR } from "./NoteCard";

const PRESETS = [49, 99, 199, 499];

export default function TipForm({ creator }) {
  const [form, setForm] = useState({ name: "", message: "", amount: 99 });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [sdkReady, setSdkReady] = useState(false);

  const set = (k, v) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();

    // Client-side validation (same schema as the server)
    const parsed = tipSchema.safeParse(form);
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    if (!sdkReady || typeof window.Razorpay === "undefined") {
      toast.error("Payment window is still loading. Try again in a second.");
      return;
    }

    setBusy(true);
    const res = await createTipOrder(creator.username, parsed.data);
    if (res?.error) {
      setBusy(false);
      if (res.fields) setErrors(res.fields);
      toast.error(res.error);
      return;
    }

    const rzp = new window.Razorpay({
      key: res.keyId,
      amount: res.amount,
      currency: res.currency,
      order_id: res.orderId,
      name: "Shukriya",
      description: `Tip for ${res.creatorName}`,
      prefill: { name: parsed.data.name },
      notes: { message: parsed.data.message },
      theme: { color: "#2B1D3F" },
      // Razorpay POSTs the signed result here; the server verifies and redirects back.
      callback_url: `${process.env.NEXT_PUBLIC_URL || window.location.origin}/api/razorpay`,
      redirect: true,
      modal: { ondismiss: () => setBusy(false) },
    });
    rzp.on("payment.failed", (resp) => {
      setBusy(false);
      toast.error(resp?.error?.description || "Payment failed. Nothing was charged.");
    });
    rzp.open();
  };

  const amountNum = Number(form.amount);

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" onLoad={() => setSdkReady(true)} />

      <form onSubmit={submit} noValidate className="mt-5 rounded-2xl border border-lilac-line bg-white p-5 sm:p-6">
        <div>
          <label htmlFor="tip-name" className="label">Your name</label>
          <input
            id="tip-name"
            className={`field ${errors.name ? "field-error" : ""}`}
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="How should they know you?"
            maxLength={60}
            autoComplete="name"
          />
          {errors.name && <p className="error-text">{errors.name}</p>}
        </div>

        <div className="mt-4">
          <label htmlFor="tip-message" className="label">
            A note <span className="font-normal text-ink-mute">(optional)</span>
          </label>
          <textarea
            id="tip-message"
            className={`field min-h-[88px] resize-y ${errors.message ? "field-error" : ""}`}
            value={form.message}
            onChange={(e) => set("message", e.target.value)}
            placeholder="What did their work do for you?"
            maxLength={280}
          />
          <div className="flex justify-between">
            {errors.message ? <p className="error-text">{errors.message}</p> : <span />}
            <p className="hint">{form.message.length}/280</p>
          </div>
        </div>

        <div className="mt-4">
          <p className="label">Amount</p>
          <div className="grid grid-cols-4 gap-2">
            {PRESETS.map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => set("amount", p)}
                aria-pressed={amountNum === p}
                className={`rounded-xl border px-2 py-2.5 text-[15px] font-semibold transition-colors ${
                  amountNum === p ? "border-ink bg-ink text-white" : "border-lilac-line bg-white hover:bg-lilac"
                }`}
              >
                {formatINR(p)}
              </button>
            ))}
          </div>
          <div className="relative mt-2">
            <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 font-semibold text-ink-mute">₹</span>
            <input
              id="tip-amount"
              type="number"
              inputMode="numeric"
              min={10}
              max={100000}
              step={1}
              className={`field pl-9 ${errors.amount ? "field-error" : ""}`}
              value={form.amount}
              onChange={(e) => set("amount", e.target.value)}
              aria-label="Custom amount in rupees"
            />
          </div>
          {errors.amount ? <p className="error-text">{errors.amount}</p> : <p className="hint">Minimum ₹10. Whole rupees.</p>}
        </div>

        <button type="submit" disabled={busy} className="btn-marigold mt-6 w-full">
          {busy ? "Opening payment…" : `Send ${Number.isFinite(amountNum) && amountNum > 0 ? formatINR(amountNum) : "tip"} with a shukriya`}
        </button>
        <p className="mt-3 text-center text-xs text-ink-mute">
          UPI, cards, netbanking and wallets via Razorpay. Paid directly to {creator.name || creator.username}.
        </p>
      </form>
    </>
  );
}
