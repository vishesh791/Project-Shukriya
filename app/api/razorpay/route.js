import crypto from "crypto";
import { NextResponse } from "next/server";
import connectDb from "@/db/connectDb";
import Payment from "@/models/Payment";
import User from "@/models/User";
import { decrypt } from "@/lib/crypto";

export const dynamic = "force-dynamic";

/**
 * Razorpay Checkout redirects here (POST, form-encoded) after the user pays.
 *
 * Security: we never trust the redirect alone. Razorpay signs
 * `${order_id}|${payment_id}` with the creator's key secret; we recompute that
 * HMAC-SHA256 and compare in constant time. Only then is the payment marked done.
 */
export async function POST(req) {
  const form = await req.formData();
  const orderId = form.get("razorpay_order_id");
  const paymentId = form.get("razorpay_payment_id");
  const signature = form.get("razorpay_signature");

  const base = process.env.NEXT_PUBLIC_URL || new URL(req.url).origin;
  const fail = (reason) => NextResponse.redirect(`${base}/?payment=failed&reason=${encodeURIComponent(reason)}`, 303);

  if (!orderId || !paymentId || !signature) return fail("missing_fields");

  await connectDb();

  const payment = await Payment.findOne({ oid: orderId });
  if (!payment) return fail("order_not_found");

  const creator = await User.findOne({ username: payment.to_user }).select("razorpaysecret username").lean();
  if (!creator?.razorpaysecret) return fail("creator_not_configured");

  let secret;
  try {
    secret = decrypt(creator.razorpaysecret);
  } catch {
    return fail("creator_not_configured");
  }

  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const a = Buffer.from(expected, "utf8");
  const b = Buffer.from(String(signature), "utf8");
  const valid = a.length === b.length && crypto.timingSafeEqual(a, b);

  if (!valid) return fail("bad_signature");

  if (!payment.done) {
    payment.done = true;
    payment.pid = String(paymentId);
    await payment.save();
  }

  return NextResponse.redirect(`${base}/${creator.username}?thanks=1`, 303);
}
