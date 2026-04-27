"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { BookOpen, Menu, X } from "lucide-react";
import { logoutUser } from "@/lib/auth";

type HeaderMode = "landing" | "app";

type NavItem = {
  label: string;
  href: string;
};

interface AppHeaderProps {
  mode: HeaderMode;
  isAuthenticated: boolean;
  userInitial?: string;
}

const LANDING_NAV_ITEMS: NavItem[] = [
  { label: "Discover", href: "#discover" },
  { label: "How it Works", href: "#how" },
  { label: "About", href: "#about" },
];

const APP_NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Clubs", href: "/clubs" },
  { label: "Dashboard", href: "/dashboard" },
];

export function AppHeader({
  mode,
  isAuthenticated,
  userInitial,
}: AppHeaderProps) {
  const router = useRouter();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  const navItems = useMemo(() => {
    if (mode === "landing") return LANDING_NAV_ITEMS;
    
    // In app mode, guests don't see Dashboard (middleware blocks it anyway)
    if (!isAuthenticated) {
      return APP_NAV_ITEMS.filter((item) => item.label !== "Dashboard");
    }
    
    return APP_NAV_ITEMS;
  }, [mode, isAuthenticated]);

  const handleLogout = async () => {
    setIsMobileNavOpen(false);
    await logoutUser();
    router.push("/auth/login");
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-40 transition-all duration-300 ${
        mode === "landing"
          ? "bg-transparent"
          : "bg-[#1A0F07]/75 backdrop-blur-md"
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
          {navItems.map((item) =>
            item.href.startsWith("#") ? (
              <a key={item.label} href={item.href} className="transition hover:text-[#C9A96E]">
                {item.label}
              </a>
            ) : (
              <Link key={item.label} href={item.href} className="transition hover:text-[#C9A96E]">
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAuthenticated ? (
            <>
              {mode === "landing" ? (
                <Link
                  href="/dashboard"
                  className="text-sm text-[#F2E8D9] transition hover:text-[#C9A96E]"
                >
                  Dashboard
                </Link>
              ) : null}
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-full border border-[#C9A96E]/35 px-4 py-2 text-sm font-medium text-[#F2E8D9] transition hover:border-[#C9A96E] hover:text-[#C9A96E]"
              >
                Logout
              </button>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#C9A96E] text-sm font-semibold text-[#1A0F07]">
                {userInitial ?? "R"}
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
        {isMobileNavOpen ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-t border-[#C9A96E]/20 bg-[#1A0F07]/95 px-5 py-4 md:hidden"
          >
            <div className="space-y-4 text-sm">
              {navItems.map((item) =>
                item.href.startsWith("#") ? (
                  <a
                    key={item.label}
                    href={item.href}
                    className="block"
                    onClick={() => setIsMobileNavOpen(false)}
                  >
                    {item.label}
                  </a>
                ) : (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="block"
                    onClick={() => setIsMobileNavOpen(false)}
                  >
                    {item.label}
                  </Link>
                ),
              )}

              {isAuthenticated ? (
                <div className="space-y-2 pt-2">
                  {mode === "landing" ? (
                    <Link
                      href="/dashboard"
                      className="block text-[#C9A96E]"
                      onClick={() => setIsMobileNavOpen(false)}
                    >
                      Dashboard
                    </Link>
                  ) : null}
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="block rounded border border-[#C9A96E]/35 px-3 py-2 text-left text-sm text-[#F2E8D9]"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex gap-3 pt-2">
                  <Link
                    href="/auth/login"
                    className="rounded border border-[#C9A96E]/40 px-3 py-2"
                    onClick={() => setIsMobileNavOpen(false)}
                  >
                    Log In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="rounded bg-[#C9A96E] px-3 py-2 text-[#1A0F07]"
                    onClick={() => setIsMobileNavOpen(false)}
                  >
                    Join Free
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}