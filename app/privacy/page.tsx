import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main className="app-page">
      <section className="app-container max-w-4xl">
        <Link href="/" className="text-sm text-[var(--app-accent-gold)]">
          Back to BookCircle
        </Link>
        <article className="app-surface mt-6 space-y-6 rounded-2xl p-5 sm:p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--app-accent-gold)]">
              MVP policy
            </p>
            <h1 className="mt-2 font-serif text-4xl">Privacy Policy</h1>
            <p className="mt-3 text-sm text-[var(--app-text-muted)]">
              Last updated July 21, 2026
            </p>
          </div>

          <p className="leading-7 text-[var(--app-text-secondary)]">
            BookCircle collects the minimum account and club information needed
            to run reading circles: your email, username, profile details you
            add, club memberships, reading progress, discussions, votes,
            notifications, and uploaded images.
          </p>

          <h2 className="font-serif text-2xl">How We Use Data</h2>
          <p className="leading-7 text-[var(--app-text-secondary)]">
            We use this information to authenticate you, show your clubs,
            support reading cycles, run discussions and votes, deliver in-app
            notifications, prevent abuse, and understand basic product usage.
            We do not sell personal data.
          </p>

          <h2 className="font-serif text-2xl">Content And Analytics</h2>
          <p className="leading-7 text-[var(--app-text-secondary)]">
            Lightweight analytics track product events such as account creation,
            club joins, vote submissions, and feedback submissions. Analytics
            should not include private reading content, chat messages, quote
            text, passwords, tokens, or secrets.
          </p>

          <h2 className="font-serif text-2xl">Security</h2>
          <p className="leading-7 text-[var(--app-text-secondary)]">
            Authentication uses HTTP-only cookies, hashed passwords, rate
            limiting, and server-side authorization checks. No online system is
            risk-free, so report security concerns through the feedback page.
          </p>

          <h2 className="font-serif text-2xl">Your Choices</h2>
          <p className="leading-7 text-[var(--app-text-secondary)]">
            You can update your profile, leave clubs where permitted, and ask
            the project owner to remove account data during the MVP period.
          </p>
        </article>
      </section>
    </main>
  );
}
