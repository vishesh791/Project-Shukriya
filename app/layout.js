// Self-hosted variable font (no request to Google at build or run time)
import "@fontsource-variable/bricolage-grotesque/standard.css";
import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Toaster from "@/components/Toaster";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || "http://localhost:3000"),
  title: {
    default: "Shukriya — thank the creators you love",
    template: "%s · Shukriya",
  },
  description:
    "Shukriya lets fans send a note and a small tip to the creators they follow. Creators get paid straight into their own Razorpay account.",
  openGraph: {
    title: "Shukriya — thank the creators you love",
    description: "Send a note and a small tip. Creators get paid directly.",
    siteName: "Shukriya",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col font-sans">
        <SessionWrapper>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster />
        </SessionWrapper>
      </body>
    </html>
  );
}
