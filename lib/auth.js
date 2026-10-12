import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import connectDb from "@/db/connectDb";
import User from "@/models/User";
import { RESERVED_USERNAMES } from "@/lib/validation";

/** Build a URL-safe, unique username from an email like "nitesh.m@x.com" -> "nitesh_m". */
async function uniqueUsernameFromEmail(email) {
  let base = email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "_").slice(0, 20);
  if (base.length < 3) base = `creator_${base}`;
  if (RESERVED_USERNAMES.includes(base)) base = `${base}_1`;

  let candidate = base;
  let n = 1;
  // eslint-disable-next-line no-await-in-loop
  while (await User.exists({ username: candidate })) {
    n += 1;
    candidate = `${base}${n}`;
  }
  return candidate;
}

const providers = [
  GitHubProvider({
    clientId: process.env.GITHUB_ID,
    clientSecret: process.env.GITHUB_SECRET,
  }),
];

// Google is optional — only enabled when its keys are present.
if (process.env.GOOGLE_ID && process.env.GOOGLE_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    })
  );
}

export const authOptions = {
  providers,
  pages: { signIn: "/login" },
  session: { strategy: "jwt" },
  callbacks: {
    /** Runs on every login. Creates the creator profile on first sign-in. */
    async signIn({ user, account }) {
      if (!user?.email) return false;
      await connectDb();
      const existing = await User.findOne({ email: user.email.toLowerCase() });
      if (!existing) {
        await User.create({
          email: user.email.toLowerCase(),
          name: user.name || "",
          username: await uniqueUsernameFromEmail(user.email),
          profilepic: user.image || "",
          provider: account?.provider || "github",
        });
      }
      return true;
    },

    /** Put the DB username on the JWT so the session can expose it without a DB hit per request. */
    async jwt({ token, trigger }) {
      if (!token?.email) return token;
      if (!token.username || trigger === "update") {
        await connectDb();
        const dbUser = await User.findOne({ email: token.email }).select("username name").lean();
        if (dbUser) {
          token.username = dbUser.username;
          token.name = dbUser.name || token.name;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session?.user) {
        session.user.username = token.username;
        session.user.name = token.name;
      }
      return session;
    },
  },
};
