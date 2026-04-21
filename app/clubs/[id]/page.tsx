"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, ChevronLeft, Globe, Lock, Users } from "lucide-react";
import Link from "next/link";
import type { Club } from "@/lib/types";
import { getClubById } from "@/lib/clubs";

export default function ClubDetailPage() {
  const params = useParams();
  const clubId = params.id as string;

  const [club, setClub] = useState<Club | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadClub = async () => {
      try {
        setIsLoading(true);
        setError("");
        const response = await getClubById(clubId);
        setClub(response.club);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch club");
      } finally {
        setIsLoading(false);
      }
    };

    loadClub();
  }, [clubId]);

  return (
    <main className="min-h-screen bg-[#1A0F07] text-[#F2E8D9]">
      {isLoading && <p>Loading club...</p>}
      {error && <p className="text-red-400">{error}</p>}
      {club && <p>{club.name}</p>}
    </main>
  );
}
