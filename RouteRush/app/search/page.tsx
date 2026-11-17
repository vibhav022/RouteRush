import { redirect } from "next/navigation";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const p = await searchParams;
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(p))
    if (typeof v === "string") q.set(k, v);
  redirect("/planner?" + q);
}
