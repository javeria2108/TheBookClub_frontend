"use client";

import { LoginFormData, loginSchema } from "@/lib/validations/auth.schema";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpen, ChevronRight, Lock, Mail } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginUser } from "@/lib/auth";
import { motion } from "framer-motion";

export default function LoginPage() {
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

      router.push(returnTo);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";
      setServerError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#1A0F07] text-[#F2E8D9]">
      <section className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 px-5 py-8 md:grid-cols-2 md:gap-10 md:px-8">
        <motion.div
          initial={{ opacity: 0, x: -18 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.55 }}
          className="relative hidden overflow-hidden rounded-2xl border border-[#C9A96E]/25 md:block"
        >
          <Image
            src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1400&q=80"
            alt="Library shelves"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-[#1A0F07]/90 via-[#1A0F07]/40 to-transparent" />
          <div className="absolute bottom-8 left-8 right-8">
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#C9A96E]">
              BookCircle
            </p>
            <h2 className="mt-3 font-serif text-4xl leading-tight">
              Return to your reading circle.
            </h2>
            <p className="mt-3 max-w-md text-sm text-[#F2E8D9]/75">
              Continue discussions, pick your next book, and join tonight’s
              session.
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
          className="my-auto rounded-2xl border border-[#C9A96E]/25 bg-[#2A1810] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)] md:p-8"
        >
          <div className="mb-7 flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-[#C9A96E]" />
            <h1 className="font-serif text-3xl">Log In</h1>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            noValidate
          >
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm text-[#F2E8D9]/80">
                Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C9A96E]/70" />
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="w-full rounded border border-[#C9A96E]/30 bg-[#1A0F07] py-3 pl-10 pr-3 text-sm text-[#F2E8D9] placeholder:text-[#F2E8D9]/40 focus:border-[#C9A96E] focus:outline-none"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-[#f87171]">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm text-[#F2E8D9]/80">
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C9A96E]/70" />
                <input
                  id="password"
                  type="password"
                  placeholder="Your password"
                  className="w-full rounded border border-[#C9A96E]/30 bg-[#1A0F07] py-3 pl-10 pr-3 text-sm text-[#F2E8D9] placeholder:text-[#F2E8D9]/40 focus:border-[#C9A96E] focus:outline-none"
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p className="text-sm text-[#f87171]">
                  {errors.password.message}
                </p>
              )}
            </div>
            {serverError ? (
              <p className="rounded border border-[#8B4A3C]/60 bg-[#8B4A3C]/20 px-3 py-2 text-sm text-[#F2E8D9]">
                {serverError}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded bg-[#C9A96E] px-4 py-3 text-sm font-semibold text-[#1A0F07] transition hover:bg-[#d8b884] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Signing in..." : "Sign In"}
              {!isSubmitting && <ChevronRight className="h-4 w-4" />}
            </button>

            <p className="text-center text-sm text-[#F2E8D9]/70">
              New here?{" "}
              <Link
                href={`/auth/signup?returnTo=${encodeURIComponent(returnTo)}`}
                className="text-[#C9A96E] hover:underline"
              >
                Create an account
              </Link>
            </p>
          </form>
        </motion.div>
      </section>
    </main>
  );
}
