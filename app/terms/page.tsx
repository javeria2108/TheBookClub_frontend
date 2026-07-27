import Link from "next/link";

export default function TermsPage() {
  return (
    <main className="app-page">
      <section className="app-container max-w-4xl">
        <Link href="/" className="text-sm text-[var(--app-accent-gold)]">
          Back to BookCircle
        </Link>
        <article className="app-surface mt-6 space-y-6 rounded-2xl p-5 sm:p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--app-accent-gold)]">
              MVP terms
            </p>
            <h1 className="mt-2 font-serif text-4xl">Terms of Service</h1>
            <p className="mt-3 text-sm text-[var(--app-text-muted)]">
              Last updated July 21, 2026
            </p>
          </div>

          <p className="leading-7 text-[var(--app-text-secondary)]">
            BookCircle is an MVP for creating and joining reading circles. By
            using it, you agree to use the service respectfully and only for
            lawful reading-community activity.
          </p>

          <h2 className="font-serif text-2xl">Accounts</h2>
          <p className="leading-7 text-[var(--app-text-secondary)]">
            Keep your login details private. You are responsible for activity
            from your account. We may restrict access for spam, abuse, security
            risk, or behavior that harms other readers.
          </p>

          <h2 className="font-serif text-2xl">User Content</h2>
          <p className="leading-7 text-[var(--app-text-secondary)]">
            You are responsible for the messages, reflections, quotes, club
            descriptions, and images you share. Do not upload unlawful,
            harassing, or infringing content.
          </p>

          <h2 className="font-serif text-2xl">MVP Availability</h2>
          <p className="leading-7 text-[var(--app-text-secondary)]">
            BookCircle is provided as an early product and may change, break, or
            be unavailable while it is being improved for real users.
          </p>

          <h2 className="font-serif text-2xl">No Book Content Hosting</h2>
          <p className="leading-7 text-[var(--app-text-secondary)]">
            BookCircle stores book metadata and user-created discussion content.
            It does not host copyrighted books, PDFs, EPUBs, or full texts.
          </p>
        </article>
      </section>
    </main>
  );
}
