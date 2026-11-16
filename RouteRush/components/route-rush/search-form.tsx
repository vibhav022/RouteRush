"use client"

import { FormEvent, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  ArrowRight,
  ArrowUpDown,
  BusFront,
  CalendarDays,
  ChevronDown,
  Clock3,
  MapPin,
  Search,
  TrainFront,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxLabel,
  ComboboxList,
} from "@/components/ui/combobox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { citiesAndStations } from "@/data/journeys"

type ModeValue = "all" | "train" | "bus" | "combined"

type SearchFormProps = {
  initialFrom?: string
  initialTo?: string
  initialDate?: string
  initialMode?: ModeValue
  initialTravellers?: number
  initialArriveBefore?: string
}

function isoDate(date: Date) {
  return date.toISOString().split("T")[0]
}

function tomorrowIso() {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  return isoDate(tomorrow)
}

function normalizeLocation(value: string) {
  return value.split("·")[0].trim()
}

function LocationAutocomplete({
  id,
  label,
  value,
  onChange,
  error,
}: {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
}) {
  return (
    <div className="min-w-0 flex-1">
      <label htmlFor={id} className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#617080]">
        <MapPin aria-hidden="true" className="size-3.5 text-[#17966B]" />
        {label}
      </label>
      <Combobox
        items={citiesAndStations}
        value={value}
        onValueChange={(next) => onChange(next ?? "")}
      >
        <ComboboxInput
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          placeholder={`Enter ${label.toLowerCase()}`}
          className="h-12 w-full rounded-xl border-[#DCE3DE] bg-[#FBFCFA] text-base shadow-none focus-within:border-[#17966B] focus-within:ring-[#17966B]/15"
          showClear
        />
        <ComboboxContent className="z-[70] rounded-2xl border-[#DCE3DE] bg-white p-1 shadow-xl">
          <ComboboxEmpty>No matching city or station.</ComboboxEmpty>
          <ComboboxList>
            <ComboboxGroup>
              <ComboboxLabel>Recent searches</ComboboxLabel>
              <ComboboxItem value="Indore · City" className="min-h-11 rounded-xl">
                <Clock3 className="text-[#718091]" /> Indore · City
              </ComboboxItem>
              <ComboboxItem value="Delhi · City" className="min-h-11 rounded-xl">
                <Clock3 className="text-[#718091]" /> Delhi · City
              </ComboboxItem>
            </ComboboxGroup>
            <ComboboxGroup>
              <ComboboxLabel>Cities & stations</ComboboxLabel>
              {citiesAndStations
                .filter((item) => !["Indore · City", "Delhi · City"].includes(item))
                .map((item) => (
                <ComboboxItem key={item} value={item} className="min-h-11 rounded-xl">
                  <MapPin className="text-[#17966B]" /> {item}
                </ComboboxItem>
                ))}
            </ComboboxGroup>
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm font-medium text-[#C94E4E]">
          {error}
        </p>
      ) : null}
    </div>
  )
}

const travelModes: Array<{
  value: ModeValue
  label: string
  icon: typeof TrainFront
}> = [
  { value: "all", label: "All best routes", icon: Search },
  { value: "train", label: "Train only", icon: TrainFront },
  { value: "bus", label: "Bus only", icon: BusFront },
  { value: "combined", label: "Train + bus", icon: ArrowRight },
]

export function SearchForm({
  initialFrom = "Indore · City",
  initialTo = "Delhi · City",
  initialDate,
  initialMode = "all",
  initialTravellers = 1,
  initialArriveBefore = "",
}: SearchFormProps) {
  const router = useRouter()
  const [from, setFrom] = useState(initialFrom)
  const [to, setTo] = useState(initialTo)
  const [date, setDate] = useState(initialDate || tomorrowIso())
  const [travellers, setTravellers] = useState(String(initialTravellers))
  const [mode, setMode] = useState<ModeValue>(initialMode)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [arriveBefore, setArriveBefore] = useState(initialArriveBefore)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [swapCount, setSwapCount] = useState(0)

  const today = useMemo(() => isoDate(new Date()), [])

  function swapLocations() {
    setFrom(to)
    setTo(from)
    setSwapCount((count) => count + 1)
    setErrors({})
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const nextErrors: Record<string, string> = {}
    const fromCity = normalizeLocation(from)
    const toCity = normalizeLocation(to)

    if (!fromCity) nextErrors.from = "Choose an origin city or station."
    if (!toCity) nextErrors.to = "Choose a destination city or station."
    if (fromCity && toCity && fromCity.toLowerCase() === toCity.toLowerCase()) {
      nextErrors.to = "Destination must be different from your origin."
    }
    if (!date || date < today) nextErrors.date = "Choose today or a future date."

    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    const params = new URLSearchParams({
      from: fromCity,
      to: toCity,
      date,
      travellers,
      mode,
    })
    if (arriveBefore) params.set("arriveBefore", arriveBefore)
    router.push(`/search?${params.toString()}`)
  }

  return (
    <form
      id="search"
      onSubmit={submitSearch}
      className="relative rounded-[24px] border border-[#DDE4DF] bg-white p-4 shadow-[0_24px_70px_rgba(16,34,53,0.12)] sm:p-6"
      noValidate
    >
      <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-[#17966B]/70 to-transparent" />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <LocationAutocomplete
          id="from-location"
          label="From"
          value={from}
          onChange={(value) => {
            setFrom(value)
            setErrors((current) => ({ ...current, from: "" }))
          }}
          error={errors.from}
        />

        <motion.button
          type="button"
          onClick={swapLocations}
          animate={{ rotate: swapCount * 180 }}
          transition={{ duration: 0.2 }}
          className="mx-auto mt-7 grid size-11 shrink-0 place-items-center rounded-full border border-[#DCE3DE] bg-[#F7F8F4] text-[#102235] transition-colors hover:border-[#17966B] hover:bg-[#E9F6F0] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-[#17966B]/25 lg:mx-0"
          aria-label="Swap origin and destination"
        >
          <ArrowUpDown className="size-4" />
        </motion.button>

        <LocationAutocomplete
          id="to-location"
          label="To"
          value={to}
          onChange={(value) => {
            setTo(value)
            setErrors((current) => ({ ...current, to: "" }))
          }}
          error={errors.to}
        />

        <div className="min-w-0 lg:w-[188px]">
          <label htmlFor="travel-date" className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#617080]">
            <CalendarDays aria-hidden="true" className="size-3.5 text-[#17966B]" />
            Travel date
          </label>
          <input
            id="travel-date"
            type="date"
            min={today}
            value={date}
            onChange={(event) => {
              setDate(event.target.value)
              setErrors((current) => ({ ...current, date: "" }))
            }}
            aria-invalid={Boolean(errors.date)}
            aria-describedby={errors.date ? "travel-date-error" : undefined}
            className="h-12 w-full rounded-xl border border-[#DCE3DE] bg-[#FBFCFA] px-3 text-base text-[#102235] outline-none transition focus:border-[#17966B] focus:ring-3 focus:ring-[#17966B]/15"
          />
          {errors.date ? (
            <p id="travel-date-error" className="mt-1.5 text-sm font-medium text-[#C94E4E]">
              {errors.date}
            </p>
          ) : null}
        </div>

        <div className="min-w-0 lg:w-[150px]">
          <label className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-[#617080]">
            <Users aria-hidden="true" className="size-3.5 text-[#17966B]" />
            Travellers
          </label>
          <Select value={travellers} onValueChange={setTravellers}>
            <SelectTrigger className="h-12 w-full rounded-xl border-[#DCE3DE] bg-[#FBFCFA] px-3 text-base shadow-none">
              <SelectValue placeholder="Travellers" />
            </SelectTrigger>
            <SelectContent className="z-[70] rounded-xl border-[#DCE3DE]">
              {["1", "2", "3", "4", "5", "6"].map((value) => (
                <SelectItem key={value} value={value} className="min-h-10">
                  {value} {value === "1" ? "traveller" : "travellers"}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <fieldset className="mt-5 border-t border-[#E7ECE8] pt-5">
        <legend className="sr-only">Choose travel mode</legend>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[#617080]">
              Travel mode
            </p>
            <RadioGroup
              value={mode}
              onValueChange={(value) => setMode(value as ModeValue)}
              className="grid grid-cols-2 gap-2 md:grid-cols-4"
            >
              {travelModes.map((item) => {
                const Icon = item.icon
                const active = mode === item.value
                return (
                  <label
                    key={item.value}
                    htmlFor={`mode-${item.value}`}
                    className={`flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border px-3 text-sm font-semibold transition-colors ${
                      active
                        ? "border-[#17966B] bg-[#EAF7F1] text-[#0B6949]"
                        : "border-[#DCE3DE] bg-[#FBFCFA] text-[#536273] hover:border-[#AAB9AF]"
                    }`}
                  >
                    <RadioGroupItem id={`mode-${item.value}`} value={item.value} className="sr-only" />
                    <Icon aria-hidden="true" className="size-4 shrink-0" />
                    <span>{item.label}</span>
                  </label>
                )
              })}
            </RadioGroup>
          </div>

          <Button
            type="submit"
            size="lg"
            className="h-14 w-full rounded-2xl bg-[#102235] px-7 text-base font-bold text-white shadow-[0_12px_30px_rgba(16,34,53,0.22)] hover:bg-[#18364F] xl:w-auto"
          >
            <Search className="size-5" />
            Find available journeys
          </Button>
        </div>
      </fieldset>

      <div className="mt-4 border-t border-[#EEF1EF] pt-3">
        <button
          type="button"
          onClick={() => setAdvancedOpen((open) => !open)}
          aria-expanded={advancedOpen}
          className="flex min-h-11 items-center gap-2 rounded-lg text-sm font-bold text-[#536273] outline-none transition-colors hover:text-[#102235] focus-visible:ring-3 focus-visible:ring-[#17966B]/20"
        >
          Advanced options
          <ChevronDown className={`size-4 transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
        </button>
        {advancedOpen ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="max-w-xs pb-1"
          >
            <label htmlFor="arrive-before" className="mb-2 block text-sm font-semibold text-[#536273]">
              Arrive before next day (India time, optional)
            </label>
            <input
              id="arrive-before"
              type="time"
              value={arriveBefore}
              onChange={(event) => setArriveBefore(event.target.value)}
              className="h-12 w-full rounded-xl border border-[#DCE3DE] bg-[#FBFCFA] px-3 text-base outline-none focus:border-[#17966B] focus:ring-3 focus:ring-[#17966B]/15"
            />
          </motion.div>
        ) : null}
      </div>
    </form>
  )
}
