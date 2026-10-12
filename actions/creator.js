"use server";

import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import connectDb from "@/db/connectDb";
import User from "@/models/User";
import Payment from "@/models/Payment";
import { authOptions } from "@/lib/auth";
import { encrypt } from "@/lib/crypto";
import { profileSchema, fieldErrors } from "@/lib/validation";

/** Fields that are safe to send to any visitor's browser. */
const PUBLIC_FIELDS = "username name bio profilepic coverpic razorpayid createdAt";

/**
 * Public creator profile — what a visitor sees on /<username>.
 * Never includes razorpaysecret or email.
 */
export async function getCreator(username) {
  await connectDb();
  const user = await User.findOne({ username: String(username).toLowerCase() })
    .select(PUBLIC_FIELDS)
    .lean();
  if (!user) return null;
  return {
    ...user,
    _id: user._id.toString(),
    createdAt: user.createdAt?.toISOString?.() ?? null,
    acceptsPayments: Boolean(user.razorpayid),
  };
}

/** Aggregate stats for a creator page: total raised + supporter count. */
export async function getCreatorStats(username) {
  await connectDb();
  const [row] = await Payment.aggregate([
    { $match: { to_user: username, done: true } },
    { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
  ]);
  return { total: row?.total ?? 0, count: row?.count ?? 0 };
}

/** Creators list for /explore — with how much each has raised. */
export async function listCreators(limit = 24) {
  await connectDb();
  const creators = await User.find({})
    .select("username name bio profilepic coverpic createdAt")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  const usernames = creators.map((c) => c.username);
  const stats = await Payment.aggregate([
    { $match: { to_user: { $in: usernames }, done: true } },
    { $group: { _id: "$to_user", total: { $sum: "$amount" }, count: { $sum: 1 } } },
  ]);
  const byUser = Object.fromEntries(stats.map((s) => [s._id, s]));

  return creators.map((c) => ({
    username: c.username,
    name: c.name || c.username,
    bio: c.bio || "",
    profilepic: c.profilepic || "",
    coverpic: c.coverpic || "",
    total: byUser[c.username]?.total ?? 0,
    count: byUser[c.username]?.count ?? 0,
  }));
}

/**
 * The logged-in creator's own profile for the dashboard.
 * The secret itself is never returned — only whether one is saved.
 */
export async function getMyProfile() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Not signed in" };

  await connectDb();
  const user = await User.findOne({ email: session.user.email }).lean();
  if (!user) return { error: "Profile not found" };

  const stats = await getCreatorStats(user.username);

  return {
    profile: {
      name: user.name || "",
      email: user.email,
      username: user.username,
      bio: user.bio || "",
      profilepic: user.profilepic || "",
      coverpic: user.coverpic || "",
      razorpayid: user.razorpayid || "",
      hasRazorpaySecret: Boolean(user.razorpaysecret),
    },
    stats,
  };
}

/**
 * Update the logged-in creator's profile.
 * - Identity comes from the session, never from the form (so a user can't edit someone else).
 * - Input is validated with zod.
 * - Username changes are propagated to existing payments.
 * - Razorpay secret is encrypted before it's stored; blank keeps the old one.
 */
export async function updateMyProfile(formData) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return { error: "Not signed in" };

  const raw = Object.fromEntries(formData);
  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Please fix the highlighted fields", fields: fieldErrors(parsed.error) };
  }
  const data = parsed.data;

  await connectDb();
  const me = await User.findOne({ email: session.user.email });
  if (!me) return { error: "Profile not found" };

  const oldUsername = me.username;
  if (data.username !== oldUsername) {
    const taken = await User.exists({ username: data.username });
    if (taken) return { error: "That username is taken", fields: { username: "Already taken" } };
  }

  me.name = data.name;
  me.username = data.username;
  me.bio = data.bio;
  me.profilepic = data.profilepic;
  me.coverpic = data.coverpic;
  me.razorpayid = data.razorpayid;
  if (data.razorpaysecret) {
    me.razorpaysecret = encrypt(data.razorpaysecret);
  }
  await me.save();

  if (data.username !== oldUsername) {
    await Payment.updateMany({ to_user: oldUsername }, { $set: { to_user: data.username } });
    revalidatePath(`/${oldUsername}`);
  }
  revalidatePath(`/${data.username}`);
  revalidatePath("/explore");

  return { ok: true, username: data.username, usernameChanged: data.username !== oldUsername };
}
