import { z } from "zod";

// Routes that exist in the app and therefore can't be used as a creator handle.
export const RESERVED_USERNAMES = [
  "about", "api", "dashboard", "explore", "login", "logout", "admin",
  "settings", "help", "terms", "privacy", "shukriya", "_next", "favicon.ico",
];

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, "Username needs at least 3 characters")
  .max(24, "Username can be at most 24 characters")
  .regex(/^[a-z0-9_]+$/, "Only letters, numbers and underscores")
  .refine((u) => !RESERVED_USERNAMES.includes(u), "That username is reserved");

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .refine((v) => v === "" || /^https?:\/\//i.test(v), "Must start with http:// or https://")
  .optional()
  .default("");

export const profileSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(60),
  username: usernameSchema,
  bio: z.string().trim().max(220, "Bio can be at most 220 characters").optional().default(""),
  profilepic: optionalUrl,
  coverpic: optionalUrl,
  razorpayid: z
    .string()
    .trim()
    .max(64)
    .refine((v) => v === "" || /^rzp_(test|live)_[A-Za-z0-9]+$/.test(v), "Looks like an invalid Razorpay Key ID (rzp_test_... / rzp_live_...)")
    .optional()
    .default(""),
  // Blank means "keep the existing secret".
  razorpaysecret: z.string().trim().max(128).optional().default(""),
});

export const tipSchema = z.object({
  name: z.string().trim().min(2, "Tell the creator who you are (2+ characters)").max(60),
  message: z.string().trim().max(280, "Keep the note under 280 characters").optional().default(""),
  // Rupees
  amount: z.coerce
    .number({ invalid_type_error: "Enter an amount in rupees" })
    .int("Whole rupees only")
    .min(10, "Minimum tip is ₹10")
    .max(100000, "Maximum tip is ₹1,00,000"),
});

/** Turn a ZodError into a { field: message } map for forms. */
export function fieldErrors(zodError) {
  const out = {};
  for (const issue of zodError.issues) {
    const key = issue.path[0] ?? "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
