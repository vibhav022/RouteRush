"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import {
  ArrowRight,
  BadgeIndianRupee,
  BusFront,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  Info,
  MapPin,
  MoveRight,
  ShieldAlert,
  ShieldCheck,
  TicketCheck,
  TrainFront,
  TriangleAlert,
  XCircle,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  AvailabilityStatus,
  ConnectionRisk,
  formatDuration,
  formatPrice,
  Journey,
  JourneySegment,
} from "@/data/journeys"

const availabilityMeta: Record<
  AvailabilityStatus,
  { label: string; className: string; icon: typeof CheckCircle2 }
> = {
  available: {
    label: "Available",
    className: "border-[#BDE0CB] bg-[#ECF8F2] text-[#0B7C55]",
    icon: CheckCircle2,
  },
  few: {
    label: "Few seats left",
    className: "border-[#F2D5A9] bg-[#FFF7E8] text-[#A75E05]",
    icon: TriangleAlert,
  },
  waitlisted: {
    label: "Waitlisted",
    className: "border-[#EBC9A0] bg-[#FFF8ED] text-[#9B5D13]",
    icon: Clock3,
  },
  "sold-out": {
    label: "Sold out",
    className: "border-[#F1CBC8] bg-[#FFF2F1] text-[#B93F3F]",
    icon: XCircle,
  },
  unknown: {
    label: "Availability unknown",
    className: "border-[#D8DEE3] bg-[#F4F6F7] text-[#596978]",
    icon: CircleHelp,
  },
}

const riskMeta: Record<
  ConnectionRisk,
  { label: string; className: string; icon: typeof ShieldCheck }
> = {
  direct: {
    label: "No transfer risk",
    className: "border-[#D8E1DD] bg-[#F4F7F5] text-[#50615A]",
    icon: ShieldCheck,
  },
  comfortable: {
    label: "Comfortable connection",
    className: "border-[#BDE0CB] bg-[#ECF8F2] text-[#0B7C55]",
    icon: ShieldCheck,
  },
  moderate: {
    label: "Moderate connection",
    className: "border-[#F2D5A9] bg-[#FFF7E8] text-[#9B5D13]",
    icon: ShieldAlert,
  },
  tight: {
    label: "Tight connection",
    className: "border-[#F1CBC8] bg-[#FFF2F1] text-[#B93F3F]",
    icon: TriangleAlert,
  },
}

export function isJourneyBookable(journey: Journey) {
  return journey.connectionViable !== false && journey.segments.every((segment) =>
    ["available", "few"].includes(segment.availabilityStatus),
  )
}

export function AvailabilityBadge({
  status,
  seatsRemaining,
  compact = false,
}: {
  status: AvailabilityStatus
  seatsRemaining?: number
  compact?: boolean
}) {
  const meta = availabilityMeta[status]
  const Icon = meta.icon
  const label =
    status === "few" && seatsRemaining
      ? `Only ${seatsRemaining} seats left`
      : meta.label

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-extrabold ${
        compact ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm"
      } ${meta.className}`}
    >
      <Icon aria-hidden="true" className={compact ? "size-3.5" : "size-4"} />
      {label}
    </span>
  )
}

export function ConnectionRiskBadge({ risk }: { risk: ConnectionRisk }) {
  const meta = riskMeta[risk]
  const Icon = meta.icon
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-extrabold ${meta.className}`}>
      <Icon aria-hidden="true" className="size-3.5" />
      {meta.label}
    </span>
  )
}

function ModeIcon({ mode, className = "" }: { mode: JourneySegment["mode"]; className?: string }) {
  const Icon = mode === "train" ? TrainFront : BusFront
  return <Icon aria-hidden="true" className={className} />
}

function dateForOffset(baseDate: string, offset: number, format: "short" | "long" = "short") {
  const date = new Date(`${baseDate || "2026-08-28"}T12:00:00`)
  if (Number.isNaN(date.getTime())) return offset ? "Next day" : "Travel day"
  date.setDate(date.getDate() + offset)
  return new Intl.DateTimeFormat("en-IN", {
    weekday: format === "long" ? "short" : undefined,
    day: "numeric",
    month: "short",
  }).format(date)
}

function journeyTypeLabel(journey: Journey) {
  if (journey.transferCount === 0) {
    return journey.modes[0] === "train" ? "Direct train" : "Direct bus"
  }
  return journey.modes.map((mode) => (mode === "train" ? "Train" : "Bus")).join(" + ")
}

function DirectTimeline({ journey, travelDate }: { journey: Journey; travelDate: string }) {
  const segment = journey.segments[0]
  return (
    <div>
      <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 sm:gap-5">
        <div>
        <p className="text-2xl font-extrabold tracking-[-0.04em]">{journey.departureTime}</p>
        <p className="mt-1 text-xs font-bold text-[#718091]">{dateForOffset(travelDate, journey.departureDayOffset)}</p>
        <p className="mt-2 max-w-[120px] text-sm font-bold text-[#364A5C]">{segment.originCode}</p>
        </div>
        <div className="min-w-0 text-center">
        <p className="mb-2 text-xs font-bold text-[#718091]">{formatDuration(journey.totalDurationMinutes)} · Direct</p>
        <div className="flex items-center">
          <span className="size-2.5 rounded-full border-2 border-[#17966B] bg-white" />
          <span className={`h-0.5 flex-1 ${segment.mode === "train" ? "bg-[#17966B]" : "bg-[#4A9AC7]"}`} />
          <span className={`grid size-8 shrink-0 place-items-center rounded-full text-white ${segment.mode === "train" ? "bg-[#17966B]" : "bg-[#4A9AC7]"}`}>
            <ModeIcon mode={segment.mode} className="size-4" />
          </span>
          <span className={`h-0.5 flex-1 ${segment.mode === "train" ? "bg-[#17966B]" : "bg-[#4A9AC7]"}`} />
          <span className="size-2.5 rounded-full border-2 border-[#102235] bg-white" />
        </div>
        <p className="mt-2 truncate text-xs font-semibold text-[#718091]">{segment.operator} · {segment.serviceNumber}</p>
        </div>
        <div className="text-right">
        <p className="text-2xl font-extrabold tracking-[-0.04em]">{journey.arrivalTime}</p>
        <p className="mt-1 text-xs font-bold text-[#718091]">{dateForOffset(travelDate, journey.arrivalDayOffset)}</p>
        <p className="mt-2 max-w-[120px] text-sm font-bold text-[#364A5C]">{segment.destinationCode}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2 rounded-xl bg-[#F5F7F5] px-3 py-2.5 text-xs font-semibold text-[#607080] sm:flex-row sm:items-center sm:justify-between">
        <span>{segment.originName} → {segment.destinationName}</span>
        <span>{segment.travelClass} · {segment.refundable ? "Refundable option" : "Non-refundable"}</span>
      </div>
    </div>
  )
}

export function CombinedJourneyTimeline({ journey, travelDate }: { journey: Journey; travelDate: string }) {
  return (
    <div className="space-y-3">
      {journey.segments.map((segment, index) => {
        const transfer = index < journey.transfers.length ? journey.transfers[index] : null
        const modeClass = segment.mode === "train" ? "bg-[#EAF7F1] text-[#0B7C55]" : "bg-[#EAF4FA] text-[#2878A3]"
        return (
          <div key={segment.id}>
            <div className="grid gap-3 rounded-2xl border border-[#DFE5E0] bg-[#FAFBF9] p-4 sm:grid-cols-[auto_1fr_auto] sm:items-center">
              <div className={`flex size-10 items-center justify-center rounded-xl ${modeClass}`}>
                <ModeIcon mode={segment.mode} className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="font-extrabold">{segment.originCode} <MoveRight className="mx-1 inline size-4 text-[#8A98A3]" /> {segment.destinationCode}</p>
                  <span className="text-sm font-medium text-[#718091]">{segment.operator} · {segment.serviceNumber}</span>
                </div>
                <p className="mt-1 text-sm font-semibold text-[#536273]">
                  {segment.departureTime} → {segment.arrivalTime} · {formatDuration(segment.durationMinutes)} · {segment.travelClass}
                </p>
                <p className="mt-1 text-xs font-medium text-[#7A8893]">
                  {dateForOffset(travelDate, segment.departureDayOffset)} departure
                </p>
              </div>
              <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                <AvailabilityBadge status={segment.availabilityStatus} seatsRemaining={segment.seatsRemaining} compact />
                <span className="text-sm font-extrabold">{formatPrice(segment.price)}</span>
              </div>
            </div>
            {transfer ? (
              <div className={`ml-5 border-l-2 border-dashed py-3 pl-5 text-sm ${journey.connectionRisk === "tight" ? "border-[#E8A19C]" : "border-[#B7CCC0]"}`}>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-extrabold text-[#334A5C]">Transfer in {transfer.city} · {formatDuration(transfer.waitMinutes)}</span>
                  <ConnectionRiskBadge risk={journey.connectionRisk} />
                </div>
                <p className="mt-1 leading-6 text-[#687687]">
                  {transfer.sameLocation
                    ? "Same terminal area. "
                    : `${transfer.distanceKm} km location change required. `}
                  {transfer.note}
                </p>
              </div>
            ) : null}
          </div>
        )
      })}
    </div>
  )
}

export function JourneyCard({
  journey,
  travelDate,
  compared,
  onCompareChange,
  onView,
}: {
  journey: Journey
  travelDate: string
  compared: boolean
  onCompareChange: (checked: boolean) => void
  onView: () => void
}) {
  const [whyOpen, setWhyOpen] = useState(false)
  const isCombined = journey.transferCount > 0
  const operatorLine = journey.segments.map((segment) => segment.operator).join(" + ")

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`overflow-hidden rounded-[22px] border bg-white shadow-[0_10px_34px_rgba(16,34,53,0.055)] transition-shadow hover:shadow-[0_16px_42px_rgba(16,34,53,0.09)] ${
        isCombined ? "border-[#CFE2D7]" : "border-[#DFE5E0]"
      }`}
    >
      <div className={`h-1 ${isCombined ? "bg-gradient-to-r from-[#4A9AC7] via-[#B9D9EA] to-[#17966B]" : journey.modes[0] === "train" ? "bg-[#17966B]" : "bg-[#4A9AC7]"}`} />
      <div className="p-4 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              {journey.recommendationTags[0] ? (
                <span className="rounded-full bg-[#102235] px-2.5 py-1 text-xs font-extrabold text-white">
                  {journey.recommendationTags[0]}
                </span>
              ) : null}
              <span className="text-xs font-extrabold uppercase tracking-[0.12em] text-[#718091]">
                {journeyTypeLabel(journey)}
              </span>
            </div>
            <h2 className="mt-2 truncate text-lg font-extrabold tracking-[-0.025em] text-[#102235]">{operatorLine}</h2>
          </div>
          <AvailabilityBadge status={journey.availabilityStatus} seatsRemaining={journey.seatsRemaining} />
        </div>

        <div className="mt-5">
          {isCombined ? (
            <CombinedJourneyTimeline journey={journey} travelDate={travelDate} />
          ) : (
            <DirectTimeline journey={journey} travelDate={travelDate} />
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-2 border-t border-[#E7ECE8] pt-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F6F4] px-2.5 py-1 text-xs font-bold text-[#536273]">
            <Clock3 className="size-3.5" /> {formatDuration(journey.totalDurationMinutes)} total
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F3F6F4] px-2.5 py-1 text-xs font-bold text-[#536273]">
            <ArrowRight className="size-3.5" /> {journey.transferCount} {journey.transferCount === 1 ? "transfer" : "transfers"}
          </span>
          <ConnectionRiskBadge risk={journey.connectionRisk} />
          {journey.requiresSeparateTickets ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#D8DEE3] bg-white px-2.5 py-1 text-xs font-bold text-[#596978]">
              <TicketCheck className="size-3.5" /> Separate tickets
            </span>
          ) : null}
        </div>

        {journey.connectionRisk === "tight" ? (
          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[#F1CBC8] bg-[#FFF5F4] p-3 text-sm leading-6 text-[#963D3D]">
            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
            <p><strong>Tight connection:</strong> this route includes a location change and leaves little recovery time if the first segment is delayed.</p>
          </div>
        ) : null}

        <button
          type="button"
          onClick={() => setWhyOpen((open) => !open)}
          aria-expanded={whyOpen}
          className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-lg text-sm font-extrabold text-[#0B7C55] outline-none hover:text-[#075F41] focus-visible:ring-3 focus-visible:ring-[#17966B]/20"
        >
          <Info className="size-4" /> Why this route?
          <ChevronDown className={`size-4 transition-transform ${whyOpen ? "rotate-180" : ""}`} />
        </button>
        {whyOpen ? (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl bg-[#F4F7F5] px-3 py-2.5 text-sm leading-6 text-[#5A6A76]">
            {journey.recommendationReason}
          </motion.p>
        ) : null}

        <div className="mt-5 flex flex-col gap-4 border-t border-[#E7ECE8] pt-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#7B8995]">Total estimated price</p>
            <div className="mt-1 flex items-baseline gap-2">
              <p className="text-2xl font-extrabold tracking-[-0.035em]">{formatPrice(journey.totalPrice)}</p>
              <span className="text-xs font-medium text-[#7B8995]">for the whole group</span>
            </div>
            <p className="mt-1 text-xs font-medium text-[#87949F]">Checked {journey.lastCheckedAt} · Mock data</p>
          </div>
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
            <label className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl px-2 text-sm font-extrabold text-[#536273] hover:bg-[#F5F7F5]">
              <Checkbox checked={compared} onCheckedChange={(checked) => onCompareChange(checked === true)} />
              Compare
            </label>
            <Button
              type="button"
              onClick={onView}
              className="h-12 rounded-xl bg-[#102235] px-5 font-extrabold text-white hover:bg-[#18364F]"
            >
              View complete journey <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.article>
  )
}

function DetailSegment({ segment, travelDate }: { segment: JourneySegment; travelDate: string }) {
  const modeClass = segment.mode === "train" ? "bg-[#EAF7F1] text-[#0B7C55]" : "bg-[#EAF4FA] text-[#2878A3]"
  return (
    <section className="rounded-[20px] border border-[#DFE5E0] bg-white p-4 sm:p-5">
      <div className="flex items-start gap-3">
        <span className={`grid size-11 shrink-0 place-items-center rounded-2xl ${modeClass}`}>
          <ModeIcon mode={segment.mode} className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.1em] text-[#718091]">{segment.mode} segment</p>
              <h3 className="mt-1 font-extrabold">{segment.operator} · {segment.serviceNumber}</h3>
            </div>
            <AvailabilityBadge status={segment.availabilityStatus} seatsRemaining={segment.seatsRemaining} compact />
          </div>
          <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-start gap-3">
            <div>
              <p className="text-xl font-extrabold">{segment.departureTime}</p>
              <p className="mt-1 text-xs font-bold text-[#718091]">{dateForOffset(travelDate, segment.departureDayOffset, "long")}</p>
              <p className="mt-2 text-sm font-bold leading-5">{segment.originName}</p>
              <p className="text-xs font-semibold text-[#718091]">{segment.originCode}</p>
            </div>
            <div className="pt-2 text-center text-xs font-bold text-[#718091]">
              <ArrowRight className="mx-auto mb-1 size-5" />
              {formatDuration(segment.durationMinutes)}
            </div>
            <div className="text-right">
              <p className="text-xl font-extrabold">{segment.arrivalTime}</p>
              <p className="mt-1 text-xs font-bold text-[#718091]">{dateForOffset(travelDate, segment.arrivalDayOffset, "long")}</p>
              <p className="mt-2 text-sm font-bold leading-5">{segment.destinationName}</p>
              <p className="text-xs font-semibold text-[#718091]">{segment.destinationCode}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#E7ECE8] pt-4 text-sm">
            <span className="font-semibold text-[#536273]">{segment.travelClass} · {segment.refundable ? "Refundable option" : "Non-refundable"}</span>
            <div className="flex items-center gap-2">
              <span className="font-extrabold">{formatPrice(segment.price)}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => toast.info("Live ticket links will appear here when booking APIs are connected.")}
                className="min-h-10 rounded-xl border-[#DCE3DE] bg-white font-extrabold"
              >
                View ticket
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export function JourneyDetailsSheet({
  journey,
  travelDate,
  open,
  onOpenChange,
}: {
  journey: Journey | null
  travelDate: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  if (!journey) return null
  const transferCost = journey.transferCost ?? 0
  const bookable = isJourneyBookable(journey)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full border-[#DCE3DE] bg-[#F7F8F4] p-0 sm:max-w-2xl">
        <SheetHeader className="border-b border-[#DFE5E0] bg-white px-5 py-5 pr-14 text-left">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-[#102235] px-2.5 py-1 text-xs font-extrabold text-white">{journey.recommendationTags[0]}</span>
            <ConnectionRiskBadge risk={journey.connectionRisk} />
          </div>
          <SheetTitle className="mt-2 text-2xl font-extrabold tracking-[-0.035em]">
            {journey.origin} → {journey.destination}
          </SheetTitle>
          <SheetDescription className="text-sm leading-6 text-[#687687]">
            Complete itinerary · {formatDuration(journey.totalDurationMinutes)} · {journey.transferCount} {journey.transferCount === 1 ? "transfer" : "transfers"}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-5">
          <div className="space-y-3">
            {journey.segments.map((segment, index) => (
              <div key={segment.id}>
                <DetailSegment segment={segment} travelDate={travelDate} />
                {journey.transfers[index] ? (
                  <div className={`mx-5 border-l-2 border-dashed py-4 pl-5 ${journey.connectionRisk === "tight" ? "border-[#E8A19C]" : "border-[#B7CCC0]"}`}>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-extrabold">Transfer in {journey.transfers[index].city}</p>
                      <ConnectionRiskBadge risk={journey.connectionRisk} />
                    </div>
                    <p className="mt-1 text-sm font-semibold text-[#536273]">Wait {formatDuration(journey.transfers[index].waitMinutes)}</p>
                    <p className="mt-1 text-sm leading-6 text-[#687687]">
                      {journey.transfers[index].sameLocation
                        ? "Same station or terminal area. "
                        : `${journey.transfers[index].distanceKm} km location change required. `}
                      {journey.transfers[index].note}
                    </p>
                    {journey.requiresSeparateTickets ? (
                      <div className="mt-3 flex items-start gap-2 rounded-xl bg-[#FFF7E8] p-3 text-sm leading-6 text-[#8C5716]">
                        <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                        These segments require separate tickets. A delay on one booking may not be protected by the next operator.
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <section className="mt-5 rounded-[20px] border border-[#DFE5E0] bg-white p-5">
            <h3 className="text-lg font-extrabold">Total journey summary</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4"><dt className="text-[#687687]">Group ticket fares</dt><dd className="font-bold">{formatPrice(journey.totalPrice - transferCost)}</dd></div>
              <div className="flex items-center justify-between gap-4"><dt className="text-[#687687]">Estimated terminal transfer</dt><dd className="font-bold">{formatPrice(transferCost)}</dd></div>
              <div className="flex items-center justify-between gap-4"><dt className="text-[#687687]">Travel time</dt><dd className="font-bold">{formatDuration(journey.totalDurationMinutes - journey.totalWaitingMinutes)}</dd></div>
              <div className="flex items-center justify-between gap-4"><dt className="text-[#687687]">Waiting time</dt><dd className="font-bold">{formatDuration(journey.totalWaitingMinutes)}</dd></div>
              <div className="flex items-center justify-between gap-4 border-t border-[#E7ECE8] pt-3"><dt className="font-extrabold">Total estimated cost</dt><dd className="text-xl font-extrabold">{formatPrice(journey.totalPrice)}</dd></div>
            </dl>
          </section>

          <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[#D8E0E4] bg-[#F3F6F7] p-4 text-sm leading-6 text-[#5D6B76]">
            <Info className="mt-0.5 size-4 shrink-0" />
            Availability and fares can change until the tickets are confirmed on the booking platform.
          </div>
        </div>

        <SheetFooter className="border-t border-[#DCE3DE] bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#718091]">Estimated total</p>
            <p className="text-xl font-extrabold">{formatPrice(journey.totalPrice)}</p>
          </div>
          <Button
            type="button"
            disabled={!bookable}
            className="h-12 rounded-xl bg-[#17966B] px-5 font-extrabold text-white hover:bg-[#117B58] disabled:bg-[#A8B3AD]"
            onClick={() => toast.info("This prototype will hand off to an official booking platform when live APIs are connected.")}
          >
            <TicketCheck className="size-4" />
            {bookable ? "Review simulated tickets" : "Journey not fully available"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}

export function LoadingJourneyCard() {
  return (
    <div className="overflow-hidden rounded-[22px] border border-[#DFE5E0] bg-white p-5 shadow-sm" aria-hidden="true">
      <div className="flex items-center justify-between gap-4">
        <div className="h-5 w-40 animate-pulse rounded-full bg-[#E7ECE8]" />
        <div className="h-8 w-28 animate-pulse rounded-full bg-[#E7ECE8]" />
      </div>
      <div className="mt-7 grid grid-cols-[auto_1fr_auto] items-center gap-4">
        <div className="h-12 w-16 animate-pulse rounded-xl bg-[#EDF1EE]" />
        <div className="h-2 animate-pulse rounded-full bg-[#E4EBE7]" />
        <div className="h-12 w-16 animate-pulse rounded-xl bg-[#EDF1EE]" />
      </div>
      <div className="mt-7 h-16 animate-pulse rounded-2xl bg-[#F1F4F2]" />
    </div>
  )
}
