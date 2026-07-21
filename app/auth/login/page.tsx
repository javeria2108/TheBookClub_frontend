"use client";

import { Suspense, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { BookOpen, ChevronRight, Lock, Mail } from "lucide-react";

import { loginUser } from "@/lib/auth";
import { LoginFormData, loginSchema } from "@/lib/validations/auth.schema";

function LoginPageContent() {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/dashboard";
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setServerError("");
      setIsSubmitting(true);
      await loginUser(data.email, data.password);
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
      <section className="grid min-h-screen grid-cols-1 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,0.7fr)]">
        <div className="relative hidden min-h-screen overflow-hidden border-r border-[var(--app-border-subtle)] lg:block">
          <Image
            src="https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=1600&q=85"
            alt="Reader beside a bookshelf"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_32%_24%,rgba(26,165,156,0.34),transparent_30%),linear-gradient(90deg,rgba(8,11,10,0.92),rgba(8,11,10,0.42),rgba(8,11,10,0.88))]" />
          <div className="absolute left-10 right-10 top-10 flex items-center gap-2 text-[var(--app-text-primary)]">
            <BookOpen className="h-6 w-6 text-[var(--app-accent-gold)]" />
            <span className="font-serif text-3xl">BookCircle</span>
          </div>
          <div className="absolute bottom-12 left-10 max-w-xl">
            <p className="app-kicker">Welcome back</p>
            <h1 className="mt-3 font-serif text-6xl leading-none text-[var(--app-text-primary)]">
              Return to the circle.
            </h1>
            <p className="mt-5 text-base leading-7 text-[var(--app-text-secondary)]">
              Pick up discussions, reading plans, votes, and reflections right
              where your club left them.
            </p>
          </div>
        </div>

        <div className="flex min-h-screen items-center justify-center px-4 py-8 sm:px-6">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Link
              href="/"
              className="mb-8 inline-flex items-center gap-2 text-[var(--app-text-primary)] lg:hidden"
            >
              <BookOpen className="h-5 w-5 text-[var(--app-accent-gold)]" />
              <span className="font-serif text-2xl">BookCircle</span>
            </Link>

            <div className="app-surface-elevated rounded-2xl p-5 sm:p-7">
              <p className="app-kicker">Member access</p>
              <h2 className="mt-3 font-serif text-4xl leading-tight text-[var(--app-text-primary)]">
                Log in
              </h2>
              <p className="mt-3 text-sm leading-6 text-[var(--app-text-secondary)]">
                Enter your details to continue into your reading rooms.
              </p>

              <form
                onSubmit={handleSubmit(onSubmit)}
                className="mt-7 space-y-5"
                noValidate
              >
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
                      className="app-input app-input-with-leading-icon"
                      {...register("email")}
                    />
                  </div>
                  {errors.email ? (
                    <p className="text-sm text-[#f87171]">{errors.email.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="app-field-label">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--app-accent-gold)]" />
                    <input
                      id="password"
                      type="password"
                      placeholder="Your password"
                      className="app-input app-input-with-leading-icon"
                      {...register("password")}
                    />
                  </div>
                  {errors.password ? (
                    <p className="text-sm text-[#f87171]">
                      {errors.password.message}
                    </p>
                  ) : null}
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
                  {isSubmitting ? "Signing in..." : "Sign in"}
                  {!isSubmitting ? <ChevronRight className="h-4 w-4" /> : null}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-[var(--app-text-secondary)]">
                New here?{" "}
                <Link
                  href={`/auth/signup?returnTo=${encodeURIComponent(returnTo)}`}
                  className="font-semibold text-[var(--app-accent-gold)] hover:text-[var(--app-accent-gold-hover)]"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </motion.section>
        </div>
      </section>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main className="app-page" />}>
      <LoginPageContent />
    </Suspense>
  );
}
