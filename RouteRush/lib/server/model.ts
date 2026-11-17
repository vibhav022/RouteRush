import { z } from "zod";
const timestamp = z.string().datetime({ offset: true });
export const serviceSchema = z
  .object({
    id: z.string().min(1).max(100),
    mode: z.enum(["train", "bus"]),
    operator: z.string().min(1).max(120),
    from: z.string().min(1).max(100),
    to: z.string().min(1).max(100),
    fromCity: z.string().min(1).max(100),
    toCity: z.string().min(1).max(100),
    departure: timestamp,
    arrival: timestamp,
    fare: z.number().nonnegative().max(100000),
    seats: z.number().int().nonnegative().max(10000).nullable(),
    status: z.enum(["available", "waitlisted", "sold-out", "unknown"]),
    source: z.string().min(1).max(200),
    checkedAt: timestamp,
    simulated: z.boolean(),
  })
  .refine(
    (s) => Date.parse(s.arrival) > Date.parse(s.departure),
    "Arrival must follow departure",
  )
  .refine((s) => s.from !== s.to, "Terminals must differ");
export const transferSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  minutes: z.number().int().min(0).max(720),
  boarding: z.number().int().min(0).max(180),
  cost: z.number().min(0).max(10000),
});
export const datasetSchema = z
  .object({
    services: z.array(serviceSchema).min(1).max(5000),
    transfers: z.array(transferSchema).max(1000),
  })
  .superRefine((d, c) => {
    if (new Set(d.services.map((s) => s.id)).size !== d.services.length)
      c.addIssue({ code: "custom", message: "Duplicate service IDs" });
    if (
      new Set(d.transfers.map((t) => t.from + "|" + t.to)).size !==
      d.transfers.length
    )
      c.addIssue({ code: "custom", message: "Duplicate transfer pairs" });
  });
export type Service = z.infer<typeof serviceSchema>;
export type Transfer = z.infer<typeof transferSchema>;
export const querySchema = z
  .object({
    from: z.string().min(1).max(100),
    to: z.string().min(1).max(100),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .refine((s) => {
        const d = new Date(s);
        return Number.isFinite(+d) && d.toISOString().slice(0, 10) === s;
      }, "Invalid date"),
    travellers: z.coerce.number().int().min(1).max(12).default(1),
    budget: z.coerce.number().min(0).max(1000000).default(10000),
    deadline: z.union([timestamp, z.literal("")]).default(""),
    mode: z.enum(["all", "train", "bus", "combined"]).default("all"),
    maxTransfers: z.coerce.number().int().min(0).max(2).default(1),
    sort: z
      .enum(["arrival", "price", "duration", "transfers"])
      .default("arrival"),
  })
  .refine(
    (q) => q.from.toLowerCase() !== q.to.toLowerCase(),
    "Origin and destination must differ",
  );
export type Query = z.infer<typeof querySchema>;
export type Trip = {
  id: string;
  legs: Service[];
  transfers: (Transfer & { gap: number; slack: number })[];
  total: number;
  duration: number;
  usable: boolean;
  issues: string[];
  simulated: boolean;
};
export function search(
  q: Query,
  services: Service[],
  transfers: Transfer[],
  now = Date.now(),
): Trip[] {
  const start = Date.parse(q.date + "T00:00:00+05:30"),
    end = start + 86400000,
    horizon = start + 72 * 3600000;
  const matches = (input: string, terminal: string, city: string) =>
    [terminal, city].some((s) => s.toLowerCase() === input.toLowerCase());
  const candidates = services
    .filter(
      (s) =>
        Date.parse(s.departure) >= start &&
        Date.parse(s.arrival) <= horizon &&
        (q.mode === "all" || q.mode === "combined" || s.mode === q.mode),
    )
    .sort((a, b) => a.departure.localeCompare(b.departure));
  const trips: Trip[] = [];
  let explored = 0;
  function visit(
    legs: Service[],
    links: Trip["transfers"],
    visited: Set<string>,
  ) {
    if (++explored > 30000)
      throw new RangeError(
        "Search is too broad. Choose an exact terminal or fewer transfers.",
      );
    const last = legs[legs.length - 1];
    if (matches(q.to, last.to, last.toCity)) {
      if (q.mode === "combined" && new Set(legs.map((s) => s.mode)).size < 2)
        return;
      const total =
        legs.reduce((n, s) => n + s.fare * q.travellers, 0) +
        links.reduce((n, t) => n + t.cost, 0);
      if (
        total > q.budget ||
        (q.deadline && Date.parse(last.arrival) > Date.parse(q.deadline))
      )
        return;
      const issues: string[] = [];
      for (const s of legs) {
        if (s.status !== "available") issues.push(`${s.operator}: ${s.status}`);
        else if (s.seats === null)
          issues.push(`${s.operator}: seat count unknown`);
        else if (s.seats < q.travellers)
          issues.push(
            `${s.operator}: only ${s.seats} seats for ${q.travellers} travellers`,
          );
        if (
          !s.simulated &&
          (now - Date.parse(s.checkedAt) > 15 * 60000 ||
            Date.parse(s.checkedAt) > now + 60000)
        )
          issues.push(`${s.operator}: inventory needs rechecking`);
      }
      links.forEach((t) => {
        if (t.slack < 0)
          issues.push(
            `${t.from} → ${t.to}: transfer short by ${-t.slack} minutes`,
          );
      });
      trips.push({
        id: legs.map((s) => s.id).join("|"),
        legs,
        transfers: links,
        total,
        duration:
          (Date.parse(last.arrival) - Date.parse(legs[0].departure)) / 60000,
        usable: issues.length === 0,
        issues,
        simulated: legs.some((s) => s.simulated),
      });
      return;
    }
    if (legs.length > q.maxTransfers) return;
    for (const next of candidates) {
      if (
        next.fromCity !== last.toCity ||
        visited.has(next.toCity) ||
        legs.some((s) => s.id === next.id)
      )
        continue;
      const gap =
        (Date.parse(next.departure) - Date.parse(last.arrival)) / 60000;
      if (gap < 0 || gap > 720) continue;
      const transfer = transfers.find(
        (t) => t.from === last.to && t.to === next.from,
      );
      if (!transfer) continue;
      visit(
        [...legs, next],
        [
          ...links,
          {
            ...transfer,
            gap,
            slack: gap - transfer.minutes - transfer.boarding,
          },
        ],
        new Set([...visited, next.toCity]),
      );
    }
  }
  for (const s of candidates)
    if (matches(q.from, s.from, s.fromCity) && Date.parse(s.departure) < end)
      visit([s], [], new Set([s.fromCity, s.toCity]));
  const metric = (t: Trip) =>
    q.sort === "price"
      ? t.total
      : q.sort === "duration"
        ? t.duration
        : q.sort === "transfers"
          ? t.transfers.length
          : Date.parse(t.legs[t.legs.length - 1].arrival);
  return trips
    .sort(
      (a, b) =>
        Number(b.usable) - Number(a.usable) ||
        metric(a) - metric(b) ||
        a.total - b.total,
    )
    .slice(0, 100);
}
