"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import {motion} from "framer-motion"
import { BookOpen, ChevronLeft, Globe, Lock, Users } from "lucide-react"
import Link from "next/link"
import type { Club } from "@/lib/types"

export default function ClubDetailPage() {
    const params = useParams()
    const clubId = params.id as string

    const [club, setClub] = useState<Club | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState("")

    return (
        <main className="min-h-screen bg-[#1A0F07] text-[#F2E8D9]">
            <p>Club ID: {clubId}</p>
        </main>
    )
}