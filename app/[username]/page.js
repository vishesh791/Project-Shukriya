import { notFound } from "next/navigation";
import { getCreator, getCreatorStats } from "@/actions/creator";
import { getTips } from "@/actions/payments";
import CreatorPage from "@/components/CreatorPage";
import { usernameSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const creator = await safeCreator(params.username);
  if (!creator) return { title: "Not found" };
  const name = creator.name || creator.username;
  return {
    title: `Say shukriya to ${name}`,
    description: creator.bio || `Leave a note and a small tip for ${name}.`,
    openGraph: {
      title: `Say shukriya to ${name}`,
      description: creator.bio || `Leave a note and a small tip for ${name}.`,
      images: creator.coverpic ? [creator.coverpic] : [],
    },
  };
}

async function safeCreator(username) {
  // Reject anything that can't be a username before touching the DB
  if (!usernameSchema.safeParse(username).success) return null;
  return getCreator(username);
}

export default async function Page({ params, searchParams }) {
  const creator = await safeCreator(params.username);
  if (!creator) notFound();

  const [stats, recent, top] = await Promise.all([
    getCreatorStats(creator.username),
    getTips(creator.username, "recent", 12),
    getTips(creator.username, "top", 12),
  ]);

  return (
    <CreatorPage
      creator={creator}
      stats={stats}
      recent={recent}
      top={top}
      justPaid={searchParams?.thanks === "1"}
    />
  );
}
