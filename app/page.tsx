"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuthState } from "@/hooks/useAuthState";
import { motion } from "framer-motion";
import { getClubs } from "@/lib/clubs";
import {
  getHomepageStats,
  getLandingMetrics,
  mapApiClubsToLandingClubs,
} from "@/lib/homepage";
import type { LandingClub as Club, LandingStats } from "@/lib/types";
import {
  Bell,
  BookOpen,
  ChevronDown,
  ChevronRight,
  ListChecks,
  Lock,
  MessageSquare,
  Play,
  Quote,
  Sparkles,
  Trophy,
  Users,
  Vote,
} from "lucide-react";
import { DiscoverSection } from "@/components/pages/landing/DiscoverSection";
import { AppHeader } from "@/components/layout/AppHeader";

const cardReveal = {
  hidden: { opacity: 0, y: 18 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: index * 0.08 },
  }),
};

export default function HomePage() {
  const { isAuthenticated, isReady, logout, user } = useAuthState();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [landingStats, setLandingStats] = useState<LandingStats | null>(null);

  const featuredClub = clubs[0] ?? null;
  const metrics = useMemo(
    () => getLandingMetrics(clubs, landingStats),
    [clubs, landingStats],
  );

  useEffect(() => {
    const fetchLandingClubs = async () => {
      const [clubResult, statsResult] = await Promise.allSettled([
        getClubs({ limit: 5 }),
        getHomepageStats(),
      ]);

      if (clubResult.status === "fulfilled") {
        setClubs(mapApiClubsToLandingClubs(clubResult.value.clubs));
      } else {
        console.error("Failed to load landing clubs", clubResult.reason);
      }

      if (statsResult.status === "fulfilled") {
        setLandingStats(statsResult.value);
      } else {
        console.error("Failed to load landing stats", statsResult.reason);
      }
    };

    fetchLandingClubs();
  }, []);

  const initial = useMemo(
    () => user?.name?.charAt(0).toUpperCase() ?? "R",
    [user?.name],
  );

  return (
    <main className="min-h-screen bg-[#090807] text-[#F2E8D9] font-sans">
      <AppHeader
        mode="landing"
        isAuthenticated={isAuthenticated}
        isAuthReady={isReady}
        userInitial={initial}
        onLogout={logout}
      />

      <section className="relative flex min-h-screen items-center overflow-hidden border-b border-[#C9A96E]/25 px-4 pb-20 pt-24 md:px-8">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=1800&q=85"
            alt="Open books in a moody library"
            fill
            className="object-cover opacity-45"
            priority
          />
        </div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_58%_28%,rgba(24,191,183,0.38),transparent_30%),radial-gradient(circle_at_18%_18%,rgba(201,169,110,0.16),transparent_24%),linear-gradient(180deg,rgba(9,8,7,0.35)_0%,rgba(10,31,29,0.78)_42%,rgba(9,8,7,0.97)_100%)]" />
        <div className="absolute inset-x-0 top-0 h-28 bg-[linear-gradient(180deg,rgba(9,8,7,0.86),transparent)]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(0deg,#090807,transparent)]" />
        <div className="absolute left-0 right-0 top-20 h-px bg-[#C9A96E]/30" />

        <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="min-w-0 text-center lg:col-span-6 lg:text-left">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-4 text-[11px] uppercase tracking-[0.18em] text-[#E8C46D] sm:tracking-[0.28em]"
            >
              A candlelit home for book clubs
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-serif text-5xl font-black uppercase leading-[0.82] text-[#F7DFA5] drop-shadow-[0_6px_16px_rgba(0,0,0,0.75)] sm:text-7xl md:text-[86px] lg:text-[112px]"
            >
              <span className="block">Book</span>
              <span className="block">Circle</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18 }}
              className="mt-2 font-serif text-2xl tracking-[0.12em] text-[#F2E8D9] sm:text-3xl sm:tracking-[0.22em]"
            >
              Reading Club
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mx-auto mt-7 max-w-xl text-base leading-relaxed text-[#F2E8D9]/80 md:text-lg lg:mx-0"
            >
              Create clubs, plan shared reads, track progress, vote on the next
              book, and keep the best parts of the conversation in one place.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex min-w-0 flex-wrap items-center justify-center gap-4 lg:justify-start"
            >
              <Link
                href={isAuthenticated ? "/clubs" : "/auth/signup"}
                className="inline-flex min-h-12 max-w-full items-center justify-center gap-2 rounded-sm border border-[#FFE4A4]/70 bg-[linear-gradient(180deg,#FFE4A4_0%,#C99636_48%,#8B531E_100%)] px-6 py-3 text-center text-sm font-black uppercase tracking-[0.06em] text-[#281306] shadow-[0_8px_0_#4c260d,0_18px_36px_rgba(0,0,0,0.45)] transition hover:-translate-y-px sm:px-8 sm:tracking-[0.08em]"
              >
                {isAuthenticated ? "Browse Clubs" : "Start Reading"}
                <ChevronRight className="h-4 w-4" />
              </Link>
              <a
                href="#how"
                className="inline-flex min-h-12 max-w-full items-center justify-center gap-2 rounded-sm border border-[#E8C46D]/60 bg-[#090807]/45 px-5 py-3 text-center text-sm font-bold uppercase tracking-[0.06em] text-[#F2E8D9] transition hover:bg-[#C9A96E]/10 sm:px-7 sm:tracking-[0.08em]"
              >
                <Play className="h-4 w-4 fill-[#E8C46D] text-[#E8C46D]" />
                How it Works
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 inline-flex items-center gap-2 border border-[#C9A96E]/35 bg-[#080706]/70 px-4 py-2 text-sm text-[#F2E8D9]/90 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur"
            >
              <Users className="h-4 w-4 text-[#C9A96E]" />
              <span>
                {metrics.readerCount} readers | {metrics.clubCount}{" "}
                {metrics.clubCount === 1 ? "club" : "clubs"} |{" "}
                {metrics.activeReadingCycles} active{" "}
                {metrics.activeReadingCycles === 1 ? "read" : "reads"}
              </span>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 28, rotate: 2 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ duration: 0.8, delay: 0.25 }}
            className="relative mx-auto hidden h-[430px] w-full max-w-[430px] sm:block lg:col-span-6"
            aria-hidden="true"
          >
            <div className="absolute left-7 top-16 h-72 w-48 -rotate-[15deg] overflow-hidden rounded-md border border-[#E8C46D]/35 bg-[#130d08] shadow-[0_26px_46px_rgba(0,0,0,0.65)]">
              <Image
                src="https://images.unsplash.com/photo-1512820790803-83ca734da794?w=700&q=80"
                alt=""
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[#0d0907]/25" />
            </div>
            <div className="absolute right-7 top-28 h-72 w-48 rotate-[14deg] overflow-hidden rounded-md border border-[#E8C46D]/35 bg-[#130d08] shadow-[0_26px_46px_rgba(0,0,0,0.65)]">
              <Image
                src="https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=700&q=80"
                alt=""
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[#0d0907]/20" />
            </div>
            <div className="absolute left-1/2 top-5 h-[360px] w-60 -translate-x-1/2 overflow-hidden rounded-md border border-[#FFE4A4]/70 bg-[#120b07] shadow-[0_30px_70px_rgba(0,0,0,0.75)]">
              <Image
                src="https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=800&q=85"
                alt=""
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,8,7,0.04),rgba(9,8,7,0.58))]" />
              <div className="absolute inset-x-5 bottom-5 border-t border-[#E8C46D]/45 pt-4 text-center">
                <p className="font-serif text-2xl font-bold text-[#F7DFA5]">
                  The Next Chapter
                </p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-[#F2E8D9]/75">
                  Club pick
                </p>
              </div>
            </div>
            <div className="absolute left-1/2 top-44 flex h-16 w-16 -translate-x-1/2 items-center justify-center rounded-full border border-[#FFE4A4]/80 bg-[radial-gradient(circle,#FFE4A4_0%,#C99636_58%,#6C3715_100%)] text-[#281306] shadow-[0_0_35px_rgba(232,196,109,0.48)]">
              <Play className="ml-1 h-7 w-7 fill-current" />
            </div>
            <div className="absolute bottom-0 left-1/2 h-28 w-80 -translate-x-1/2 rounded-[50%] bg-[#17b7ad]/20 blur-3xl" />
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity }}
          className="absolute bottom-7 left-1/2 -translate-x-1/2 text-[#C9A96E]"
        >
          <ChevronDown className="h-6 w-6" />
        </motion.div>
      </section>

      <DiscoverSection
        clubs={clubs}
      />

      <section className="relative overflow-hidden border-y border-[#C9A96E]/20 bg-[#0B0907] px-5 py-24 text-[#F2E8D9] md:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_84%_18%,rgba(201,169,110,0.16),transparent_28%),radial-gradient(circle_at_18%_84%,rgba(19,176,168,0.12),transparent_30%)]" />
        <div className="mx-auto w-full max-w-7xl">
          <div className="relative grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-7">
              <motion.p
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-[11px] uppercase tracking-[0.28em] text-[#E8C46D]"
              >
                The reading room
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="mt-3 break-words font-serif text-4xl font-black leading-none text-[#F7DFA5] sm:text-5xl md:text-7xl"
              >
                Everything a club needs
              </motion.h2>
            </div>
            <p className="max-w-xl text-sm leading-relaxed text-[#F2E8D9]/72 lg:col-span-5">
              BookCircle keeps the ritual simple: gather people, choose a book,
              keep the conversation alive, and preserve the trail of ideas.
            </p>
          </div>

          <div className="relative mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[
              {
                title: "Public & Private Clubs",
                description:
                  "Open a public reading circle or approve requests for a quieter private club.",
                icon: Lock,
              },
              {
                title: "Reading Cycles & Plans",
                description:
                  "Choose a book, set dates, add weekly targets, and keep every member oriented.",
                icon: ListChecks,
              },
              {
                title: "Progress Tracking",
                description:
                  "Members can update percentage progress while the club sees a calm shared view.",
                icon: Users,
              },
              {
                title: "Discussions & Live Chat",
                description:
                  "Use structured topics for durable conversation and chat for the live room.",
                icon: MessageSquare,
              },
              {
                title: "Next Book Voting",
                description:
                  "Nominate books, vote while the round is open, and resolve the club pick.",
                icon: Vote,
              },
              {
                title: "Reflections & Notifications",
                description:
                  "Save quotes and reflections, then get in-app notices when club activity matters.",
                icon: Bell,
              },
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.article
                  key={feature.title}
                  variants={cardReveal}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={index}
                  whileHover={{ y: -4 }}
                  className="rounded-md border border-[#C9A96E]/25 bg-[#140D08]/82 p-7 shadow-[inset_0_1px_0_rgba(255,228,164,0.08),0_18px_44px_rgba(0,0,0,0.35)] transition hover:border-[#E8C46D]/70 hover:bg-[#181009]"
                >
                  <div className="flex h-11 w-11 items-center justify-center border border-[#E8C46D]/35 bg-[#090807] text-[#E8C46D]">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-5 font-serif text-2xl text-[#F7DFA5]">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#F2E8D9]/68">
                    {feature.description}
                  </p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="how" className="relative overflow-hidden bg-[#080706] px-5 py-24 md:px-8">
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#080706_0%,#121D1B_48%,#080706_100%)]" />
        <div className="relative mx-auto w-full max-w-7xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:items-center">
            <div className="lg:col-span-4">
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#E8C46D]">
                How to play
              </p>
              <h2 className="mt-3 break-words font-serif text-4xl font-black leading-none text-[#F7DFA5] sm:text-5xl md:text-7xl">
                Create. Plan. Discuss.
              </h2>
              <p className="mt-5 text-sm leading-relaxed text-[#F2E8D9]/70">
                Three simple moves turn a book choice into a shared reading
                rhythm with progress, prompts, and room for every reader.
              </p>
            </div>

            <div className="relative h-72 overflow-hidden rounded-md border border-[#E8C46D]/30 shadow-[0_28px_70px_rgba(0,0,0,0.55)] lg:col-span-8">
              <Image
                src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=1400&q=85"
                alt="Readers browsing books together"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,rgba(24,191,183,0.30),transparent_32%),linear-gradient(90deg,rgba(8,7,6,0.72),rgba(8,7,6,0.1),rgba(8,7,6,0.75))]" />
              <div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[#FFE4A4]/80 bg-[radial-gradient(circle,#FFE4A4_0%,#C99636_58%,#6C3715_100%)] text-[#281306] shadow-[0_0_35px_rgba(232,196,109,0.48)]">
                <Play className="ml-1 h-7 w-7 fill-current" />
              </div>
            </div>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-5 lg:grid-cols-3">
            {[
              {
                step: "01",
                title: "Create or find a club",
                description:
                  "Start a public club, keep it private, or join an existing circle from discovery.",
                image:
                  "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=900&q=80",
              },
              {
                step: "02",
                title: "Plan the shared read",
                description:
                  "Create reading cycles, add weekly targets, and let members track progress.",
                image:
                  "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=900&q=80",
              },
              {
                step: "03",
                title: "Discuss and decide",
                description:
                  "Use chat, structured topics, reflections, quotes, and next-book voting to keep momentum.",
                image:
                  "https://images.unsplash.com/photo-1526243741027-444d633d7365?w=900&q=80",
              },
            ].map((step, index) => (
              <motion.article
                key={step.step}
                variants={cardReveal}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={index}
                className="rounded-md border border-[#C9A96E]/25 bg-[#100B08]/86 p-6 shadow-[0_18px_44px_rgba(0,0,0,0.36)]"
              >
                <p className="font-serif text-5xl leading-none text-[#E8C46D]/75 sm:text-7xl">
                  {step.step}
                </p>
                <div className="relative mt-5 h-40 overflow-hidden rounded-sm border border-[#C9A96E]/20">
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-[#090807]/18" />
                </div>
                <h3 className="mt-5 break-words font-serif text-2xl text-[#F7DFA5] sm:text-3xl">{step.title}</h3>
                <p className="mt-3 text-sm text-[#F2E8D9]/75">
                  {step.description}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#080706] px-5 pb-24 pt-8 md:px-8">
        <div className="absolute inset-x-0 bottom-0 h-48 bg-[radial-gradient(circle_at_50%_100%,rgba(19,176,168,0.18),transparent_42%)]" />
        <div className="relative mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 border-y border-[#C9A96E]/25 py-12 lg:grid-cols-5 lg:items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative h-96 overflow-hidden rounded-md border border-[#E8C46D]/35 shadow-[0_28px_70px_rgba(0,0,0,0.55)] lg:col-span-3"
          >
            {featuredClub?.coverImage ? (
              <Image
                src={featuredClub.coverImage}
                alt={featuredClub.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_50%_28%,rgba(232,196,109,0.22),transparent_34%),linear-gradient(135deg,#0E2B27,#100B08_58%,#201109)]">
                <BookOpen className="h-20 w-20 text-[#E8C46D]/70" />
              </div>
            )}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,7,6,0.08),rgba(8,7,6,0.58))]" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#C9A96E]">
              {featuredClub ? "Featured Club" : "Your First Club"}
            </p>
            <h2 className="mt-3 break-words font-serif text-4xl font-black leading-[0.95] text-[#F7DFA5] sm:text-5xl md:text-[64px]">
              {featuredClub?.name ?? "Start a reading circle"}
            </h2>
            <div className="mt-6 flex flex-wrap gap-6 text-sm text-[#F2E8D9]/80 sm:gap-8">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#C9A96E]">
                  Members
                </p>
                <p className="mt-1 text-xl font-semibold">
                  {featuredClub?.memberCount ?? 0}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#C9A96E]">
                  Genre
                </p>
                <p className="mt-1 text-xl font-semibold">
                  {featuredClub?.genre ?? "General"}
                </p>
              </div>
            </div>
            <p className="mt-6 max-w-md text-base leading-relaxed text-[#F2E8D9]/80">
              {featuredClub?.description ??
                "Create a club and the landing page will start highlighting real circles from your database."}
            </p>

          </motion.div>
        </div>
      </section>

      <section className="border-y border-[#C9A96E]/25 bg-[#0E1C1A] px-5 py-14 md:px-8">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-y-8 lg:grid-cols-4">
          {[
            { value: String(metrics.readerCount), label: "Readers" },
            { value: String(metrics.clubCount), label: "Clubs" },
            { value: String(metrics.activeReadingCycles), label: "Active Reads" },
            { value: String(metrics.discussionTopics), label: "Topics" },
          ].map((item, index) => (
            <div
              key={item.label}
              className={`text-center ${index > 0 ? "lg:border-l lg:border-[#C9A96E]/20" : ""}`}
            >
              <p className="font-serif text-4xl font-black leading-none text-[#F7DFA5] sm:text-5xl md:text-7xl">
                {item.value}
              </p>
              <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-[#C9A96E]">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative overflow-hidden bg-[#090807] px-5 py-24 text-[#F2E8D9] md:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(201,169,110,0.14),transparent_32%)]" />
        <div className="relative mx-auto w-full max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
            <div>
              <p className="text-[11px] uppercase tracking-[0.28em] text-[#E8C46D]">
                Coming next
              </p>
              <h2 className="mt-3 break-words font-serif text-4xl font-black leading-none text-[#F7DFA5] sm:text-5xl md:text-7xl">
                The roadmap stays reader-first.
              </h2>
              <p className="mt-5 max-w-xl text-sm leading-relaxed text-[#F2E8D9]/70">
                The current app focuses on clubs, reading plans, discussions,
                voting, reflections, and notifications. Future phases add more
                intelligence and motivation without turning the space into a
                noisy social feed.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {[
                {
                  title: "AI discussion help",
                  description:
                    "Planned prompts, summaries, and reading aids for club owners and members.",
                  icon: Sparkles,
                },
                {
                  title: "Reading milestones",
                  description:
                    "Planned streaks, achievements, and progress moments that reward consistency.",
                  icon: Trophy,
                },
                {
                  title: "Smarter reminders",
                  description:
                    "Planned preferences for reading targets, votes, replies, and club activity.",
                  icon: Bell,
                },
                {
                  title: "Richer archives",
                  description:
                    "Planned ways to revisit finished reads, saved quotes, and discussion history.",
                  icon: Quote,
                },
              ].map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.article
                    key={item.title}
                    variants={cardReveal}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    custom={index}
                    className="rounded-md border border-[#C9A96E]/25 bg-[#0B1513]/86 p-6"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex h-11 w-11 items-center justify-center border border-[#E8C46D]/35 bg-[#090807] text-[#E8C46D]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="border border-[#1AA59C]/45 bg-[#0E2B27] px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-[#A8E9E3]">
                        Planned
                      </span>
                    </div>
                    <h3 className="mt-5 font-serif text-2xl text-[#F7DFA5]">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-sm leading-relaxed text-[#F2E8D9]/68">
                      {item.description}
                    </p>
                  </motion.article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden border-y border-[#C9A96E]/25 bg-[#0E6B67] px-5 py-20 md:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_24%,rgba(255,228,164,0.18),transparent_30%),linear-gradient(180deg,rgba(11,54,52,0.16),rgba(8,7,6,0.34))]" />
        <div className="relative mx-auto w-full max-w-5xl text-center">
          <p className="text-[11px] uppercase tracking-[0.28em] text-[#FFE4A4]">
            Open the circle
          </p>
          <h2 className="mt-3 break-words font-serif text-4xl font-black leading-tight text-[#F7DFA5] sm:text-5xl md:text-7xl">
            Read More. Think Deeper.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-[#F2E8D9]/75">
            Join a real club from discovery or create the next circle for your
            readers.
          </p>

          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="mt-8 inline-flex items-center gap-2 rounded-sm border border-[#FFE4A4]/70 bg-[linear-gradient(180deg,#FFE4A4_0%,#C99636_48%,#8B531E_100%)] px-7 py-3 text-sm font-black uppercase tracking-[0.08em] text-[#281306] shadow-[0_8px_0_#4c260d,0_18px_36px_rgba(0,0,0,0.35)] transition hover:-translate-y-px"
            >
              Go to Your Dashboard <ChevronRight className="h-4 w-4" />
            </Link>
          ) : (
            <form
              className="mx-auto mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row"
              action="/auth/signup"
            >
              <input
                type="email"
                placeholder="Enter your email"
                className="min-w-0 w-full rounded-sm border border-[#FFE4A4]/35 bg-[#080706]/80 px-4 py-3 text-sm text-[#F2E8D9] placeholder:text-[#F2E8D9]/45 focus:border-[#FFE4A4] focus:outline-none"
              />
              <button
                type="submit"
                className="rounded-sm border border-[#FFE4A4]/70 bg-[linear-gradient(180deg,#FFE4A4_0%,#C99636_52%,#8B531E_100%)] px-6 py-3 text-sm font-black uppercase tracking-[0.08em] text-[#281306] transition hover:-translate-y-px"
              >
                Get Started Free
              </button>
            </form>
          )}
        </div>
      </section>

      <footer
        id="about"
        className="border-t border-[#C9A96E]/20 bg-[#080706] px-5 py-16 md:px-8"
      >
        <div className="mx-auto w-full max-w-7xl">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-[#C9A96E]" />
                <span className="font-serif text-2xl">BookCircle</span>
              </div>
              <p className="mt-4 text-sm text-[#F2E8D9]/70">
                A home for readers who want deeper books and better
                conversations.
              </p>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#C9A96E]">
                Product
              </p>
              <ul className="mt-4 space-y-2 text-sm text-[#F2E8D9]/80">
                <li>
                  <a href="#how" className="transition hover:text-[#C9A96E]">
                    How it Works
                  </a>
                </li>
                <li>
                  <Link
                    href="/clubs"
                    className="transition hover:text-[#C9A96E]"
                  >
                    Browse Clubs
                  </Link>
                </li>
                <li>
                  <Link
                    href={isAuthenticated ? "/dashboard" : "/auth/signup"}
                    className="transition hover:text-[#C9A96E]"
                  >
                    {isAuthenticated ? "Dashboard" : "Create Account"}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#C9A96E]">
                Current
              </p>
              <ul className="mt-4 space-y-2 text-sm text-[#F2E8D9]/80">
                <li>
                  <a href="#discover" className="transition hover:text-[#C9A96E]">
                    Clubs
                  </a>
                </li>
                <li>
                  <span>
                    Discussions
                  </span>
                </li>
                <li>
                  <span>Reading Plans</span>
                </li>
                <li>
                  <span>Next Book Voting</span>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#C9A96E]">
                Roadmap
              </p>
              <ul className="mt-4 space-y-2 text-sm text-[#F2E8D9]/80">
                <li>
                  <span>AI Discussion Help</span>
                </li>
                <li>
                  <span>Reading Milestones</span>
                </li>
                <li>
                  <span>Notification Preferences</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#C9A96E]/20 pt-7 text-sm text-[#F2E8D9]/65 md:flex-row">
            <p>© 2026 BookCircle. All rights reserved.</p>
            <div className="flex items-center gap-4 text-[#C9A96E]">
              <Users className="h-4 w-4" />
              <BookOpen className="h-4 w-4" />
              <MessageSquare className="h-4 w-4" />
            </div>
          </div>
        </div>
      </footer>

    </main>
  );
}
