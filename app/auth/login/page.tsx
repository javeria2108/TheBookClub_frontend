"use client";

import { LoginFormData, loginSchema } from "@/lib/validations/auth.schema";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
        <div className="relative hidden h-[560px] overflow-hidden rounded-2xl border border-border md:block">
          <Image
            src="/images/auth-bookshelf-placeholder.jpg"
            alt="Bookshelf themed background"
            fill
            priority
            className="object-cover"
          />
        </div>
      </section>
    </main>
  );
}
