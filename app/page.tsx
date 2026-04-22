"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { getClubs } from "@/lib/clubs";
import {
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Globe,
  Lock,
  Menu,
  MessageSquare,
  Users,
  Vote,
  X,
} from "lucide-react";

type AuthUser = { name: string };

type AuthState = {
  isAuthenticated: boolean;
  user?: AuthUser;
};

export interface Club {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  genre: string;
  isPrivate: boolean;
  coverImage: string;
}

type Testimonial = {
  quote: string;
  author: string;
  role: string;
  avatarImage: string;
};

const mockClubs: Club[] = [
  {
    id: "literary-fiction-society",
    name: "Literary Fiction Society",
    description:
      "Exploring modern classics with thoughtful discussion and shared annotation sessions.",
    memberCount: 48,
    genre: "Literary Fiction",
    isPrivate: false,
    coverImage:
      "https://images.unsplash.com/photo-1455885666463-9c4b7fe58a8f?w=900&q=80",
  },
  {
    id: "mystery-mavens",
    name: "Mystery Mavens",
    description:
      "Crime, noir, and puzzling endings—weekly debates on clues and craft.",
    memberCount: 35,
    genre: "Mystery",
    isPrivate: false,
    coverImage:
      "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=900&q=80",
  },
  {
    id: "speculative-circle",
    name: "Speculative Circle",
    description:
      "From dystopia to cosmic epics, we read speculative fiction with rigor.",
    memberCount: 29,
    genre: "Science Fiction",
    isPrivate: false,
    coverImage:
      "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=900&q=80",
  },
  {
    id: "quiet-philosophy-room",
    name: "Quiet Philosophy Room",
    description:
      "Small, focused private discussions around ethics, meaning, and modern life.",
    memberCount: 14,
    genre: "Philosophy",
    isPrivate: true,
    coverImage:
      "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=900&q=80",
  },
  {
    id: "memoir-notes-club",
    name: "Memoir Notes Club",
    description:
      "Life writing and memory, with monthly long-form reflection circles.",
    memberCount: 22,
    genre: "Memoir",
    isPrivate: true,
    coverImage:
      "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=900&q=80",
  },
];

const testimonials: Testimonial[] = [
  {
    quote:
      "BookCircle made our discussions sharper and more intimate. Every session feels like an evening in a real bookshop.",
    author: "Maya Patel",
    role: "Member · Literary Fiction Society",
    avatarImage:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80",
  },
  {
    quote:
      "The private club tools are exactly what we needed—focused conversations, clean scheduling, no noise.",
    author: "Daniel Kim",
    role: "Owner · Quiet Philosophy Room",
    avatarImage:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80",
  },
  {
    quote:
      "Voting and async chat keep momentum between meetings. We now finish more books and enjoy them more deeply.",
    author: "Elena Rossi",
    role: "Member · Speculative Circle",
    avatarImage:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&q=80",
  },
];

const useAuth = (): AuthState => {
  const [state, setState] = useState<AuthState>({ isAuthenticated: false });

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const rawUser = localStorage.getItem("user");

    if (!token || !rawUser) {
      return;
    }

    try {
      const parsed = JSON.parse(rawUser) as { name?: string };
      setState({
        isAuthenticated: true,
        user: { name: parsed.name?.trim() || "Reader" },
      });
    } catch {
      setState({ isAuthenticated: true, user: { name: "Reader" } });
    }
  }, []);

  return state;
};

const cardReveal = {
  hidden: { opacity: 0, y: 18 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: index * 0.08 },
  }),
};

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showJoinPrompt, setShowJoinPrompt] = useState(false);
  const [joinTargetName, setJoinTargetName] = useState("");
  const [testimonialIndex, setTestimonialIndex] = useState(0);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [isLoadingClubs, setIsLoadingClubs] = useState(true);
  const [clubsError, setClubsError] = useState<string | null>(null);

  const featuredClub = clubs[0] ?? mockClubs[0];

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 18);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const fetchLandingClubs = async () => {
      try {
        setIsLoadingClubs(true);
        setClubsError(null);
        const data = await getClubs({ limit: 5 });

        const mapped: Club[] = data.clubs.map((apiClub, index) => ({
          id: apiClub.id,
          name: apiClub.name,
          description: apiClub.description ?? "No description yet.",
          isPrivate: !apiClub.isPublic,
          memberCount: 0,
          genre: "General",
          coverImage: mockClubs[index % mockClubs.length].coverImage,
        }));

        setClubs(mapped);
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load clubs";
        setClubsError(message);
      } finally {
        setIsLoadingClubs(false);
      }
    };

    fetchLandingClubs();
  }, []);

  const initial = useMemo(
    () => user?.name?.charAt(0).toUpperCase() ?? "R",
    [user?.name],
  );

  const handleJoinClick = (club: Club) => {
    if (isAuthenticated) {
      return;
    }

    setJoinTargetName(club.name);
    setShowJoinPrompt(true);
  };

  const prevTestimonial = () => {
    setTestimonialIndex(
      (current) => (current - 1 + testimonials.length) % testimonials.length,
    );
  };

  const nextTestimonial = () => {
    setTestimonialIndex((current) => (current + 1) % testimonials.length);
  };

  return (
    <main className="min-h-screen bg-[#1A0F07] text-[#F2E8D9] font-sans">
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
          isScrolled ? "bg-[#1A0F07]/75 backdrop-blur-md" : "bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-5 md:px-8">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#C9A96E]" />
            <span className="font-serif text-2xl leading-none text-[#F2E8D9]">
              BookCircle
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-[11px] uppercase tracking-[0.2em] md:flex">
            <a href="#discover" className="transition hover:text-[#C9A96E]">
              Discover
            </a>
            <a href="#how" className="transition hover:text-[#C9A96E]">
              How it Works
            </a>
            <a href="#about" className="transition hover:text-[#C9A96E]">
              About
            </a>
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm text-[#F2E8D9] transition hover:text-[#C9A96E]"
                >
                  Dashboard
                </Link>
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C9A96E] text-sm font-semibold text-[#1A0F07]">
                  {initial}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm text-[#F2E8D9] transition hover:text-[#C9A96E]"
                >
                  Log In
                </Link>
                <Link
                  href="/auth/signup"
                  className="rounded-full bg-[#C9A96E] px-4 py-2 text-sm font-medium text-[#1A0F07] transition hover:bg-[#d8b884]"
                >
                  Join Free
                </Link>
              </>
            )}
          </div>

          <button
            aria-label="Open navigation"
            onClick={() => setIsMobileNavOpen((value) => !value)}
            className="md:hidden"
            type="button"
          >
            {isMobileNavOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        <AnimatePresence>
          {isMobileNavOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="border-t border-[#C9A96E]/20 bg-[#1A0F07]/95 px-5 py-4 md:hidden"
            >
              <div className="space-y-4 text-sm">
                <a
                  href="#discover"
                  className="block"
                  onClick={() => setIsMobileNavOpen(false)}
                >
                  Discover
                </a>
                <a
                  href="#how"
                  className="block"
                  onClick={() => setIsMobileNavOpen(false)}
                >
                  How it Works
                </a>
                <a
                  href="#about"
                  className="block"
                  onClick={() => setIsMobileNavOpen(false)}
                >
                  About
                </a>
                {isAuthenticated ? (
                  <Link
                    href="/dashboard"
                    className="block text-[#C9A96E]"
                    onClick={() => setIsMobileNavOpen(false)}
                  >
                    Dashboard
                  </Link>
                ) : (
                  <div className="flex gap-3 pt-2">
                    <Link
                      href="/auth/login"
                      className="rounded border border-[#C9A96E]/40 px-3 py-2"
                    >
                      Log In
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="rounded bg-[#C9A96E] px-3 py-2 text-[#1A0F07]"
                    >
                      Join Free
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <section className="relative flex min-h-screen items-center overflow-hidden px-5 pb-14 pt-28 md:px-8">
        <div className="absolute right-[-8%] top-[14%] hidden h-[72%] w-[52%] overflow-hidden rounded-l-[44px] lg:block">
          <Image
            src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=1600&q=80"
            alt="Atmospheric library shelves"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-[#1A0F07]/35" />
        </div>

        <div className="relative z-10 mx-auto grid w-full max-w-7xl grid-cols-1 gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-5 text-[11px] uppercase tracking-[0.25em] text-[#C9A96E]"
            >
              For readers who go deeper
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-serif text-[52px] leading-[0.95] sm:text-[72px] lg:text-[96px]"
            >
              Find Your Reading Tribe.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="mt-7 max-w-xl text-base leading-relaxed text-[#F2E8D9]/80 md:text-lg"
            >
              Discover thoughtful clubs, read with intention, and build
              conversations that outlast the final chapter.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mt-10 flex flex-wrap items-center gap-4"
            >
              <Link
                href={isAuthenticated ? "/clubs" : "/auth/signup"}
                className="inline-flex items-center gap-2 rounded bg-[#C9A96E] px-7 py-3 text-sm font-semibold text-[#1A0F07] transition hover:-translate-y-px hover:shadow-[0_10px_24px_rgba(0,0,0,0.35)]"
              >
                {isAuthenticated ? "Browse Clubs" : "Explore Clubs"}
                <ChevronRight className="h-4 w-4" />
              </Link>
              <a
                href="#how"
                className="rounded border border-[#C9A96E]/70 px-7 py-3 text-sm font-medium text-[#F2E8D9] transition hover:bg-[#C9A96E]/10"
              >
                How it Works
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 inline-flex items-center gap-2 rounded-full border border-[#C9A96E]/35 bg-[#2A1810]/70 px-4 py-2 text-sm text-[#F2E8D9]/90"
            >
              <Users className="h-4 w-4 text-[#C9A96E]" />
              <span>240+ Members · 18 Cities · Reading Now</span>
            </motion.div>
          </div>
        </div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2.2, repeat: Infinity }}
          className="absolute bottom-7 left-1/2 -translate-x-1/2 text-[#C9A96E]"
        >
          <ChevronDown className="h-6 w-6" />
        </motion.div>
      </section>

      <section id="discover" className="px-5 pb-24 md:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-5xl md:text-6xl"
          >
            Explore Clubs
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.06 }}
            className="mt-4 max-w-2xl text-[#F2E8D9]/75"
          >
            Public & private clubs — browse freely, join when ready.
          </motion.p>

          <div className="mt-10 flex gap-5 overflow-x-auto pb-2">
            {mockClubs.map((club, index) => (
              <motion.article
                key={club.id}
                variants={cardReveal}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={index}
                whileHover={{ y: -6 }}
                className="min-w-72 max-w-80 flex-1 rounded-xl border border-[#C9A96E]/25 bg-[#2A1810] shadow-[0_18px_40px_rgba(0,0,0,0.35)]"
              >
                <div className="relative h-44 overflow-hidden rounded-t-xl">
                  <Image
                    src={club.coverImage}
                    alt={club.name}
                    fill
                    className="object-cover"
                  />
                  <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-[#1A0F07]/80 px-3 py-1 text-xs text-[#F2E8D9]">
                    {club.isPrivate ? (
                      <Lock className="h-3 w-3 text-[#C9A96E]" />
                    ) : (
                      <Globe className="h-3 w-3 text-[#C9A96E]" />
                    )}
                    {club.isPrivate ? "Private 🔒" : "Public"}
                  </span>
                </div>
                <div className="space-y-4 p-5">
                  <h3 className="font-serif text-2xl">{club.name}</h3>
                  <p className="line-clamp-2 text-sm text-[#F2E8D9]/70">
                    {club.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-[#C9A96E]">
                    <Users className="h-4 w-4" />
                    <span>{club.memberCount} members</span>
                  </div>
                  <span className="inline-block rounded-full bg-[#8B4A3C]/30 px-3 py-1 text-xs text-[#F2E8D9]">
                    {club.genre}
                  </span>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Link
                      href={`/clubs/${club.id}`}
                      className="rounded border border-[#C9A96E]/40 px-3 py-2 text-center text-sm transition hover:bg-[#C9A96E]/10"
                    >
                      View Club
                    </Link>
                    {isAuthenticated ? (
                      <button
                        type="button"
                        className="rounded bg-[#C9A96E] px-3 py-2 text-sm font-semibold text-[#1A0F07] transition hover:bg-[#d8b884]"
                      >
                        {club.isPrivate ? "Request" : "Join"}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleJoinClick(club)}
                        className="rounded bg-[#C9A96E] px-3 py-2 text-sm font-semibold text-[#1A0F07] transition hover:bg-[#d8b884]"
                      >
                        {club.isPrivate ? "Request" : "Join"}
                      </button>
                    )}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          <div className="mt-7">
            <Link
              href="/clubs"
              className="inline-flex items-center gap-1 text-sm text-[#C9A96E] transition hover:text-[#e4c591]"
            >
              View all clubs <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-[#F2E8D9] px-5 py-24 text-[#1A0F07] md:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <motion.h2
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-serif text-5xl md:text-6xl"
          >
            Everything a reading club needs
          </motion.h2>

          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {[
              {
                title: "Live Reading Rooms",
                description:
                  "Meet in real-time for focused sessions and guided chapter discussions.",
                icon: MessageSquare,
              },
              {
                title: "Async Club Chat",
                description:
                  "Keep momentum between sessions with threaded, thoughtful commentary.",
                icon: MessageSquare,
              },
              {
                title: "Book Voting",
                description:
                  "Vote on next reads with transparent tally and clear decision windows.",
                icon: Vote,
              },
              {
                title: "Private & Public Clubs",
                description:
                  "Host open communities or private circles with request-only entry.",
                icon: Lock,
              },
              {
                title: "Reading Lists",
                description:
                  "Build living syllabi and archives that members can revisit anytime.",
                icon: BookOpen,
              },
              {
                title: "Member Discovery",
                description:
                  "Find readers by taste, pace, and discussion style across cities.",
                icon: Users,
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
                  className="rounded-xl border border-[#C9A96E]/45 bg-[#fff7ec] p-7 transition hover:border-[#C9A96E]"
                >
                  <Icon className="h-9 w-9 text-[#C9A96E]" />
                  <h3 className="mt-5 font-serif text-2xl">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#1A0F07]/75">
                    {feature.description}
                  </p>
                </motion.article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="how" className="bg-[#1A0F07] px-5 py-24 md:px-8">
        <div className="mx-auto w-full max-w-7xl">
          <h2 className="font-serif text-5xl md:text-6xl">How it Works</h2>
          <div className="mt-12 grid grid-cols-1 gap-8 lg:grid-cols-3">
            {[
              {
                step: "01",
                title: "Create or find a club",
                description:
                  "Start your own circle or join one that matches your reading pace and taste.",
                image:
                  "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=900&q=80",
              },
              {
                step: "02",
                title: "Join the conversation",
                description:
                  "Use live rooms and async chat to discuss ideas beyond the page.",
                image:
                  "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=900&q=80",
              },
              {
                step: "03",
                title: "Vote, read, and meet",
                description:
                  "Pick books together, schedule sessions, and build a stronger reading rhythm.",
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
                className="rounded-xl border border-[#C9A96E]/20 p-6"
              >
                <p className="font-serif text-7xl leading-none text-[#C9A96E]/70">
                  {step.step}
                </p>
                <div className="relative mt-5 h-40 overflow-hidden rounded-lg">
                  <Image
                    src={step.image}
                    alt={step.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="mt-5 font-serif text-3xl">{step.title}</h3>
                <p className="mt-3 text-sm text-[#F2E8D9]/75">
                  {step.description}
                </p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#1A0F07] px-5 pb-20 pt-8 md:px-8">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-10 lg:grid-cols-5">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative h-96 overflow-hidden rounded-2xl lg:col-span-3"
          >
            <Image
              src={featuredClub.coverImage}
              alt={featuredClub.name}
              fill
              className="object-cover"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-2"
          >
            <p className="text-[11px] uppercase tracking-[0.24em] text-[#C9A96E]">
              Featured Club
            </p>
            <h2 className="mt-3 font-serif text-5xl leading-[0.95] md:text-[64px]">
              {featuredClub.name}
            </h2>
            <div className="mt-6 flex gap-8 text-sm text-[#F2E8D9]/80">
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#C9A96E]">
                  Members
                </p>
                <p className="mt-1 text-xl font-semibold">
                  {featuredClub.memberCount}
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.18em] text-[#C9A96E]">
                  Genre
                </p>
                <p className="mt-1 text-xl font-semibold">
                  {featuredClub.genre}
                </p>
              </div>
            </div>
            <p className="mt-6 max-w-md text-base leading-relaxed text-[#F2E8D9]/80">
              {featuredClub.description}
            </p>

            <Link
              href={
                isAuthenticated
                  ? `/clubs/${featuredClub.id}`
                  : `/auth/login?returnTo=${encodeURIComponent(`/clubs/${featuredClub.id}`)}`
              }
              className="mt-8 inline-flex items-center gap-2 rounded bg-[#C9A96E] px-6 py-3 text-sm font-semibold text-[#1A0F07] transition hover:-translate-y-px hover:shadow-[0_10px_24px_rgba(0,0,0,0.35)]"
            >
              {isAuthenticated ? "View Club →" : "Join This Club →"}
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-[#C9A96E]/20 bg-[#2A1810] px-5 py-14 md:px-8">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-2 gap-y-8 lg:grid-cols-4">
          {[
            { value: "240+", label: "Members" },
            { value: "6", label: "Active Clubs" },
            { value: "12", label: "Books Discussed" },
            { value: "18", label: "Cities" },
          ].map((item, index) => (
            <div
              key={item.label}
              className={`text-center ${index > 0 ? "lg:border-l lg:border-[#C9A96E]/20" : ""}`}
            >
              <p className="font-serif text-5xl leading-none md:text-7xl">
                {item.value}
              </p>
              <p className="mt-3 text-[11px] uppercase tracking-[0.2em] text-[#C9A96E]">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#F2E8D9] px-5 py-24 text-[#1A0F07] md:px-8">
        <div className="mx-auto w-full max-w-5xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={testimonialIndex}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45 }}
              className="text-center"
            >
              <p className="font-serif text-4xl italic leading-tight md:text-6xl lg:text-7xl">
                “{testimonials[testimonialIndex].quote}”
              </p>
              <div className="mt-9 flex flex-col items-center gap-3">
                <Image
                  src={testimonials[testimonialIndex].avatarImage}
                  alt={testimonials[testimonialIndex].author}
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-full object-cover"
                />
                <p className="font-medium">
                  {testimonials[testimonialIndex].author}
                </p>
                <p className="text-[11px] uppercase tracking-[0.2em] text-[#8B4A3C]">
                  {testimonials[testimonialIndex].role}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={prevTestimonial}
              className="rounded-full border border-[#8B4A3C]/35 p-2 transition hover:bg-[#8B4A3C]/10"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={nextTestimonial}
              className="rounded-full border border-[#8B4A3C]/35 p-2 transition hover:bg-[#8B4A3C]/10"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>

      <section className="bg-[#1A0F07] px-5 py-20 md:px-8">
        <div className="mx-auto w-full max-w-5xl text-center">
          <h2 className="font-serif text-5xl leading-tight md:text-7xl">
            Read More. Think Deeper.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-[#F2E8D9]/75">
            Join thousands of readers in clubs built around great books.
          </p>

          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="mt-8 inline-flex items-center gap-2 rounded bg-[#C9A96E] px-7 py-3 text-sm font-semibold text-[#1A0F07] transition hover:bg-[#d8b884]"
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
                className="w-full rounded border border-[#C9A96E]/35 bg-[#2A1810] px-4 py-3 text-sm text-[#F2E8D9] placeholder:text-[#F2E8D9]/40 focus:border-[#C9A96E] focus:outline-none"
              />
              <button
                type="submit"
                className="rounded bg-[#C9A96E] px-6 py-3 text-sm font-semibold text-[#1A0F07] transition hover:bg-[#d8b884]"
              >
                Get Started Free
              </button>
            </form>
          )}
        </div>
      </section>

      <footer
        id="about"
        className="border-t border-[#C9A96E]/20 bg-[#2A1810] px-5 py-16 md:px-8"
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
                  <a href="#" className="transition hover:text-[#C9A96E]">
                    Features
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
                  <a href="#" className="transition hover:text-[#C9A96E]">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#C9A96E]">
                Community
              </p>
              <ul className="mt-4 space-y-2 text-sm text-[#F2E8D9]/80">
                <li>
                  <a href="#" className="transition hover:text-[#C9A96E]">
                    Discussions
                  </a>
                </li>
                <li>
                  <a href="#" className="transition hover:text-[#C9A96E]">
                    Newsletter
                  </a>
                </li>
                <li>
                  <a href="#" className="transition hover:text-[#C9A96E]">
                    Events
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-[#C9A96E]">
                Company
              </p>
              <ul className="mt-4 space-y-2 text-sm text-[#F2E8D9]/80">
                <li>
                  <a href="#" className="transition hover:text-[#C9A96E]">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="transition hover:text-[#C9A96E]">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="transition hover:text-[#C9A96E]">
                    Terms
                  </a>
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

      <AnimatePresence>
        {showJoinPrompt && !isAuthenticated ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#1A0F07]/70 px-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 14 }}
              className="w-full max-w-md rounded-2xl border border-[#C9A96E]/30 bg-[#2A1810] p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.2em] text-[#C9A96E]">
                    Join required
                  </p>
                  <h3 className="mt-2 font-serif text-3xl">
                    Create a free account to join
                  </h3>
                </div>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setShowJoinPrompt(false)}
                  className="rounded p-1 text-[#F2E8D9]/70 hover:bg-[#1A0F07] hover:text-[#F2E8D9]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="mt-4 text-sm text-[#F2E8D9]/75">
                You tried to join{" "}
                <span className="text-[#C9A96E]">{joinTargetName}</span>. Sign
                up or log in and we will continue from there.
              </p>

              <div className="mt-6 flex gap-3">
                <Link
                  href={`/auth/signup?returnTo=${encodeURIComponent("/clubs")}`}
                  className="rounded bg-[#C9A96E] px-4 py-2 text-sm font-semibold text-[#1A0F07]"
                >
                  Sign up
                </Link>
                <Link
                  href={`/auth/login?returnTo=${encodeURIComponent("/clubs")}`}
                  className="rounded border border-[#C9A96E]/35 px-4 py-2 text-sm"
                >
                  Log in
                </Link>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
