"use client";

import { SignupFormData, signupSchema } from "@/lib/validations/auth.schema";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpen, Lock, Mail, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { signupUser } from "@/lib/auth";

export default function SignupPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const router = useRouter();

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

      // Redirect to home after successful signup
      router.push("/");
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
    <main className="min-h-screen bg-background text-foreground">
      <section className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-10 px-6 py-10 md:grid-cols-2">
        {/* Left side - Image placeholder */}
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
              Join a community of readers
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Share your love for books, discuss stories, and grow your reading
              circle.
            </p>
          </div>
        </div>

        {/* Right side - Signup form */}
        <div className="animate-slideUp rounded-2xl border border-border bg-card p-6 shadow-xl md:p-8">
          <div className="mb-6 flex items-center gap-3">
            <BookOpen className="text-accent" size={24} />
            <h1 className="text-2xl font-bold tracking-tight">
              Create account
            </h1>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            noValidate
          >
            {/* Name field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-cream">
                Full Name
              </Label>
              <div className="relative">
                <User
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={18}
                />
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  className="pl-10"
                  {...register("name")}
                />
              </div>
              {errors.name && (
                <p className="animate-shake text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Email field */}
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

            {/* Password field */}
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
                  placeholder="Create a strong password"
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

            {/* Confirm password field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-cream">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={18}
                />
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  className="pl-10"
                  {...register("confirmPassword")}
                />
              </div>
              {errors.confirmPassword && (
                <p className="animate-shake text-sm text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Server error */}
            {serverError && (
              <p className="text-sm text-destructive">{serverError}</p>
            )}

            {/* Submit button */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Create account"}
            </Button>

            {/* Link to login */}
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-medium text-accent hover:underline"
              >
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </section>
    </main>
  );
}
