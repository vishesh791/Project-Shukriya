import Link from "next/link";
import { Avatar } from "./Navbar";
import { formatINR } from "./NoteCard";

export default function CreatorCard({ creator }) {
  const { username, name, bio, profilepic, coverpic, total, count } = creator;
  return (
    <Link
      href={`/${username}`}
      className="group block overflow-hidden rounded-2xl border border-lilac-line bg-white transition-shadow hover:shadow-lift"
    >
      <div className="h-24 bg-lilac">
        {coverpic && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coverpic} alt="" className="h-full w-full object-cover" />
        )}
      </div>
      <div className="-mt-7 px-5 pb-5">
        <Avatar src={profilepic} name={name} size={56} className="ring-4 ring-white" />
        <h3 className="mt-3 text-lg font-bold leading-tight group-hover:underline group-hover:decoration-marigold group-hover:decoration-2 group-hover:underline-offset-4">{name}</h3>
        <p className="text-sm text-ink-mute">@{username}</p>
        {bio && <p className="mt-2 line-clamp-2 text-[15px] text-ink-soft">{bio}</p>}
        <p className="mt-4 text-sm text-ink-soft">
          {count > 0 ? (
            <>
              <span className="font-semibold text-ink">{formatINR(total)}</span> from {count} {count === 1 ? "supporter" : "supporters"}
            </>
          ) : (
            "No tips yet — be the first"
          )}
        </p>
      </div>
    </Link>
  );
}
