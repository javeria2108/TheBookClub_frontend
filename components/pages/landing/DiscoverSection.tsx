"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Globe, Lock, Users } from "lucide-react";
import type { LandingClub } from "@/lib/types";

interface DiscoverSectionProps {
  clubs: LandingClub[];
  isAuthenticated: boolean;
  onJoinClick: (club: LandingClub) => void;
}
