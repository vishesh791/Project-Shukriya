"use client";

import { useState } from "react";
import { Check, Share2 } from "lucide-react";
import toast from "react-hot-toast";

export default function ShareButton({ username, name }) {
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const url = `${window.location.origin}/${username}`;
    const text = `Say shukriya to ${name}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: text, text, url });
        return;
      } catch {
        // user cancelled — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Couldn’t copy. The link is in your address bar.");
    }
  };

  return (
    <button type="button" onClick={share} className="btn-ghost self-start">
      {copied ? <Check size={17} /> : <Share2 size={17} />}
      {copied ? "Copied" : "Share page"}
    </button>
  );
}
