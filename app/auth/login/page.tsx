"use client";

import { LoginFormData, loginSchema } from "@/lib/validations/auth.schema";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpen, Lock, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");

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
      console.log("Login payload:", data);
      await new Promise((resolve) => setTimeout(resolve, 600));
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-10 px-6 py-10 md:grid-cols-2">
        <div className="relative hidden h-140 overflow-hidden rounded-2xl border border-border md:block">
          <Image
            src="/images/auth-bookshelf-placeholder.jpg"
            alt="Bookshelf themed background"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-background/80 via-background/30 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6">
            <p className="text-lg font-semibold text-cream">
              Welcome back to your reading circle
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Discuss books, find common interests and grow your club
            </p>
          </div>
        </div>

        <div className="animate-slideUp rounded-2xl border border-border bg-card p-6 shadow-xl md:p-8 ">
          <div className="mb-6 flex items-center gap-3">
            <BookOpen className="text-accent" size={24} />
            <h1 className="text-2xl font-bold tracking-tight">Sign in</h1>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            noValidate
          >
            <div className="space-y-2">
              <Label htmlFor="email" className="text-cream">
                Email
              </Label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={18}
                />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-10"
                  {...register("email")}
                />
              </div>
              {errors.email && (
                <p className="animate-shake text-sm text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-cream">
                Password
              </Label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={18}
                />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  className="pl-10"
                  {...register("password")}
                />
              </div>
              {errors.password && (
                <p className="animate-shake text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
            {serverError && (
              <p className="text-sm text-destructive">{serverError}</p>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Signing in..." : "Sign in"}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              New here?{" "}
              <Link
                href="/auth/signup"
                className="font-medium text-accent hover:underline"
              >
                Create an account
              </Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
