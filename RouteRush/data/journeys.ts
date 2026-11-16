export type TravelMode = "train" | "bus"

export type AvailabilityStatus =
  | "available"
  | "few"
  | "waitlisted"
  | "sold-out"
  | "unknown"

export type ConnectionRisk =
  | "direct"
  | "comfortable"
  | "moderate"
  | "tight"

export type JourneySegment = {
  id: string
  mode: TravelMode
  operator: string
  serviceNumber: string
  originName: string
  originCode: string
  destinationName: string
  destinationCode: string
  departureTime: string
  arrivalTime: string
  departureDayOffset: number
  arrivalDayOffset: number
  durationMinutes: number
  travelClass: string
  price: number
  availabilityStatus: AvailabilityStatus
  seatsRemaining?: number
  refundable: boolean
}

export type TransferDetail = {
  city: string
  waitMinutes: number
  sameLocation: boolean
  distanceKm?: number
  note: string
}

export type Journey = {
  connectionViable?: boolean
  transferCost?: number
  id: string
  origin: string
  destination: string
  segments: JourneySegment[]
  modes: TravelMode[]
  departureTime: string
  arrivalTime: string
  departureDayOffset: number
  arrivalDayOffset: number
  totalDurationMinutes: number
  totalWaitingMinutes: number
  totalPrice: number
  transferCount: number
  availabilityStatus: AvailabilityStatus
  seatsRemaining?: number
  connectionRisk: ConnectionRisk
  recommendationTags: string[]
  recommendationReason: string
  lastCheckedAt: string
  requiresSeparateTickets: boolean
  transfers: TransferDetail[]
}

// Demonstrative frontend-only data. No fare or availability below is live.
export const mockJourneys: Journey[] = [
  {
    id: "malwa-direct",
    origin: "Indore",
    destination: "Delhi",
    modes: ["train"],
    departureTime: "11:40",
    arrivalTime: "04:15",
    departureDayOffset: 0,
    arrivalDayOffset: 1,
    totalDurationMinutes: 995,
    totalWaitingMinutes: 0,
    totalPrice: 1785,
    transferCount: 0,
    availabilityStatus: "few",
    seatsRemaining: 5,
    connectionRisk: "direct",
    recommendationTags: ["Best overall", "Direct"],
    recommendationReason:
      "A direct overnight journey with no transfer risk and a competitive fare.",
    lastCheckedAt: "2 min ago",
    requiresSeparateTickets: false,
    transfers: [],
    segments: [
      {
        id: "malwa-1",
        mode: "train",
        operator: "Malwa Express",
        serviceNumber: "12919",
        originName: "Indore Junction",
        originCode: "INDB",
        destinationName: "New Delhi",
        destinationCode: "NDLS",
        departureTime: "11:40",
        arrivalTime: "04:15",
        departureDayOffset: 0,
        arrivalDayOffset: 1,
        durationMinutes: 995,
        travelClass: "3A · AC 3 Tier",
        price: 1785,
        availabilityStatus: "few",
        seatsRemaining: 5,
        refundable: true,
      },
    ],
  },
  {
    id: "indb-sf-direct",
    origin: "Indore",
    destination: "Delhi",
    modes: ["train"],
    departureTime: "16:45",
    arrivalTime: "05:10",
    departureDayOffset: 0,
    arrivalDayOffset: 1,
    totalDurationMinutes: 745,
    totalWaitingMinutes: 0,
    totalPrice: 2120,
    transferCount: 0,
    availabilityStatus: "waitlisted",
    connectionRisk: "direct",
    recommendationTags: ["Fastest direct"],
    recommendationReason:
      "The shortest direct train option, but the current mock status is waitlisted.",
    lastCheckedAt: "2 min ago",
    requiresSeparateTickets: false,
    transfers: [],
    segments: [
      {
        id: "indb-sf-1",
        mode: "train",
        operator: "INDB–NDLS Superfast",
        serviceNumber: "20957",
        originName: "Indore Junction",
        originCode: "INDB",
        destinationName: "New Delhi",
        destinationCode: "NDLS",
        departureTime: "16:45",
        arrivalTime: "05:10",
        departureDayOffset: 0,
        arrivalDayOffset: 1,
        durationMinutes: 745,
        travelClass: "2A · AC 2 Tier",
        price: 2120,
        availabilityStatus: "waitlisted",
        refundable: true,
      },
    ],
  },
  {
    id: "intrcity-direct",
    origin: "Indore",
    destination: "Delhi",
    modes: ["bus"],
    departureTime: "20:10",
    arrivalTime: "07:45",
    departureDayOffset: 0,
    arrivalDayOffset: 1,
    totalDurationMinutes: 695,
    totalWaitingMinutes: 0,
    totalPrice: 1499,
    transferCount: 0,
    availabilityStatus: "available",
    seatsRemaining: 8,
    connectionRisk: "direct",
    recommendationTags: ["Fastest", "Direct"],
    recommendationReason:
      "The quickest fully available direct option in this demo search.",
    lastCheckedAt: "1 min ago",
    requiresSeparateTickets: false,
    transfers: [],
    segments: [
      {
        id: "intrcity-1",
        mode: "bus",
        operator: "IntrCity SmartBus",
        serviceNumber: "IC-742",
        originName: "Star Square, Indore",
        originCode: "IDR",
        destinationName: "Kashmiri Gate ISBT",
        destinationCode: "DEL",
        departureTime: "20:10",
        arrivalTime: "07:45",
        departureDayOffset: 0,
        arrivalDayOffset: 1,
        durationMinutes: 695,
        travelClass: "AC Sleeper",
        price: 1499,
        availabilityStatus: "available",
        seatsRemaining: 8,
        refundable: true,
      },
    ],
  },
  {
    id: "nuego-direct",
    origin: "Indore",
    destination: "Delhi",
    modes: ["bus"],
    departureTime: "19:00",
    arrivalTime: "08:40",
    departureDayOffset: 0,
    arrivalDayOffset: 1,
    totalDurationMinutes: 820,
    totalWaitingMinutes: 0,
    totalPrice: 1249,
    transferCount: 0,
    availabilityStatus: "sold-out",
    connectionRisk: "direct",
    recommendationTags: ["Lowest direct fare"],
    recommendationReason:
      "The lowest direct fare, but it is sold out in the demonstrative data.",
    lastCheckedAt: "3 min ago",
    requiresSeparateTickets: false,
    transfers: [],
    segments: [
      {
        id: "nuego-1",
        mode: "bus",
        operator: "NueGo Electric Coach",
        serviceNumber: "NG-118",
        originName: "Vijay Nagar, Indore",
        originCode: "IDR",
        destinationName: "Anand Vihar ISBT",
        destinationCode: "DEL",
        departureTime: "19:00",
        arrivalTime: "08:40",
        departureDayOffset: 0,
        arrivalDayOffset: 1,
        durationMinutes: 820,
        travelClass: "AC Seater",
        price: 1249,
        availabilityStatus: "sold-out",
        refundable: false,
      },
    ],
  },
  {
    id: "bhopal-combo",
    origin: "Indore",
    destination: "Delhi",
    modes: ["bus", "train"],
    departureTime: "05:30",
    arrivalTime: "20:55",
    departureDayOffset: 0,
    arrivalDayOffset: 0,
    totalDurationMinutes: 925,
    totalWaitingMinutes: 95,
    totalPrice: 2320,
    transferCount: 1,
    availabilityStatus: "available",
    seatsRemaining: 11,
    connectionRisk: "comfortable",
    recommendationTags: ["Earliest arrival", "Safest connection"],
    recommendationReason:
      "It arrives the same day and allows a comfortable 1 hr 35 min transfer in Bhopal.",
    lastCheckedAt: "2 min ago",
    requiresSeparateTickets: true,
    transfers: [
      {
        city: "Bhopal",
        waitMinutes: 95,
        sameLocation: true,
        note: "Both services use the Rani Kamlapati terminal area.",
      },
    ],
    segments: [
      {
        id: "bhopal-bus",
        mode: "bus",
        operator: "Chartered Bus",
        serviceNumber: "CH-224",
        originName: "Vijay Nagar, Indore",
        originCode: "IDR",
        destinationName: "Rani Kamlapati",
        destinationCode: "RKMP",
        departureTime: "05:30",
        arrivalTime: "09:00",
        departureDayOffset: 0,
        arrivalDayOffset: 0,
        durationMinutes: 210,
        travelClass: "AC Seater",
        price: 520,
        availabilityStatus: "available",
        seatsRemaining: 14,
        refundable: true,
      },
      {
        id: "bhopal-train",
        mode: "train",
        operator: "Bhopal–Delhi Express",
        serviceNumber: "12155",
        originName: "Rani Kamlapati",
        originCode: "RKMP",
        destinationName: "New Delhi",
        destinationCode: "NDLS",
        departureTime: "10:35",
        arrivalTime: "20:55",
        departureDayOffset: 0,
        arrivalDayOffset: 0,
        durationMinutes: 620,
        travelClass: "3A · AC 3 Tier",
        price: 1800,
        availabilityStatus: "available",
        seatsRemaining: 11,
        refundable: true,
      },
    ],
  },
  {
    id: "kota-combo",
    origin: "Indore",
    destination: "Delhi",
    modes: ["bus", "train"],
    departureTime: "23:00",
    arrivalTime: "14:15",
    departureDayOffset: 0,
    arrivalDayOffset: 1,
    totalDurationMinutes: 915,
    totalWaitingMinutes: 120,
    totalPrice: 1980,
    transferCount: 1,
    availabilityStatus: "available",
    seatsRemaining: 18,
    connectionRisk: "comfortable",
    recommendationTags: ["Cheapest combined"],
    recommendationReason:
      "The lowest-priced fully available connected journey with a generous transfer window.",
    lastCheckedAt: "2 min ago",
    requiresSeparateTickets: true,
    transfers: [
      {
        city: "Kota",
        waitMinutes: 120,
        sameLocation: false,
        distanceKm: 3.2,
        note: "Allow 20–30 minutes for the transfer to Kota Junction.",
      },
    ],
    segments: [
      {
        id: "kota-bus",
        mode: "bus",
        operator: "Hans Travels",
        serviceNumber: "HT-091",
        originName: "Teen Imli, Indore",
        originCode: "IDR",
        destinationName: "Kota Bus Stand",
        destinationCode: "KOT",
        departureTime: "23:00",
        arrivalTime: "05:30",
        departureDayOffset: 0,
        arrivalDayOffset: 1,
        durationMinutes: 390,
        travelClass: "AC Sleeper",
        price: 880,
        availabilityStatus: "available",
        seatsRemaining: 18,
        refundable: true,
      },
      {
        id: "kota-train",
        mode: "train",
        operator: "Kota–Delhi Intercity",
        serviceNumber: "12401",
        originName: "Kota Junction",
        originCode: "KOTA",
        destinationName: "Hazrat Nizamuddin",
        destinationCode: "NZM",
        departureTime: "07:30",
        arrivalTime: "14:15",
        departureDayOffset: 1,
        arrivalDayOffset: 1,
        durationMinutes: 405,
        travelClass: "CC · Chair Car",
        price: 1100,
        availabilityStatus: "available",
        seatsRemaining: 22,
        refundable: true,
      },
    ],
  },
  {
    id: "ujjain-tight-combo",
    origin: "Indore",
    destination: "Delhi",
    modes: ["bus", "train"],
    departureTime: "14:10",
    arrivalTime: "06:50",
    departureDayOffset: 0,
    arrivalDayOffset: 1,
    totalDurationMinutes: 1000,
    totalWaitingMinutes: 42,
    totalPrice: 1640,
    transferCount: 1,
    availabilityStatus: "few",
    seatsRemaining: 4,
    connectionRisk: "tight",
    recommendationTags: ["Few seats left"],
    recommendationReason:
      "A low total fare, but the 42-minute location-changing transfer makes it a higher-risk option.",
    lastCheckedAt: "4 min ago",
    requiresSeparateTickets: true,
    transfers: [
      {
        city: "Ujjain",
        waitMinutes: 42,
        sameLocation: false,
        distanceKm: 6.5,
        note: "Tight transfer: the bus stop is 6.5 km from Ujjain Junction.",
      },
    ],
    segments: [
      {
        id: "ujjain-bus",
        mode: "bus",
        operator: "Atal Indore City Transport",
        serviceNumber: "AICT-66",
        originName: "Sarwate Bus Stand",
        originCode: "IDR",
        destinationName: "Nanakheda Bus Stand",
        destinationCode: "UJN",
        departureTime: "14:10",
        arrivalTime: "15:48",
        departureDayOffset: 0,
        arrivalDayOffset: 0,
        durationMinutes: 98,
        travelClass: "AC Seater",
        price: 240,
        availabilityStatus: "available",
        seatsRemaining: 9,
        refundable: false,
      },
      {
        id: "ujjain-train",
        mode: "train",
        operator: "Ujjain–Delhi Mail",
        serviceNumber: "14309",
        originName: "Ujjain Junction",
        originCode: "UJN",
        destinationName: "Delhi Junction",
        destinationCode: "DLI",
        departureTime: "16:30",
        arrivalTime: "06:50",
        departureDayOffset: 0,
        arrivalDayOffset: 1,
        durationMinutes: 860,
        travelClass: "3A · AC 3 Tier",
        price: 1400,
        availabilityStatus: "few",
        seatsRemaining: 4,
        refundable: true,
      },
    ],
  },
  {
    id: "jaipur-train-bus",
    origin: "Indore",
    destination: "Delhi",
    modes: ["train", "bus"],
    departureTime: "18:25",
    arrivalTime: "10:30",
    departureDayOffset: 0,
    arrivalDayOffset: 1,
    totalDurationMinutes: 965,
    totalWaitingMinutes: 75,
    totalPrice: 1895,
    transferCount: 1,
    availabilityStatus: "unknown",
    connectionRisk: "moderate",
    recommendationTags: ["Alternative via Jaipur"],
    recommendationReason:
      "A practical backup route, but the final bus segment has unknown mock availability.",
    lastCheckedAt: "5 min ago",
    requiresSeparateTickets: true,
    transfers: [
      {
        city: "Jaipur",
        waitMinutes: 75,
        sameLocation: false,
        distanceKm: 2.8,
        note: "Short auto-rickshaw transfer from Jaipur Junction to Sindhi Camp.",
      },
    ],
    segments: [
      {
        id: "jaipur-train",
        mode: "train",
        operator: "Indore–Jaipur Express",
        serviceNumber: "12973",
        originName: "Indore Junction",
        originCode: "INDB",
        destinationName: "Jaipur Junction",
        destinationCode: "JP",
        departureTime: "18:25",
        arrivalTime: "05:45",
        departureDayOffset: 0,
        arrivalDayOffset: 1,
        durationMinutes: 680,
        travelClass: "3A · AC 3 Tier",
        price: 1195,
        availabilityStatus: "available",
        seatsRemaining: 16,
        refundable: true,
      },
      {
        id: "jaipur-bus",
        mode: "bus",
        operator: "RSRTC Volvo",
        serviceNumber: "RS-310",
        originName: "Sindhi Camp, Jaipur",
        originCode: "JAI",
        destinationName: "Dhaula Kuan, Delhi",
        destinationCode: "DEL",
        departureTime: "07:00",
        arrivalTime: "10:30",
        departureDayOffset: 1,
        arrivalDayOffset: 1,
        durationMinutes: 210,
        travelClass: "Volvo AC Seater",
        price: 700,
        availabilityStatus: "unknown",
        refundable: true,
      },
    ],
  },
]

export const citiesAndStations = [
  "Indore · City",
  "Indore Junction · INDB",
  "Vijay Nagar, Indore · Bus stop",
  "Delhi · City",
  "New Delhi · NDLS",
  "Hazrat Nizamuddin · NZM",
  "Kashmiri Gate ISBT · Delhi",
  "Bhopal · City",
  "Rani Kamlapati · RKMP",
  "Ujjain · City",
  "Ujjain Junction · UJN",
  "Kota · City",
  "Kota Junction · KOTA",
  "Jaipur · City",
  "Jaipur Junction · JP",
]

export function formatDuration(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  return minutes ? `${hours}h ${minutes}m` : `${hours}h`
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value)
}

