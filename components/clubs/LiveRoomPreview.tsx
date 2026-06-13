"use client";

import Link from "next/link";
import { Video, Radio, Users, ArrowRight } from "lucide-react";

interface LiveRoomPreviewProps {
  clubId: string;
  isMember: boolean;
}

export default function LiveRoomPreview({
  clubId,
  isMember,
}: LiveRoomPreviewProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-[#C9A96E]/25 bg-[#2A1810]/90 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#C9A96E]/12 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-12 h-44 w-44 rounded-full bg-[#8B4A3C]/20 blur-2xl" />

      <div className="relative z-10">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#C9A96E]/35 bg-[#1A0F07]/55 px-3 py-1 text-[11px] uppercase tracking-[0.16em] text-[#C9A96E]">
          <Radio className="h-3.5 w-3.5" />
          Live Room
        </div>

        <h2 className="font-serif text-3xl leading-tight text-[#F2E8D9]">
          Weekly Discussion Stage
        </h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#F2E8D9]/75">
          Jump into the dedicated live room for voice and video sessions. Keep
          the club page as your hub, and open the full live experience when you
          are ready.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-[#C9A96E]/20 bg-[#1A0F07]/45 p-4">
            <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#C9A96E]/15 text-[#C9A96E]">
              <Users className="h-4 w-4" />
            </div>
            <p className="text-2xl font-semibold text-[#F2E8D9]">0</p>
            <p className="text-xs uppercase tracking-wide text-[#F2E8D9]/60">
              Participants
            </p>
          </div>

          <div className="rounded-xl border border-[#C9A96E]/20 bg-[#1A0F07]/45 p-4">
            <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#C9A96E]/15 text-[#C9A96E]">
              <Video className="h-4 w-4" />
            </div>
            <p className="text-base font-semibold text-[#F2E8D9]">Offline</p>
            <p className="text-xs uppercase tracking-wide text-[#F2E8D9]/60">
              Room Status
            </p>
          </div>
        </div>

        <div className="mt-6">
          {isMember ? (
            <Link
              href={`/clubs/${clubId}/live`}
              className="inline-flex items-center gap-2 rounded bg-[#C9A96E] px-5 py-3 text-sm font-semibold text-[#1A0F07] transition hover:bg-[#d8b884]"
            >
              Open Live Room
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <p className="text-sm text-[#F2E8D9]/70">
              Join this club first to enter live room sessions.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
