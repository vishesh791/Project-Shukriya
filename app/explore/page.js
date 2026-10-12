import CreatorCard from "@/components/CreatorCard";
import Link from "next/link";
import { listCreators } from "@/actions/creator";

export const dynamic = "force-dynamic";
export const metadata = { title: "Explore creators" };

export default async function ExplorePage() {
  let creators = [];
  let dbError = false;
  try {
    creators = await listCreators(48);
  } catch {
    dbError = true;
  }

  return (
    <section className="container-x py-14 md:py-20">
      <h1 className="display text-[40px] leading-tight sm:text-[52px]">Creators on Shukriya</h1>
      <p className="mt-3 max-w-[56ch] text-lg text-ink-soft">
        Teachers, streamers, writers, open-source maintainers. Open a page, read what others wrote, leave your own shukriya.
      </p>

      {dbError && (
        <p className="mt-10 rounded-2xl bg-rose-pale p-5 text-rose">
          Couldn’t load creators right now. Check the database connection and try again.
        </p>
      )}

      {!dbError && creators.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-lilac-line p-10 text-center">
          <p className="text-lg font-semibold">No creators yet.</p>
          <Link href="/login" className="btn-primary mt-6">Be the first</Link>
        </div>
      )}

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {creators.map((c) => (
          <CreatorCard key={c.username} creator={c} />
        ))}
      </div>
    </section>
  );
}
