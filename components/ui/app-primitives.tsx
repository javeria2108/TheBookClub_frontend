import Image from "next/image";
import Link from "next/link";
import { BookOpen, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
};

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
};

type StatusBadgeProps = {
  children: ReactNode;
  tone?: "gold" | "teal" | "muted" | "danger" | "success";
};

type CoverImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
};

type SectionHeaderProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

const badgeToneClass = {
  gold: "border-[rgba(216,181,109,0.42)] bg-[linear-gradient(180deg,rgba(35,29,16,0.94),rgba(20,18,13,0.94))] text-[#F7DFA5] shadow-[inset_3px_0_0_rgba(216,181,109,0.72)] [&_svg]:text-[var(--app-accent-gold)]",
  teal: "border-[rgba(26,165,156,0.40)] bg-[linear-gradient(180deg,rgba(13,42,38,0.94),rgba(9,22,20,0.94))] text-[#DDF6F3] shadow-[inset_3px_0_0_rgba(26,165,156,0.76)] [&_svg]:text-[#80D9D2]",
  muted: "border-[var(--app-border-subtle)] bg-[rgba(244,234,216,0.045)] text-[var(--app-text-secondary)] shadow-[inset_3px_0_0_rgba(244,234,216,0.16)] [&_svg]:text-[var(--app-accent-gold)]",
  danger: "border-[rgba(196,95,95,0.42)] bg-[linear-gradient(180deg,rgba(53,22,22,0.86),rgba(25,14,14,0.94))] text-[#FFD2D2] shadow-[inset_3px_0_0_rgba(196,95,95,0.76)] [&_svg]:text-[#F0A0A0]",
  success: "border-[rgba(99,179,135,0.42)] bg-[linear-gradient(180deg,rgba(18,45,31,0.88),rgba(11,24,17,0.94))] text-[#DDF8E6] shadow-[inset_3px_0_0_rgba(99,179,135,0.72)] [&_svg]:text-[#A8E4BE]",
};

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
}: PageHeaderProps) {
  return (
    <header className="mb-8 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-[11px] uppercase tracking-[0.24em] text-[var(--app-accent-gold)]">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="mt-2 font-serif text-4xl font-bold leading-tight text-[var(--app-text-primary)] md:text-5xl">
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--app-text-secondary)] md:text-base">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="flex flex-wrap gap-3">{action}</div> : null}
    </header>
  );
}

export function SectionHeader({ title, description, action }: SectionHeaderProps) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h2 className="font-serif text-2xl text-[var(--app-text-primary)]">
          {title}
        </h2>
        {description ? (
          <p className="mt-1 text-sm text-[var(--app-text-secondary)]">
            {description}
          </p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="app-surface rounded-2xl border-dashed p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--app-accent-teal-soft)] text-[var(--app-accent-gold)]">
        {icon ?? <BookOpen className="h-6 w-6" />}
      </div>
      <h2 className="font-serif text-2xl text-[var(--app-text-primary)]">
        {title}
      </h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[var(--app-text-secondary)]">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function ErrorState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[rgba(196,95,95,0.45)] bg-[rgba(196,95,95,0.12)] p-6">
      <h2 className="font-semibold text-[var(--app-text-primary)]">{title}</h2>
      <p className="mt-2 text-sm text-[var(--app-text-secondary)]">
        {description}
      </p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function StatusBadge({ children, tone = "muted" }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex min-h-7 items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-semibold ${badgeToneClass[tone]}`}
    >
      {children}
    </span>
  );
}

export function CoverImage({ src, alt, className = "" }: CoverImageProps) {
  return (
    <div
      className={`relative overflow-hidden bg-[radial-gradient(circle_at_24%_18%,rgba(216,181,109,0.20),transparent_30%),linear-gradient(135deg,#14231f,#090b0a)] ${className}`}
    >
      {src ? (
        <Image src={src} alt={alt} fill className="object-cover" sizes="320px" />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-[var(--app-accent-gold)]">
          <BookOpen className="h-10 w-10" />
        </div>
      )}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(8,11,10,0.24))]" />
    </div>
  );
}

export function InlineLink({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1 text-sm font-semibold text-[var(--app-accent-gold)] transition hover:text-[var(--app-accent-gold-hover)]"
    >
      {children}
      <ChevronRight className="h-4 w-4" />
    </Link>
  );
}
