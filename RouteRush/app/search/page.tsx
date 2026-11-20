import Link from "next/link";
import {
  ResultsExperience,
  type SearchValues,
} from "@/components/route-rush/results-experience";
import { dataset } from "@/lib/server/db";
import { querySchema, search } from "@/lib/server/model";
import { present } from "@/lib/server/presentation";
export const dynamic = "force-dynamic";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = Object.fromEntries(
    Object.entries(params).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]),
  );
  const date =
    raw.date ||
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
  const next = new Date(Date.parse(date + "T00:00:00Z") + 86400000);
  const deadline =
    raw.deadline ||
    (raw.arriveBefore && Number.isFinite(+next)
      ? next.toISOString().slice(0, 10) + "T" + raw.arriveBefore + ":00+05:30"
      : "");
  const parsed = querySchema.safeParse({
    ...raw,
    from: raw.from || "Indore",
    to: raw.to || "Delhi",
    date,
    deadline,
    budget: raw.budget ?? 10000,
    maxTransfers: raw.maxTransfers ?? 2,
  });
  if (!parsed.success)
    return (
      <main className="p-8">
        <h1>Check your search details</h1>
        <p>{parsed.error.issues.map((i) => i.message).join("; ")}</p>
        <Link href="/">Return to search</Link>
      </main>
    );
  const q = parsed.data,
    d = dataset();
  const values: SearchValues = { ...q, arriveBefore: raw.arriveBefore };
  return (
    <ResultsExperience
      key={JSON.stringify(q)}
      search={values}
      backendJourneys={search(q, d.services, d.transfers).map((t) =>
        present(t, q.date),
      )}
    />
  );
}
