"use client";

import { motion } from "framer-motion";
import { Globe, Lock, Users } from "lucide-react";
import type { LandingClub } from "@/lib/types";

interface DiscoverSectionProps {
  clubs: LandingClub[];
}

const cardReveal = {
  hidden: { opacity: 0, y: 18 },
  visible: (index: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: index * 0.08 },
  }),
};

export function DiscoverSection({ clubs }: DiscoverSectionProps) {
  return (
    <section
      id="discover"
      className="relative overflow-hidden px-5 pb-28 pt-20 md:px-8"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(19,176,168,0.14),transparent_28%),linear-gradient(180deg,#090807_0%,#120c08_42%,#080706_100%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-[#C9A96E]/30" />

      <div className="relative mx-auto w-full max-w-7xl">
        <div className="flex flex-col justify-between gap-6 border-b border-[#C9A96E]/25 pb-8 lg:flex-row lg:items-end">
          <div className="min-w-0">
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[11px] uppercase tracking-[0.18em] text-[#E8C46D] sm:tracking-[0.28em]"
            >
              Choose your table
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.04 }}
              className="mt-3 break-words font-serif text-4xl font-black leading-none text-[#F7DFA5] sm:text-5xl md:text-7xl"
            >
              Explore Clubs
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="max-w-xl text-sm leading-relaxed text-[#F2E8D9]/72 md:text-base"
          >
            Public and private circles are laid out like reader cards: scan the
            cover, choose the mood, then step into the discussion.
          </motion.p>
        </div>

        {clubs.length === 0 ? (
          <div className="mt-10 rounded-md border border-[#E8C46D]/25 bg-[#100b08] p-6 text-center sm:mt-12">
            <h3 className="font-serif text-3xl text-[#F7DFA5]">
              No clubs yet
            </h3>
            <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-[#F2E8D9]/70">
              Create the first reading circle and it will appear here for new
              readers to discover.
            </p>
          </div>
        ) : (
        <div className="-mx-4 mt-10 flex snap-x gap-4 overflow-x-auto px-4 pb-5 sm:mx-0 sm:mt-12 sm:gap-6 sm:px-0">
          {clubs.map((club, index) => (
            <motion.article
              key={club.id}
              variants={cardReveal}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={index}
              whileHover={{ y: -6 }}
              className="group min-w-0 w-[min(18rem,calc(100vw-2rem))] shrink-0 snap-start overflow-hidden rounded-md border border-[#E8C46D]/35 bg-[#100b08] shadow-[0_26px_56px_rgba(0,0,0,0.58)] sm:w-80"
            >
              <div className="relative h-44 overflow-hidden border-b border-[#E8C46D]/25 sm:h-52">
                {club.coverImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={club.coverImage}
                    alt={club.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_50%_32%,rgba(232,196,109,0.24),transparent_34%),linear-gradient(135deg,#0E2B27,#100B08_58%,#201109)]">
                    <span className="px-5 text-center font-serif text-3xl leading-tight text-[#F7DFA5]">
                      {club.name}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,7,6,0.08),rgba(8,7,6,0.76))]" />
                <span className="absolute right-3 top-3 inline-flex items-center gap-1 border border-[#E8C46D]/45 bg-[#090807]/80 px-3 py-1 text-xs text-[#F2E8D9] backdrop-blur">
                  {club.isPrivate ? (
                    <Lock className="h-3 w-3 text-[#C9A96E]" />
                  ) : (
                    <Globe className="h-3 w-3 text-[#C9A96E]" />
                  )}
                  {club.isPrivate ? "Private" : "Public"}
                </span>
                <p className="absolute bottom-4 left-4 text-[10px] uppercase tracking-[0.2em] text-[#E8C46D]">
                  {club.genre}
                </p>
              </div>

              <div className="space-y-4 p-4 sm:p-5">
                <h3 className="break-words font-serif text-2xl leading-tight text-[#F7DFA5] sm:text-3xl sm:leading-none">
                  {club.name}
                </h3>
                <p className="line-clamp-2 text-sm text-[#F2E8D9]/70">
                  {club.description}
                </p>
                <div className="flex flex-col gap-3 border-t border-[#C9A96E]/20 pt-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex min-w-0 items-center gap-2 text-sm text-[#E8C46D]">
                    <Users className="h-4 w-4" />
                    <span className="truncate">{club.memberCount} members</span>
                  </div>
                  <p className="text-xs uppercase tracking-[0.12em] text-[#F2E8D9]/60 sm:tracking-[0.16em]">
                    View inside
                  </p>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
        )}
      </div>
    </section>
  );
}
