/**
 * A "shukriya note": what a supporter leaves behind.
 * Used in the hero (sample notes) and on creator pages (real tips).
 */
export function formatINR(n) {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n || 0);
}

export function timeAgo(iso) {
  if (!iso) return "";
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)} days ago`;
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

export default function NoteCard({ name, amount, message, when, tilt = 0, delay = 0, className = "" }) {
  return (
    <article
      className={`note animate-note-in ${className}`}
      style={{ "--tilt": `${tilt}deg`, animationDelay: `${delay}ms` }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="font-bold leading-tight">{name}</p>
        <p className="shrink-0 rounded-full bg-marigold-pale px-2.5 py-0.5 text-sm font-bold text-ink">{formatINR(amount)}</p>
      </div>
      {message ? (
        <p className="mt-2 text-[15px] leading-snug text-ink-soft">“{message}”</p>
      ) : (
        <p className="mt-2 text-[15px] italic leading-snug text-ink-mute">Sent without a note</p>
      )}
      {when && <p className="mt-3 text-xs text-ink-mute">{when}</p>}
    </article>
  );
}
