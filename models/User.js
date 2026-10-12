import mongoose from "mongoose";

const { Schema, model, models } = mongoose;

const UserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, trim: true, maxlength: 60 },
    // Public handle used in the URL: shukriya.app/<username>
    username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    bio: { type: String, trim: true, maxlength: 220, default: "" },
    profilepic: { type: String, trim: true, default: "" },
    coverpic: { type: String, trim: true, default: "" },
    // Creator's own Razorpay credentials. Payments go straight to their account.
    razorpayid: { type: String, trim: true, default: "" },
    // Stored encrypted (AES-256-GCM) — see lib/crypto.js. Never sent to the client.
    razorpaysecret: { type: String, default: "" },
    provider: { type: String, default: "github" },
  },
  { timestamps: true }
);

export default models.User || model("User", UserSchema);
