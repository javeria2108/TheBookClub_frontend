"use client";

export function ProfileSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl px-5 pb-12 pt-28 md:px-8">
      <div className="animate-pulse rounded-2xl border border-[#C9A96E]/20 bg-[#100904]/80 p-6 md:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end">
          <div className="h-28 w-28 rounded-full bg-[#2A1810]" />
          <div className="flex-1 space-y-4">
            <div className="h-4 w-32 rounded bg-[#2A1810]" />
            <div className="h-12 w-72 max-w-full rounded bg-[#2A1810]" />
            <div className="h-5 w-full max-w-xl rounded bg-[#2A1810]" />
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-xl border border-[#C9A96E]/20 bg-[#2A1810]"
          />
        ))}
      </div>
    </div>
  );
}
