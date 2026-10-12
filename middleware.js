export { default } from "next-auth/middleware";

/**
 * Routes listed here require a signed-in session. Unauthenticated users are
 * redirected to /login (configured in lib/auth.js `pages.signIn`) and brought
 * back afterwards via the callbackUrl query param.
 */
export const config = {
  matcher: ["/dashboard/:path*"],
};
