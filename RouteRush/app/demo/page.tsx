import type { Metadata } from "next"

import { ResultsExperience, SearchValues } from "@/components/route-rush/results-experience"

export const metadata: Metadata = {
  title: "Journey search",
  description: "Compare complete train, bus and connected journeys with clear availability, cost and transfer details.",
}

type SearchPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function first(value: string | string[] | undefined, fallback: string) {
  return Array.isArray(value) ? value[0] || fallback : value || fallback
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const fallbackDate = tomorrow.toISOString().split("T")[0]
  const rawMode = first(params.mode, "all")
  const mode: SearchValues["mode"] = ["all", "train", "bus", "combined"].includes(rawMode)
    ? (rawMode as SearchValues["mode"])
    : "all"

  const search: SearchValues = {
    from: first(params.from, "Indore"),
    to: first(params.to, "Delhi"),
    date: first(params.date, fallbackDate),
    travellers: Math.max(1, Math.min(6, Number(first(params.travellers, "1")) || 1)),
    mode,
    arriveBefore: first(params.arriveBefore, ""),
    budget: Math.max(0, Number(first(params.budget, "4000")) || 4000),
  }

  return <ResultsExperience search={search} />
}

