"use client"

import { RotateCcw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type TypeFilter = "all" | "direct" | "train" | "bus" | "combined"
export type SafetyFilter = "all" | "comfortable"

export type FilterState = {
  type: TypeFilter
  availableOnly: boolean
  includeWaitlisted: boolean
  departureWindows: string[]
  maxTransfers: number
  minPrice: number
  maxPrice: number
  safety: SafetyFilter
  arriveBefore: string
}

export const defaultFilters: FilterState = {
  type: "all",
  availableOnly: false,
  includeWaitlisted: true,
  departureWindows: [],
  maxTransfers: 2,
  minPrice: 0,
  maxPrice: 4000,
  safety: "all",
  arriveBefore: "",
}

const typeOptions: Array<{ value: TypeFilter; label: string }> = [
  { value: "all", label: "All journeys" },
  { value: "direct", label: "Direct only" },
  { value: "train", label: "Train only" },
  { value: "bus", label: "Bus only" },
  { value: "combined", label: "Train + bus" },
]

const departureOptions = [
  { value: "early", label: "Early morning", time: "Before 06:00" },
  { value: "morning", label: "Morning", time: "06:00–11:59" },
  { value: "afternoon", label: "Afternoon", time: "12:00–16:59" },
  { value: "evening", label: "Evening", time: "17:00–20:59" },
  { value: "night", label: "Night", time: "After 21:00" },
]

function FilterSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <fieldset className="border-b border-[#E6EBE7] pb-5 last:border-b-0">
      <legend className="mb-3 text-sm font-extrabold text-[#102235]">{title}</legend>
      {children}
    </fieldset>
  )
}

function CheckRow({
  id,
  label,
  detail,
  checked,
  onChange,
}: {
  id: string
  label: string
  detail?: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label htmlFor={id} className="flex min-h-11 cursor-pointer items-start gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-[#F4F7F5]">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={(value) => onChange(value === true)}
        className="mt-0.5 size-4.5"
      />
      <span className="min-w-0">
        <span className="block text-sm font-bold text-[#425566]">{label}</span>
        {detail ? <span className="mt-0.5 block text-xs text-[#83909A]">{detail}</span> : null}
      </span>
    </label>
  )
}

export function FilterPanel({
  filters,
  onChange,
  resultCount,
}: {
  filters: FilterState
  onChange: (filters: FilterState) => void
  resultCount: number
}) {
  function patch<Key extends keyof FilterState>(key: Key, value: FilterState[Key]) {
    onChange({ ...filters, [key]: value })
  }

  function toggleWindow(value: string) {
    const selected = filters.departureWindows.includes(value)
      ? filters.departureWindows.filter((item) => item !== value)
      : [...filters.departureWindows, value]
    patch("departureWindows", selected)
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-extrabold tracking-[-0.02em]">Filters</h2>
          <p className="mt-0.5 text-xs font-semibold text-[#718091]" aria-live="polite">
            {resultCount} journeys match
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange(defaultFilters)}
          className="min-h-10 rounded-xl px-2 text-xs font-extrabold text-[#0B7C55]"
        >
          <RotateCcw className="size-3.5" /> Reset
        </Button>
      </div>

      <FilterSection title="Journey type">
        <RadioGroup value={filters.type} onValueChange={(value) => patch("type", value as TypeFilter)} className="gap-1">
          {typeOptions.map((option) => (
            <label key={option.value} htmlFor={`type-${option.value}`} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-2 py-2 text-sm font-bold text-[#425566] hover:bg-[#F4F7F5]">
              <RadioGroupItem id={`type-${option.value}`} value={option.value} />
              {option.label}
            </label>
          ))}
        </RadioGroup>
      </FilterSection>

      <FilterSection title="Availability">
        <div className="space-y-1">
          <CheckRow
            id="available-only"
            label="Available only"
            detail="Every segment must be bookable"
            checked={filters.availableOnly}
            onChange={(value) => patch("availableOnly", value)}
          />
          <CheckRow
            id="include-waitlist"
            label="Include waitlisted options"
            checked={filters.includeWaitlisted}
            onChange={(value) => patch("includeWaitlisted", value)}
          />
        </div>
      </FilterSection>

      <FilterSection title="Departure time">
        <div className="space-y-1">
          {departureOptions.map((option) => (
            <CheckRow
              key={option.value}
              id={`departure-${option.value}`}
              label={option.label}
              detail={option.time}
              checked={filters.departureWindows.includes(option.value)}
              onChange={() => toggleWindow(option.value)}
            />
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Arrival requirement">
        <label htmlFor="arrive-before-filter" className="block text-xs font-bold text-[#687687]">Arrive before</label>
        <input
          id="arrive-before-filter"
          type="time"
          value={filters.arriveBefore}
          onChange={(event) => patch("arriveBefore", event.target.value)}
          className="mt-2 h-11 w-full rounded-xl border border-[#DCE3DE] bg-white px-3 text-sm font-semibold outline-none focus:border-[#17966B] focus:ring-3 focus:ring-[#17966B]/15"
        />
      </FilterSection>

      <FilterSection title="Connections">
        <Select value={String(filters.maxTransfers)} onValueChange={(value) => patch("maxTransfers", Number(value))}>
          <SelectTrigger className="h-11 w-full rounded-xl border-[#DCE3DE] bg-white shadow-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-[#DCE3DE]">
            <SelectItem value="0">Direct only</SelectItem>
            <SelectItem value="1">Maximum one transfer</SelectItem>
            <SelectItem value="2">Maximum two transfers</SelectItem>
          </SelectContent>
        </Select>
      </FilterSection>

      <FilterSection title="Total price">
        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs font-bold text-[#687687]">
            Minimum
            <span className="mt-1 flex h-11 items-center rounded-xl border border-[#DCE3DE] bg-white px-3 text-sm text-[#718091] focus-within:border-[#17966B] focus-within:ring-3 focus-within:ring-[#17966B]/15">
              ₹
              <input
                type="number"
                min="0"
                max={filters.maxPrice}
                step="100"
                value={filters.minPrice}
                onChange={(event) => patch("minPrice", Math.max(0, Number(event.target.value)))}
                className="min-w-0 flex-1 bg-transparent pl-1 font-bold text-[#102235] outline-none"
                aria-label="Minimum total price"
              />
            </span>
          </label>
          <label className="text-xs font-bold text-[#687687]">
            Maximum
            <span className="mt-1 flex h-11 items-center rounded-xl border border-[#DCE3DE] bg-white px-3 text-sm text-[#718091] focus-within:border-[#17966B] focus-within:ring-3 focus-within:ring-[#17966B]/15">
              ₹
              <input
                type="number"
                min={filters.minPrice}
                step="100"
                value={filters.maxPrice}
                onChange={(event) => patch("maxPrice", Math.max(filters.minPrice, Number(event.target.value)))}
                className="min-w-0 flex-1 bg-transparent pl-1 font-bold text-[#102235] outline-none"
                aria-label="Maximum total price"
              />
            </span>
          </label>
        </div>
        <input
          type="range"
          min="500"
          max="4000"
          step="100"
          value={Math.min(filters.maxPrice, 4000)}
          onChange={(event) => patch("maxPrice", Number(event.target.value))}
          className="mt-4 w-full accent-[#17966B]"
          aria-label="Maximum price range"
        />
      </FilterSection>

      <FilterSection title="Connection safety">
        <RadioGroup value={filters.safety} onValueChange={(value) => patch("safety", value as SafetyFilter)} className="gap-1">
          <label htmlFor="safety-all" className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-2 py-2 text-sm font-bold text-[#425566] hover:bg-[#F4F7F5]">
            <RadioGroupItem id="safety-all" value="all" /> Include tight connections
          </label>
          <label htmlFor="safety-comfortable" className="flex min-h-11 cursor-pointer items-center gap-3 rounded-xl px-2 py-2 text-sm font-bold text-[#425566] hover:bg-[#F4F7F5]">
            <RadioGroupItem id="safety-comfortable" value="comfortable" /> Comfortable connections
          </label>
        </RadioGroup>
      </FilterSection>
    </div>
  )
}

