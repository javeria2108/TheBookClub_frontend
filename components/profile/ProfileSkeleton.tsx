"use client";

export function ProfileSkeleton() {
  return (
    <div className="app-container">
      <div className="app-surface-elevated animate-pulse rounded-2xl p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end">
          <div className="h-28 w-28 rounded-2xl bg-[rgba(244,234,216,0.06)]" />
          <div className="flex-1 space-y-4">
            <div className="h-4 w-32 rounded bg-[rgba(244,234,216,0.06)]" />
            <div className="h-12 w-72 max-w-full rounded bg-[rgba(244,234,216,0.06)]" />
            <div className="h-5 w-full max-w-xl rounded bg-[rgba(244,234,216,0.06)]" />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="app-surface h-36 animate-pulse rounded-2xl"
          />
        ))}
      </div>
    </div>
  );
}
