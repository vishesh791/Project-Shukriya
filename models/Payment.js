import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

/**
 * One "shukriya" = one tip. A row is created in `pending` state when the Razorpay
 * order is generated, and flipped to `done` only after the payment signature has
 * been verified server-side in /api/razorpay.
 */
const PaymentSchema = new Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    message: { type: String, trim: true, maxlength: 280, default: "" },
    to_user: { type: String, required: true, index: true },
    // Razorpay order id (order_xxx)
    oid: { type: String, required: true, unique: true },
    // Razorpay payment id (pay_xxx) — set after successful verification
    pid: { type: String, default: "" },
    // Amount in rupees
    amount: { type: Number, required: true, min: 1 },
    done: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

PaymentSchema.index({ to_user: 1, done: 1, amount: -1 });
PaymentSchema.index({ to_user: 1, done: 1, createdAt: -1 });

export default models.Payment || model("Payment", PaymentSchema);
