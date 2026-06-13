"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AppHeader } from "@/components/layout/AppHeader";
import { useAuthState } from "@/hooks/useAuthState";
import {
  ChevronLeft,
  Video,
  Mic,
  Monitor,
  Users,
  Sparkles,
} from "lucide-react";

export default function ClubLiveRoomPage() {
  const params = useParams();
  const clubId = params.id as string;
  const { isAuthenticated, user } = useAuthState();

  const userInitial = user?.name?.charAt(0).toUpperCase() ?? "R";

  return (
    <main className="min-h-screen bg-[#1A0F07] text-[#F2E8D9]">
      <AppHeader
        mode="app"
        isAuthenticated={isAuthenticated}
        userInitial={userInitial}
      />

      <section className="mx-auto w-full max-w-7xl px-5 py-10 md:px-8 md:py-12">
        <Link
          href={`/clubs/${clubId}`}
          className="mb-8 inline-flex items-center gap-2 text-[#C9A96E] transition hover:text-[#d8b884]"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Club Hub
        </Link>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <section className="relative overflow-hidden rounded-2xl border border-[#C9A96E]/25 bg-[#2A1810]/90 p-6 shadow-[0_24px_60px_rgba(0,0,0,0.35)] md:p-8">
            <div className="pointer-events-none absolute -right-24 -top-20 h-60 w-60 rounded-full bg-[#C9A96E]/10 blur-3xl" />

            <div className="relative z-10 mb-4 inline-flex items-center gap-2 rounded-full border border-[#C9A96E]/35 bg-[#1A0F07]/55 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-[#C9A96E]">
              <Video className="h-3.5 w-3.5" />
              Live Room
            </div>

            <h1 className="font-serif text-4xl leading-tight md:text-5xl">
              Club Live Session
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#F2E8D9]/75">
              This is your dedicated production route for voice and video. We
              keep heavy realtime UI here instead of inside the main club hub.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#C9A96E]/35 bg-[#1A0F07]/60 px-4 py-3 text-sm font-medium text-[#F2E8D9] hover:bg-[#1A0F07]/85"
              >
                <Mic className="h-4 w-4" />
                Toggle Mic
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#C9A96E]/35 bg-[#1A0F07]/60 px-4 py-3 text-sm font-medium text-[#F2E8D9] hover:bg-[#1A0F07]/85"
              >
                <Video className="h-4 w-4" />
                Toggle Cam
              </button>
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#C9A96E]/35 bg-[#1A0F07]/60 px-4 py-3 text-sm font-medium text-[#F2E8D9] hover:bg-[#1A0F07]/85"
              >
                <Monitor className="h-4 w-4" />
                Share Screen
              </button>
            </div>

            <div className="mt-6 flex h-90 items-center justify-center rounded-xl border border-dashed border-[#C9A96E]/30 bg-[#1A0F07]/35 text-sm text-[#F2E8D9]/70">
              Video grid placeholder - wire WebRTC / Daily / Jitsi here.
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-[#C9A96E]/25 bg-[#2A1810]/90 p-5 shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
              <h2 className="font-serif text-2xl">Session Details</h2>
              <div className="mt-4 space-y-3 text-sm text-[#F2E8D9]/75">
                <p className="inline-flex items-center gap-2">
                  <Users className="h-4 w-4 text-[#C9A96E]" />
                  Participants: 0
                </p>
                <p className="inline-flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#C9A96E]" />
                  Status: Waiting for host
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-[#C9A96E]/25 bg-[#2A1810]/90 p-5 text-sm text-[#F2E8D9]/75 shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
              Next step: connect this screen to your live provider and show real
              participant tiles + controls.
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
