"use client"

import { useState } from "react"
import { ArrowRight, CheckCircle2, Clock3, Scale, Trash2, X } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AvailabilityBadge, ConnectionRiskBadge } from "@/components/route-rush/journey-card"
import { formatDuration, formatPrice, Journey } from "@/data/journeys"

function modeLabel(journey: Journey) {
  return journey.modes.map((mode) => (mode === "train" ? "Train" : "Bus")).join(" + ")
}

function operatorLabel(journey: Journey) {
  return journey.segments.map((segment) => segment.operator).join(" + ")
}

export function ComparisonTray({
  journeys,
  onRemove,
  onClear,
  onView,
}: {
  journeys: Journey[]
  onRemove: (id: string) => void
  onClear: () => void
  onView: (journey: Journey) => void
}) {
  const [open, setOpen] = useState(false)
  if (!journeys.length) return null

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-40 px-3 pb-3 sm:px-5 sm:pb-5">
        <div className="mx-auto flex max-w-4xl items-center gap-3 rounded-[20px] border border-white/10 bg-[#102235] p-3 text-white shadow-[0_20px_70px_rgba(8,22,34,0.38)] sm:p-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10">
            <Scale className="size-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-extrabold">Compare {journeys.length} of 3 journeys</p>
            <div className="mt-1 hidden gap-1.5 sm:flex">
              {journeys.map((journey) => (
                <span key={journey.id} className="inline-flex max-w-[180px] items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-xs text-white/75">
                  <span className="truncate">{operatorLabel(journey)}</span>
                  <button type="button" onClick={() => onRemove(journey.id)} className="grid size-5 shrink-0 place-items-center rounded-full hover:bg-white/15" aria-label={`Remove ${operatorLabel(journey)} from comparison`}>
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
          <Button type="button" variant="ghost" size="sm" onClick={onClear} className="hidden text-white/70 hover:bg-white/10 hover:text-white sm:inline-flex">
            Clear
          </Button>
          <Button type="button" onClick={() => setOpen(true)} className="h-11 rounded-xl bg-white px-4 font-extrabold text-[#102235] hover:bg-[#EAF7F1]">
            Compare <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] overflow-y-auto rounded-[22px] border-[#DCE3DE] bg-[#F7F8F4] p-0 sm:max-w-[min(1100px,calc(100vw-2rem))]">
          <DialogHeader className="border-b border-[#DFE5E0] bg-white p-5 pr-14 text-left sm:p-6">
            <DialogTitle className="text-2xl font-extrabold tracking-[-0.035em]">Compare complete journeys</DialogTitle>
            <DialogDescription className="leading-6 text-[#687687]">
              Compare the full cost, timing, availability and connection safety—nothing is hidden.
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 sm:p-6">
            <div className="hidden overflow-hidden rounded-2xl border border-[#DFE5E0] bg-white md:block">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F5F7F5] hover:bg-[#F5F7F5]">
                    <TableHead className="w-44 px-4">Journey</TableHead>
                    {journeys.map((journey) => (
                      <TableHead key={journey.id} className="min-w-[220px] px-4 py-4 whitespace-normal">
                        <p className="font-extrabold text-[#102235]">{operatorLabel(journey)}</p>
                        <p className="mt-1 text-xs font-semibold text-[#718091]">{journey.recommendationTags[0]}</p>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <ComparisonRow label="Departure" values={journeys.map((journey) => journey.departureTime)} />
                  <ComparisonRow label="Arrival" values={journeys.map((journey) => journey.arrivalTime + (journey.arrivalDayOffset ? " · next day" : ""))} />
                  <ComparisonRow label="Total duration" values={journeys.map((journey) => formatDuration(journey.totalDurationMinutes))} />
                  <ComparisonRow label="Total price" values={journeys.map((journey) => formatPrice(journey.totalPrice))} emphasis />
                  <ComparisonRow label="Modes used" values={journeys.map(modeLabel)} />
                  <ComparisonRow label="Transfers" values={journeys.map((journey) => String(journey.transferCount))} />
                  <ComparisonRow label="Waiting time" values={journeys.map((journey) => formatDuration(journey.totalWaitingMinutes))} />
                  <TableRow>
                    <TableCell className="px-4 font-bold text-[#687687]">Seat availability</TableCell>
                    {journeys.map((journey) => <TableCell key={journey.id} className="px-4"><AvailabilityBadge status={journey.availabilityStatus} seatsRemaining={journey.seatsRemaining} compact /></TableCell>)}
                  </TableRow>
                  <TableRow>
                    <TableCell className="px-4 font-bold text-[#687687]">Connection safety</TableCell>
                    {journeys.map((journey) => <TableCell key={journey.id} className="px-4"><ConnectionRiskBadge risk={journey.connectionRisk} /></TableCell>)}
                  </TableRow>
                  <ComparisonRow label="Separate tickets" values={journeys.map((journey) => journey.requiresSeparateTickets ? "Yes" : "No")} />
                  <ComparisonRow label="Best use case" values={journeys.map((journey) => journey.recommendationTags.join(" · "))} />
                  <TableRow>
                    <TableCell />
                    {journeys.map((journey) => (
                      <TableCell key={journey.id} className="px-4 py-4">
                        <div className="flex flex-col gap-2">
                          <Button type="button" onClick={() => { setOpen(false); onView(journey) }} className="h-11 rounded-xl bg-[#102235] font-extrabold text-white">View journey</Button>
                          <Button type="button" variant="outline" onClick={() => toast.info("Booking hand-off is not enabled in this frontend prototype.")} className="h-10 rounded-xl border-[#DCE3DE] font-bold">Continue with route</Button>
                          <Button type="button" variant="ghost" onClick={() => onRemove(journey.id)} className="h-10 rounded-xl text-[#B34747]"><Trash2 className="size-4" /> Remove</Button>
                        </div>
                      </TableCell>
                    ))}
                  </TableRow>
                </TableBody>
              </Table>
            </div>

            <div className="space-y-3 md:hidden">
              {journeys.map((journey) => (
                <article key={journey.id} className="rounded-[20px] border border-[#DFE5E0] bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="rounded-full bg-[#102235] px-2.5 py-1 text-xs font-extrabold text-white">{journey.recommendationTags[0]}</span>
                      <h3 className="mt-3 font-extrabold">{operatorLabel(journey)}</h3>
                    </div>
                    <button type="button" onClick={() => onRemove(journey.id)} className="grid size-11 shrink-0 place-items-center rounded-xl text-[#B34747] hover:bg-[#FFF2F1]" aria-label={`Remove ${operatorLabel(journey)}`}><Trash2 className="size-4" /></button>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl bg-[#F5F7F5] p-3 text-sm">
                    <Stat label="Time" value={`${journey.departureTime} → ${journey.arrivalTime}`} icon={Clock3} />
                    <Stat label="Total" value={formatPrice(journey.totalPrice)} icon={CheckCircle2} />
                    <Stat label="Duration" value={formatDuration(journey.totalDurationMinutes)} icon={Clock3} />
                    <Stat label="Modes" value={modeLabel(journey)} icon={Scale} />
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2"><AvailabilityBadge status={journey.availabilityStatus} seatsRemaining={journey.seatsRemaining} compact /><ConnectionRiskBadge risk={journey.connectionRisk} /></div>
                  <div className="mt-4 grid gap-2">
                    <Button type="button" onClick={() => { setOpen(false); onView(journey) }} className="h-12 rounded-xl bg-[#102235] font-extrabold text-white">View complete journey</Button>
                    <Button type="button" variant="outline" onClick={() => toast.info("Booking hand-off is not enabled in this frontend prototype.")} className="h-11 rounded-xl border-[#DCE3DE]">Continue with this route</Button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

function ComparisonRow({ label, values, emphasis = false }: { label: string; values: string[]; emphasis?: boolean }) {
  return (
    <TableRow>
      <TableCell className="px-4 font-bold text-[#687687]">{label}</TableCell>
      {values.map((value, index) => (
        <TableCell key={`${label}-${index}`} className={`px-4 whitespace-normal ${emphasis ? "text-lg font-extrabold text-[#102235]" : "font-semibold text-[#425566]"}`}>
          {value}
        </TableCell>
      ))}
    </TableRow>
  )
}

function Stat({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Clock3 }) {
  return (
    <div>
      <p className="flex items-center gap-1 text-xs font-bold text-[#718091]"><Icon className="size-3.5" /> {label}</p>
      <p className="mt-1 font-extrabold text-[#102235]">{value}</p>
    </div>
  )
}
