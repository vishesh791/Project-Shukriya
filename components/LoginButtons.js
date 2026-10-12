"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";

function GitHubIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5A12 12 0 0 0 0 12.6c0 5.35 3.44 9.88 8.2 11.48.6.1.82-.27.82-.58v-2.2c-3.34.74-4.04-1.45-4.04-1.45-.55-1.4-1.33-1.78-1.33-1.78-1.09-.76.08-.74.08-.74 1.2.09 1.84 1.26 1.84 1.26 1.07 1.87 2.8 1.33 3.49 1.02.1-.8.42-1.33.76-1.64-2.66-.31-5.47-1.36-5.47-6.05 0-1.34.46-2.43 1.23-3.29-.12-.31-.53-1.56.12-3.25 0 0 1-.33 3.3 1.26a11.2 11.2 0 0 1 6 0c2.3-1.59 3.3-1.26 3.3-1.26.65 1.69.24 2.94.12 3.25.77.86 1.23 1.95 1.23 3.29 0 4.7-2.81 5.73-5.49 6.04.43.38.82 1.12.82 2.26v3.35c0 .32.21.69.82.58A12 12 0 0 0 24 12.6 12 12 0 0 0 12 .5Z" />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.8-5.5 3.8-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.9 1.5l2.6-2.5C16.9 3.1 14.7 2 12 2 6.5 2 2 6.5 2 12s4.5 10 10 10c5.8 0 9.6-4.1 9.6-9.8 0-.7-.1-1.2-.2-1.7H12Z" />
    </svg>
  );
}

export default function LoginButtons({ hasGoogle, callbackUrl }) {
  const [busy, setBusy] = useState("");

  const go = (provider) => {
    setBusy(provider);
    signIn(provider, { callbackUrl });
  };

  return (
    <div className="mt-8 flex flex-col gap-3">
      <button type="button" onClick={() => go("github")} disabled={!!busy} className="btn-primary w-full">
        <GitHubIcon />
        {busy === "github" ? "Opening GitHub…" : "Continue with GitHub"}
      </button>
      {hasGoogle && (
        <button type="button" onClick={() => go("google")} disabled={!!busy} className="btn-ghost w-full">
          <GoogleIcon />
          {busy === "google" ? "Opening Google…" : "Continue with Google"}
        </button>
      )}
    </div>
  );
}
