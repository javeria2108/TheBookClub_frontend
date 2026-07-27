import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="app-page">
      <section className="app-container max-w-4xl">
        <Link href="/" className="text-sm text-[var(--app-accent-gold)]">
          Back to BookCircle
        </Link>
        <article className="app-surface mt-6 space-y-6 rounded-2xl p-5 sm:p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--app-accent-gold)]">
              About
            </p>
            <h1 className="mt-2 font-serif text-4xl">BookCircle</h1>
          </div>

          <p className="leading-7 text-[var(--app-text-secondary)]">
            BookCircle helps small groups read together with less chaos and more
            continuity. Clubs can choose a shared book, plan weekly reading,
            track personal progress, discuss topics, vote on the next read, and
            save reflections or favourite quotes.
          </p>

          <p className="leading-7 text-[var(--app-text-secondary)]">
            The current release is built for a small beta group. The priority is
            a calm, complete reading-club experience rather than a large social
            network.
          </p>

          <div className="flex flex-wrap gap-3">
            <Link href="/clubs" className="app-button-primary">
              Discover Clubs
            </Link>
            <Link href="/feedback" className="app-button-secondary">
              Share Feedback
            </Link>
          </div>
        </article>
      </section>
    </main>
  );
}
