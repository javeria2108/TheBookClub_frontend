"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { BookOpen, ChevronRight, Lock, Mail, User } from "lucide-react";

import { signupUser } from "@/lib/auth";
import { SignupFormData, signupSchema } from "@/lib/validations/auth.schema";

function SignupPageContent() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/dashboard";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      setServerError("");
      setIsSubmitting(true);
      await signupUser(data.name, data.email, data.password);
      router.replace(returnTo);
      router.refresh();
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="app-page">
      <section className="grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(420px,0.72fr)_minmax(0,0.98fr)]">
        <div className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-2 text-[var(--app-text-primary)]"
            >
              <BookOpen className="h-5 w-5 text-[var(--app-accent-gold)]" />
              <span className="font-serif text-2xl">BookCircle</span>
            </Link>

            <div className="app-surface-elevated rounded-2xl p-5 sm:p-7">
              <p className="app-kicker">New reader</p>
              <h1 className="mt-3 font-serif text-4xl leading-tight text-[var(--app-text-primary)]">
                Create account
              </h1>
              <p className="mt-3 text-sm leading-6 text-[var(--app-text-secondary)]">
                Start a profile, join a circle, and keep your reading life in
                one calm place.
              </p>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="mt-7 space-y-5"
                noValidate
              >
                <div className="space-y-2">
                  <label htmlFor="name" className="app-field-label">
                    Full name
                  </label>
                  <div className="relative">
                    <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--app-accent-gold)]" />
                    <input
                      id="name"
                      type="text"
                      placeholder="Jane Reader"
                      className="app-input pl-10"
                      {...register("name")}
                    />
                  </div>
                  {errors.name ? (
                    <p className="text-sm text-[#f87171]">{errors.name.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="app-field-label">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--app-accent-gold)]" />
                    <input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="app-input pl-10"
                      {...register("email")}
                    />
                  </div>
                  {errors.email ? (
                    <p className="text-sm text-[#f87171]">{errors.email.message}</p>
                  ) : null}
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="password" className="app-field-label">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--app-accent-gold)]" />
                      <input
                        id="password"
                        type="password"
                        placeholder="Password"
                        className="app-input pl-10"
                        {...register("password")}
                      />
                    </div>
                    {errors.password ? (
                      <p className="text-sm text-[#f87171]">
                        {errors.password.message}
                      </p>
                    ) : null}
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="confirmPassword" className="app-field-label">
                      Confirm
                    </label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--app-accent-gold)]" />
                      <input
                        id="confirmPassword"
                        type="password"
                        placeholder="Repeat"
                        className="app-input pl-10"
                        {...register("confirmPassword")}
                      />
                    </div>
                    {errors.confirmPassword ? (
                      <p className="text-sm text-[#f87171]">
                        {errors.confirmPassword.message}
                      </p>
                    ) : null}
                  </div>
                </div>

                {serverError ? (
                  <p className="rounded-xl border border-[rgba(196,95,95,0.45)] bg-[rgba(67,38,33,0.28)] px-3 py-2 text-sm text-[var(--app-text-primary)]">
                    {serverError}
                  </p>
                ) : null}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="app-button-primary w-full disabled:opacity-60"
                >
                  {isSubmitting ? "Creating account..." : "Create account"}
                  {!isSubmitting ? <ChevronRight className="h-4 w-4" /> : null}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-[var(--app-text-secondary)]">
                Already have an account?{" "}
                <Link
                  href={`/auth/login?returnTo=${encodeURIComponent(returnTo)}`}
                  className="font-semibold text-[var(--app-accent-gold)] hover:text-[var(--app-accent-gold-hover)]"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </motion.section>
        </div>

        <div className="relative hidden min-h-screen overflow-hidden border-l border-[var(--app-border-subtle)] lg:block">
          <Image
            src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1600&q=85"
            alt="Readers browsing books"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_74%_28%,rgba(26,165,156,0.34),transparent_30%),linear-gradient(270deg,rgba(8,11,10,0.94),rgba(8,11,10,0.38),rgba(8,11,10,0.86))]" />
          <div className="absolute bottom-12 left-10 right-10 max-w-2xl">
            <p className="app-kicker">Build the room</p>
            <h2 className="mt-3 font-serif text-6xl leading-none text-[var(--app-text-primary)]">
              Better clubs begin quietly.
            </h2>
            <p className="mt-5 text-base leading-7 text-[var(--app-text-secondary)]">
              Create a reader profile, discover thoughtful circles, or start a
              club for the books you keep recommending.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<main className="app-page" />}>
      <SignupPageContent />
    </Suspense>
  );
}
