"use server";

import Razorpay from "razorpay";
import connectDb from "@/db/connectDb";
import User from "@/models/User";
import Payment from "@/models/Payment";
import { decrypt } from "@/lib/crypto";
import { tipSchema, fieldErrors } from "@/lib/validation";

/**
 * Step 1 of a tip: validate input, create a Razorpay order on the *creator's*
 * account, and record a pending payment. Returns what the browser needs to open
 * Razorpay Checkout. The creator's secret never leaves the server.
 */
export async function createTipOrder(toUsername, input) {
  const parsed = tipSchema.safeParse(input);
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields", fields: fieldErrors(parsed.error) };
  }
  const { name, message, amount } = parsed.data;

  await connectDb();
  const creator = await User.findOne({ username: String(toUsername).toLowerCase() })
    .select("username name razorpayid razorpaysecret")
    .lean();

  if (!creator) return { error: "Creator not found" };
  if (!creator.razorpayid || !creator.razorpaysecret) {
    return { error: `${creator.name || creator.username} hasn't set up payments yet.` };
  }

  let secret;
  try {
    secret = decrypt(creator.razorpaysecret);
  } catch (e) {
    return { error: "Payment setup for this creator is misconfigured." };
  }

  const razorpay = new Razorpay({ key_id: creator.razorpayid, key_secret: secret });

  let order;
  try {
    order = await razorpay.orders.create({
      amount: amount * 100, // paise
      currency: "INR",
      notes: { to_user: creator.username, supporter: name },
    });
  } catch (e) {
    console.error("Razorpay order failed:", e?.error?.description || e?.message);
    return { error: "Couldn't start the payment. The creator's Razorpay keys may be invalid." };
  }

  await Payment.create({
    oid: order.id,
    amount,
    to_user: creator.username,
    name,
    message,
  });

  return {
    ok: true,
    orderId: order.id,
    amount: order.amount,
    currency: order.currency,
    keyId: creator.razorpayid,
    creatorName: creator.name || creator.username,
  };
}

/** Verified tips for a creator. mode = "top" (by amount) or "recent". */
export async function getTips(username, mode = "recent", limit = 10) {
  await connectDb();
  const sort = mode === "top" ? { amount: -1, createdAt: -1 } : { createdAt: -1 };
  const rows = await Payment.find({ to_user: username, done: true })
    .select("name message amount createdAt")
    .sort(sort)
    .limit(limit)
    .lean();
  return rows.map((p) => ({
    id: p._id.toString(),
    name: p.name,
    message: p.message,
    amount: p.amount,
    createdAt: p.createdAt?.toISOString?.() ?? null,
  }));
}
