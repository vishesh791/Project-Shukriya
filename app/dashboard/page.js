import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { getMyProfile } from "@/actions/creator";
import Dashboard from "@/components/Dashboard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  // middleware.js already guards this route; this is a second, server-side check.
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login?callbackUrl=/dashboard");

  const data = await getMyProfile();
  if (data.error) redirect("/login");

  return <Dashboard initialProfile={data.profile} stats={data.stats} />;
}
