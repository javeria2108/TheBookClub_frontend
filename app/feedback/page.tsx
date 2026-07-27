"use client";

import { FormEvent, useMemo, useState } from "react";
import { MessageSquarePlus, Send } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { useAuthState } from "@/hooks/useAuthState";
import { submitFeedback, type FeedbackCategory } from "@/lib/feedback";

const CATEGORIES: Array<{ label: string; value: FeedbackCategory }> = [
  { label: "General", value: "GENERAL" },
  { label: "Bug", value: "BUG" },
  { label: "Feature", value: "FEATURE" },
  { label: "Safety", value: "SAFETY" },
];

export default function FeedbackPage() {
  const { isAuthenticated, isReady, logout, user } = useAuthState();
  const [category, setCategory] = useState<FeedbackCategory>("GENERAL");
  const [message, setMessage] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const initial = useMemo(
    () => user?.name?.charAt(0).toUpperCase() ?? "R",
    [user?.name],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("saving");
    setError("");

    try {
      await submitFeedback({
        category,
        message,
        contactEmail: contactEmail.trim() || undefined,
      });
      setStatus("sent");
      setMessage("");
      setContactEmail("");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Unable to submit feedback.");
    }
  };

  return (
    <main className="app-page">
      <AppHeader
        mode="app"
        isAuthenticated={isAuthenticated}
        isAuthReady={isReady}
        userInitial={initial}
        onLogout={logout}
      />

      <section className="app-container max-w-4xl">
        <div className="app-surface overflow-hidden rounded-2xl">
          <div className="app-modal-header p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <span className="app-icon-frame h-12 w-12 rounded-xl">
                <MessageSquarePlus className="h-5 w-5" />
              </span>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--app-accent-gold)]">
                  BookCircle MVP
                </p>
                <h1 className="mt-1 font-serif text-3xl leading-tight sm:text-4xl">
                  Share Feedback
                </h1>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 p-5 sm:p-6">
            <div>
              <label className="text-sm font-semibold" htmlFor="category">
                Category
              </label>
              <select
                id="category"
                value={category}
                onChange={(event) => setCategory(event.target.value as FeedbackCategory)}
                className="app-input mt-2"
              >
                {CATEGORIES.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold" htmlFor="message">
                Feedback
              </label>
              <textarea
                id="message"
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                className="app-input mt-2 min-h-40"
                minLength={10}
                maxLength={2000}
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold" htmlFor="contactEmail">
                Contact email, optional
              </label>
              <input
                id="contactEmail"
                type="email"
                value={contactEmail}
                onChange={(event) => setContactEmail(event.target.value)}
                className="app-input mt-2"
              />
            </div>

            {status === "sent" ? (
              <p className="rounded-xl border border-[rgba(87,194,156,0.32)] bg-[rgba(87,194,156,0.08)] p-4 text-sm text-[var(--app-text-primary)]">
                Thanks. Your feedback was received.
              </p>
            ) : null}

            {status === "error" ? (
              <p className="rounded-xl border border-[rgba(196,95,95,0.42)] bg-[rgba(196,95,95,0.12)] p-4 text-sm text-[var(--app-text-primary)]">
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={status === "saving" || message.trim().length < 10}
              className="app-button-primary w-full sm:w-auto"
            >
              <Send className="h-4 w-4" />
              {status === "saving" ? "Sending..." : "Send Feedback"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
