"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  Compass,
  Home,
  Library,
  LogOut,
  Menu,
  User,
  X,
} from "lucide-react";

import { logoutUser } from "@/lib/auth";

type HeaderMode = "landing" | "app";

type NavItem = {
  label: string;
  href: string;
  icon?: typeof Home;
};

interface AppHeaderProps {
  mode: HeaderMode;
  isAuthenticated: boolean;
  isAuthReady?: boolean;
  userInitial?: string;
  onLogout?: () => Promise<void> | void;
}

const LANDING_NAV_ITEMS: NavItem[] = [
  { label: "Discover", href: "#discover" },
  { label: "How it Works", href: "#how" },
  { label: "About", href: "#about" },
];

const APP_NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/dashboard", icon: Home },
  { label: "Discover", href: "/clubs", icon: Compass },
  { label: "My Clubs", href: "/my-clubs", icon: Library },
  { label: "Profile", href: "/profile", icon: User },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  if (href === "/clubs") return pathname === "/clubs" || pathname.startsWith("/clubs/");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppHeader({
  mode,
  isAuthenticated,
  isAuthReady = true,
  userInitial,
  onLogout,
}: AppHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);

  const navItems = useMemo(() => {
    if (mode === "landing") return LANDING_NAV_ITEMS;
    return APP_NAV_ITEMS;
  }, [mode]);

  const handleLogout = async () => {
    setIsMobileNavOpen(false);
    setIsAvatarMenuOpen(false);
    if (onLogout) {
      await onLogout();
    } else {
      await logoutUser();
    }
    router.push("/auth/login");
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-40 border-b transition-all duration-300 ${
          mode === "landing"
            ? "border-[#C9A96E]/20 bg-transparent"
            : "border-[var(--app-border-subtle)] bg-[rgba(8,11,10,0.82)] backdrop-blur-md"
        }`}
      >
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-3 px-4 md:px-8">
          <Link href={mode === "landing" ? "/" : "/dashboard"} className="flex min-w-0 items-center gap-2">
            <BookOpen className="h-5 w-5 shrink-0 text-[var(--app-accent-gold)]" />
            <span className="truncate font-serif text-2xl leading-none text-[var(--app-text-primary)] sm:text-3xl md:text-2xl">
              BookCircle
            </span>
          </Link>

          <nav
            className="hidden items-center gap-2 text-sm md:flex"
            aria-label={mode === "landing" ? "Landing navigation" : "Primary navigation"}
          >
            {navItems.map((item) => {
              const active = mode === "app" && isActivePath(pathname, item.href);
              const className = `rounded-full px-3 py-2 transition ${
                active
                  ? "bg-[var(--app-accent-teal-soft)] text-[var(--app-accent-gold-hover)]"
                  : "text-[var(--app-text-secondary)] hover:text-[var(--app-accent-gold-hover)]"
              }`;

              return item.href.startsWith("#") ? (
                <a key={item.label} href={item.href} className={className}>
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className={className}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {!isAuthReady ? (
              <div className="h-10 w-10 animate-pulse rounded-full border border-[var(--app-border-subtle)] bg-[var(--app-surface)]" />
            ) : isAuthenticated ? (
              <div className="relative">
                {mode === "landing" ? (
                  <Link
                    href="/dashboard"
                    className="mr-3 text-sm text-[var(--app-text-primary)] transition hover:text-[var(--app-accent-gold-hover)]"
                  >
                    Dashboard
                  </Link>
                ) : null}
                <button
                  type="button"
                  onClick={() => setIsAvatarMenuOpen((value) => !value)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--app-border-strong)] bg-[var(--app-accent-gold)] text-sm font-bold text-[#171008]"
                  aria-haspopup="menu"
                  aria-expanded={isAvatarMenuOpen}
                  aria-label="Open account menu"
                >
                  {userInitial ?? "R"}
                </button>
                <AnimatePresence>
                  {isAvatarMenuOpen ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      className="absolute right-0 mt-3 w-52 rounded-xl border border-[var(--app-border-subtle)] bg-[var(--app-surface-elevated)] p-2 shadow-[0_18px_44px_rgba(0,0,0,0.4)]"
                      role="menu"
                    >
                      <Link
                        href="/profile"
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--app-text-primary)] hover:bg-[rgba(216,181,109,0.08)]"
                        role="menuitem"
                        onClick={() => setIsAvatarMenuOpen(false)}
                      >
                        <User className="h-4 w-4 text-[var(--app-accent-gold)]" />
                        View Profile
                      </Link>
                      <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-[var(--app-text-primary)] hover:bg-[rgba(196,95,95,0.12)]"
                        role="menuitem"
                      >
                        <LogOut className="h-4 w-4 text-[var(--app-danger)]" />
                        Logout
                      </button>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm text-[var(--app-text-primary)] transition hover:text-[var(--app-accent-gold-hover)]"
                >
                  Log In
                </Link>
                <Link href="/auth/signup" className="app-button-primary">
                  Join Free
                </Link>
              </>
            )}
          </div>

          <button
            aria-label={isMobileNavOpen ? "Close navigation" : "Open navigation"}
            onClick={() => setIsMobileNavOpen((value) => !value)}
            className="shrink-0 md:hidden"
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
              className="border-t border-[var(--app-border-subtle)] bg-[rgba(8,11,10,0.96)] px-5 py-4 md:hidden"
            >
              <div className="space-y-4 text-sm">
                {mode === "landing"
                  ? LANDING_NAV_ITEMS.map((item) => (
                      <a
                        key={item.label}
                        href={item.href}
                        className="block"
                        onClick={() => setIsMobileNavOpen(false)}
                      >
                        {item.label}
                      </a>
                    ))
                  : null}

                {!isAuthReady ? (
                  <div className="h-9 w-28 animate-pulse rounded border border-[var(--app-border-subtle)] bg-[var(--app-surface)]" />
                ) : isAuthenticated ? (
                  <div className="space-y-2 pt-2">
                    <Link
                      href="/profile"
                      className="block text-[var(--app-accent-gold)]"
                      onClick={() => setIsMobileNavOpen(false)}
                    >
                      View Profile
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="block rounded border border-[rgba(196,95,95,0.4)] px-3 py-2 text-left text-sm text-[var(--app-text-primary)]"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3 pt-2">
                    <Link
                      href="/auth/login"
                      className="app-button-secondary"
                      onClick={() => setIsMobileNavOpen(false)}
                    >
                      Log In
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="app-button-primary"
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

      {mode === "app" && isAuthenticated ? (
        <nav
          className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--app-border-subtle)] bg-[rgba(8,11,10,0.94)] px-2 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2 backdrop-blur-md md:hidden"
          aria-label="Mobile primary navigation"
        >
          <div className="grid min-w-0 grid-cols-4 gap-1">
            {APP_NAV_ITEMS.map((item) => {
              const Icon = item.icon ?? Home;
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-14 min-w-0 flex-col items-center justify-center gap-1 rounded-xl px-1 text-[10px] font-medium sm:text-[11px] ${
                    active
                      ? "bg-[var(--app-accent-teal-soft)] text-[var(--app-accent-gold-hover)]"
                      : "text-[var(--app-text-secondary)]"
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  <span className="max-w-full truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      ) : null}
    </>
  );
}
