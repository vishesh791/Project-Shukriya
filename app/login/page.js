import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import LoginButtons from "@/components/LoginButtons";
import NoteCard from "@/components/NoteCard";

export const metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }) {
  const session = await getServerSession(authOptions);
  if (session) redirect(searchParams?.callbackUrl || "/dashboard");

  const hasGoogle = Boolean(process.env.GOOGLE_ID && process.env.GOOGLE_SECRET);
  const error = searchParams?.error;

  return (
    <section className="container-x grid min-h-[70vh] items-center gap-12 py-16 md:grid-cols-2">
      <div className="max-w-md">
        <h1 className="display text-[40px] leading-[1.05] sm:text-[48px]">Log in to Shukriya</h1>
        <p className="mt-4 text-ink-soft">
          One click with an account you already have. We only store your name, email and avatar to create your page.
        </p>

        {error && (
          <p className="mt-6 rounded-xl bg-rose-pale px-4 py-3 text-sm font-medium text-rose" role="alert">
            {error === "OAuthAccountNotLinked"
              ? "This email is already registered with a different provider. Use that one to log in."
              : "Login didn’t go through. Try again."}
          </p>
        )}

        <LoginButtons hasGoogle={hasGoogle} callbackUrl={searchParams?.callbackUrl || "/dashboard"} />

        <p className="mt-6 text-sm text-ink-mute">
          New here? Logging in creates your creator page automatically.
        </p>
      </div>

      <div className="hidden md:block" aria-hidden="true">
        <div className="relative mx-auto max-w-sm">
          <div className="absolute -inset-4 rounded-[28px] bg-lilac" />
          <div className="relative space-y-5 p-6">
            <NoteCard name="Kabir" amount={199} message="Thanks for answering my PR review question at 1am." tilt={-2} />
            <NoteCard name="Anu" amount={49} message="Chai on me ☕" tilt={2} delay={120} />
          </div>
        </div>
      </div>
    </section>
  );
}
