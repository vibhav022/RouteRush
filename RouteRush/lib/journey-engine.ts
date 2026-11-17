import type { Journey, JourneySegment } from "../data/journeys";
export type Service = JourneySegment & {
  originCity: string;
  destinationCity: string;
};
export const minutes = (t: string, d = 0) =>
  d * 1440 + Number(t.slice(0, 2)) * 60 + Number(t.slice(3));
export const instant = (date: string, t: string, d = 0) =>
  Date.parse(`${date}T00:00:00+05:30`) + minutes(t, d) * 60000;
function s(
  id: string,
  mode: "bus" | "train",
  originCity: string,
  destinationCity: string,
  originCode: string,
  destinationCode: string,
  departureTime: string,
  arrivalTime: string,
  price: number,
  seatsRemaining: number,
  status: JourneySegment["availabilityStatus"] = "available",
  dep = 0,
  arr = 1,
): Service {
  return {
    id,
    mode,
    originCity,
    destinationCity,
    originCode,
    destinationCode,
    originName: originCode,
    destinationName: destinationCode,
    departureTime,
    arrivalTime,
    price,
    seatsRemaining,
    availabilityStatus: status,
    departureDayOffset: dep,
    arrivalDayOffset: arr,
    operator: `Demo ${id}`,
    serviceNumber: id,
    travelClass: "Simulated standard seat",
    refundable: false,
    durationMinutes: minutes(arrivalTime, arr) - minutes(departureTime, dep),
  };
}
export const services: Service[] = [
  s(
    "direct-train-1",
    "train",
    "Indore",
    "Delhi",
    "INDB",
    "NDLS",
    "16:00",
    "07:00",
    800,
    0,
    "waitlisted",
  ),
  s(
    "direct-train-2",
    "train",
    "Indore",
    "Delhi",
    "INDB",
    "NDLS",
    "18:00",
    "10:00",
    950,
    4,
  ),
  s(
    "direct-bus-1",
    "bus",
    "Indore",
    "Delhi",
    "IDR",
    "DEL",
    "16:00",
    "08:00",
    1400,
    8,
  ),
  s(
    "direct-bus-2",
    "bus",
    "Indore",
    "Delhi",
    "IDR",
    "DEL",
    "17:00",
    "08:30",
    1100,
    0,
    "sold-out",
  ),
  s(
    "shared-bus",
    "bus",
    "Indore",
    "Bhopal",
    "IDR",
    "BPL-BUS",
    "15:00",
    "19:00",
    350,
    6,
    "available",
    0,
    0,
  ),
  s(
    "train-A",
    "train",
    "Bhopal",
    "Delhi",
    "BPL",
    "NDLS",
    "20:45",
    "07:50",
    550,
    3,
  ),
  s(
    "train-B",
    "train",
    "Bhopal",
    "Delhi",
    "BPL",
    "NDLS",
    "21:20",
    "08:35",
    690,
    6,
  ),
  s(
    "ujjain-bus",
    "bus",
    "Indore",
    "Ujjain",
    "IDR",
    "UJN-BUS",
    "14:00",
    "16:00",
    250,
    5,
    "available",
    0,
    0,
  ),
  s(
    "ujjain-train",
    "train",
    "Ujjain",
    "Delhi",
    "UJN",
    "NDLS",
    "16:40",
    "06:30",
    600,
    5,
  ),
  s(
    "jaipur-train",
    "train",
    "Indore",
    "Jaipur",
    "INDB",
    "JP",
    "14:00",
    "02:00",
    500,
    5,
  ),
  s(
    "jaipur-bus",
    "bus",
    "Jaipur",
    "Delhi",
    "JP-BUS",
    "DEL",
    "03:00",
    "08:00",
    400,
    0,
    "unknown",
    1,
    1,
  ),
];
const transfers = [
  { from: "BPL-BUS", to: "BPL", movement: 30, boarding: 25, cost: 100 },
  { from: "UJN-BUS", to: "UJN", movement: 30, boarding: 25, cost: 80 },
  { from: "JP", to: "JP-BUS", movement: 25, boarding: 20, cost: 100 },
];
export function qualifies(j: Journey) {
  return (
    j.connectionViable !== false &&
    j.segments.every((s) => ["available", "few"].includes(s.availabilityStatus))
  );
}
export function generateJourneys(
  q: {
    from: string;
    to: string;
    date: string;
    travellers: number;
    mode: string;
  },
  inventory = services,
): Journey[] {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(q.date) ||
    !Number.isFinite(instant(q.date, "00:00")) ||
    !Number.isInteger(q.travellers) ||
    q.travellers < 1
  )
    return [];
  const match = (input: string, name: string, code: string) =>
    input.toLowerCase() === name.toLowerCase() ||
    input.toUpperCase() === code ||
    (input === "Indore Junction" && code === "INDB") ||
    (input === "New Delhi" && code === "NDLS");
  const paths: Service[][] = [];
  for (const a of inventory.filter((s) =>
    match(q.from, s.originCity, s.originCode),
  )) {
    if (match(q.to, a.destinationCity, a.destinationCode)) paths.push([a]);
    else
      for (const b of inventory)
        if (
          a.destinationCity === b.originCity &&
          match(q.to, b.destinationCity, b.destinationCode) &&
          minutes(b.departureTime, b.departureDayOffset) >=
            minutes(a.arrivalTime, a.arrivalDayOffset)
        )
          paths.push([a, b]);
  }
  return paths
    .filter(
      (p) =>
        q.mode === "all" ||
        (q.mode === "combined"
          ? new Set(p.map((s) => s.mode)).size > 1
          : p.every((s) => s.mode === q.mode)),
    )
    .map((p) => {
      const a = p[0],
        b = p[p.length - 1],
        t =
          p.length > 1
            ? transfers.find(
                (t) => t.from === a.destinationCode && t.to === b.originCode,
              )
            : undefined;
      const gap =
        p.length > 1
          ? minutes(b.departureTime, b.departureDayOffset) -
            minutes(a.arrivalTime, a.arrivalDayOffset)
          : 0;
      const slack = t ? gap - t.movement - t.boarding : 0,
        viable = p.length === 1 || Boolean(t && slack >= 0);
      const segments = p.map((s) => ({
        ...s,
        availabilityStatus:
          ["available", "few"].includes(s.availabilityStatus) &&
          (s.seatsRemaining ?? 0) < q.travellers
            ? ("sold-out" as const)
            : s.availabilityStatus,
      }));
      const totalPrice =
        p.reduce((n, s) => n + s.price, 0) * q.travellers + (t?.cost ?? 0);
      const reason =
        p.length === 1
          ? "Direct service."
          : t
            ? `${gap} min connection − ${t.movement} min terminal travel − ${t.boarding} min boarding = ${slack} min spare. Transfer ₹${t.cost}.`
            : "Transfer estimate unknown.";
      return {
        id: p.map((s) => s.id).join("--"),
        origin: q.from,
        destination: q.to,
        segments,
        modes: p.map((s) => s.mode),
        departureTime: a.departureTime,
        arrivalTime: b.arrivalTime,
        departureDayOffset: a.departureDayOffset,
        arrivalDayOffset: b.arrivalDayOffset,
        totalDurationMinutes:
          minutes(b.arrivalTime, b.arrivalDayOffset) -
          minutes(a.departureTime, a.departureDayOffset),
        totalWaitingMinutes: gap,
        totalPrice,
        transferCount: p.length - 1,
        availabilityStatus:
          segments.find(
            (s) => !["available", "few"].includes(s.availabilityStatus),
          )?.availabilityStatus ?? "available",
        seatsRemaining: Math.min(...p.map((s) => s.seatsRemaining ?? 0)),
        connectionRisk:
          p.length === 1 ? "direct" : slack < 20 ? "tight" : "comfortable",
        recommendationTags: viable ? [] : ["Connection not usable"],
        recommendationReason: `${reason} Total ₹${totalPrice} for ${q.travellers} traveller(s).`,
        lastCheckedAt: "Simulated fixture snapshot",
        requiresSeparateTickets: p.length > 1,
        transfers:
          p.length > 1
            ? [
                {
                  city: a.destinationCity,
                  waitMinutes: gap,
                  sameLocation: false,
                  note: reason,
                },
              ]
            : [],
        connectionViable: viable,
        transferCost: t?.cost ?? 0,
      };
    });
}
