import Link from "next/link";

export const metadata = { title: "How it works" };

const faqs = [
  {
    q: "Does Shukriya take a cut?",
    a: "No. The Razorpay order is created on your own account, so the full tip (minus Razorpay’s standard processing fee) settles to your bank account on Razorpay’s normal schedule.",
  },
  {
    q: "What do supporters need?",
    a: "Nothing but a payment method. No account, no app. They type a name, an optional note and an amount, then pay with UPI, card, netbanking or a wallet through Razorpay Checkout.",
  },
  {
    q: "How is my Razorpay secret protected?",
    a: "It is encrypted with AES-256-GCM before it is written to the database, using a server-only key. It is decrypted only on the server, at the moment an order is created or a payment is verified, and it is never sent to any browser — including yours.",
  },
  {
    q: "How do you know a payment really happened?",
    a: "Razorpay signs every successful payment. After checkout we recompute that HMAC signature on the server with your secret and compare it in constant time. Only a verified payment shows up on your page.",
  },
  {
    q: "Can I change my username later?",
    a: "Yes, from the dashboard. Your old tips move with you so nothing on your page is lost.",
  },
];

export default function AboutPage() {
  return (
    <>
      <section className="container-x py-14 md:py-20">
        <h1 className="display max-w-[20ch] text-[40px] leading-[1.05] sm:text-[52px]">A tip jar that pays you directly.</h1>
        <p className="mt-5 max-w-[58ch] text-lg text-ink-soft">
          Shukriya is deliberately small. There are no tiers, no memberships, no locked posts. A creator gets a page; a fan leaves a note and some money. That’s the whole product.
        </p>
      </section>

      <section className="bg-lilac py-14 md:py-20">
        <div className="container-x grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="display text-[28px] leading-tight sm:text-[34px]">What happens when someone tips you</h2>
            <ol className="mt-6 space-y-5">
              {[
                ["A supporter fills in a name, note and amount on your page.", "The form is validated in the browser and again on the server."],
                ["The server creates a Razorpay order on your account.", "Your secret is decrypted in memory just for this call. A pending record is saved."],
                ["Razorpay Checkout opens in the supporter’s browser.", "They pay with UPI, card or netbanking. Shukriya never sees card details."],
                ["Razorpay redirects back with a signed result.", "The server verifies the signature and marks the tip as paid."],
                ["The note appears on your page.", "Your running total and supporter count update."],
              ].map(([title, body], i) => (
                <li key={title} className="flex gap-4">
                  <span className="display mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-marigold text-[15px]">{i + 1}</span>
                  <div>
                    <p className="font-bold">{title}</p>
                    <p className="text-[15px] text-ink-soft">{body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div>
            <h2 className="display text-[28px] leading-tight sm:text-[34px]">Questions people ask</h2>
            <dl className="mt-6 divide-y divide-lilac-line rounded-2xl bg-white">
              {faqs.map((f) => (
                <div key={f.q} className="p-5">
                  <dt className="font-bold">{f.q}</dt>
                  <dd className="mt-1.5 text-[15px] text-ink-soft">{f.a}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <section className="container-x py-14 text-center md:py-20">
        <h2 className="display text-[30px] leading-tight sm:text-[38px]">Ready to get your first shukriya?</h2>
        <Link href="/login" className="btn-marigold mt-6">Start your page</Link>
      </section>
    </>
  );
}
