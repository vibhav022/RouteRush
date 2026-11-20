import type { Trip } from "./model";
import type { Journey } from "../../data/journeys";
export function present(t: Trip, date: string): Journey {
  const local = (s: string) =>
    new Date(Date.parse(s) + 330 * 60000).toISOString();
  const day = (s: string) =>
    Math.round(
      (Date.parse(local(s).slice(0, 10)) - Date.parse(date)) / 86400000,
    );
  const segments = t.legs.map((s) => ({
    id: s.id,
    mode: s.mode,
    operator: s.operator,
    serviceNumber: s.id,
    originName: s.from,
    originCode: s.from,
    destinationName: s.to,
    destinationCode: s.to,
    departureTime: local(s.departure).slice(11, 16),
    arrivalTime: local(s.arrival).slice(11, 16),
    departureDayOffset: day(s.departure),
    arrivalDayOffset: day(s.arrival),
    durationMinutes: (Date.parse(s.arrival) - Date.parse(s.departure)) / 60000,
    travelClass: "Standard",
    price: s.fare,
    availabilityStatus:
      s.status === "available" &&
      (s.seats === null ||
        t.issues.some((issue) => issue.startsWith(s.operator + ":")))
        ? ("unknown" as const)
        : s.status,
    seatsRemaining: s.seats ?? undefined,
    refundable: false,
  }));
  return {
    id: t.id,
    origin: t.legs[0].fromCity,
    destination: t.legs.at(-1)!.toCity,
    segments,
    modes: segments.map((s) => s.mode),
    departureTime: segments[0].departureTime,
    arrivalTime: segments.at(-1)!.arrivalTime,
    departureDayOffset: segments[0].departureDayOffset,
    arrivalDayOffset: segments.at(-1)!.arrivalDayOffset,
    totalDurationMinutes: t.duration,
    totalWaitingMinutes: t.transfers.reduce((n, s) => n + s.gap, 0),
    totalPrice: t.total,
    transferCost: t.transfers.reduce((n, s) => n + s.cost, 0),
    transferCount: t.transfers.length,
    availabilityStatus: t.usable
      ? "available"
      : (segments.find((s) => s.availabilityStatus !== "available")
          ?.availabilityStatus ?? "unknown"),
    connectionViable: t.usable,
    connectionRisk:
      t.transfers.length === 0
        ? "direct"
        : t.transfers.some((s) => s.slack < 20)
          ? "tight"
          : "comfortable",
    recommendationTags: [],
    recommendationReason: t.issues.length
      ? t.issues.join("; ")
      : t.transfers
          .map(
            (s) =>
              `${s.gap} min connection − ${s.minutes} min travel − ${s.boarding} min boarding = ${s.slack} min spare.`,
          )
          .join(" ") || "Direct journey.",
    lastCheckedAt: t.simulated
      ? "Simulated schedule"
      : t.legs.map((s) => `${s.source}: ${s.checkedAt}`).join("; "),
    requiresSeparateTickets: segments.length > 1,
    transfers: t.transfers.map((s, i) => ({
      city: t.legs[i].toCity,
      waitMinutes: s.gap,
      sameLocation: s.from === s.to,
      note: `${s.minutes} min terminal travel + ${s.boarding} min boarding. ${s.slack} min spare; transfer ₹${s.cost}.`,
    })),
  };
}
