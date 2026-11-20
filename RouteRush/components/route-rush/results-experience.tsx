"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  ChevronDown,
  CircleAlert,
  Clock3,
  Filter,
  Info,
  ListFilter,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  Sparkles,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ComparisonTray } from "@/components/route-rush/comparison-tray";
import {
  defaultFilters,
  FilterPanel,
  FilterState,
} from "@/components/route-rush/filter-panel";
import {
  isJourneyBookable,
  JourneyCard,
  JourneyDetailsSheet,
  LoadingJourneyCard,
} from "@/components/route-rush/journey-card";
import { SearchForm } from "@/components/route-rush/search-form";
import { SiteFooter } from "@/components/route-rush/site-footer";
import { SiteNav } from "@/components/route-rush/site-nav";
import { Journey } from "@/data/journeys";

import { generateJourneys, services, minutes } from "@/lib/journey-engine";

type SearchMode = "all" | "train" | "bus" | "combined";
type SortValue =
  "recommended" | "earliest" | "shortest" | "lowest" | "fewest" | "latest";

export type SearchValues = {
  from: string;
  to: string;
  date: string;
  travellers: number;
  mode: SearchMode;
  arriveBefore?: string;
  budget?: number;
};

const loadingMessages = [
  "Checking direct trains…",
  "Checking buses…",
  "Building possible connections…",
  "Comparing complete journey costs…",
];

const sortOptions: Array<{ value: SortValue; label: string }> = [
  { value: "recommended", label: "Recommended" },
  { value: "earliest", label: "Earliest arrival" },
  { value: "shortest", label: "Shortest duration" },
  { value: "lowest", label: "Lowest total price" },
  { value: "fewest", label: "Fewest transfers" },
  { value: "latest", label: "Latest departure" },
];

function modeLabel(mode: SearchMode) {
  const labels: Record<SearchMode, string> = {
    all: "All best routes",
    train: "Train only",
    bus: "Bus only",
    combined: "Train + bus",
  };
  return labels[mode];
}

function dateLabel(value: string) {
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return "Selected date";
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function timeMinutes(value: string, dayOffset = 0) {
  const [hours, minutes] = value.split(":").map(Number);
  return dayOffset * 1440 + hours * 60 + minutes;
}

function departureWindow(journey: Journey) {
  const hour = Number(journey.departureTime.split(":")[0]);
  if (hour < 6) return "early";
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 21) return "evening";
  return "night";
}

function matchesSearchMode(journey: Journey, mode: SearchMode) {
  if (mode === "train") return journey.modes.every((item) => item === "train");
  if (mode === "bus") return journey.modes.every((item) => item === "bus");
  if (mode === "combined")
    return journey.transferCount > 0 && new Set(journey.modes).size > 1;
  return true;
}

function matchesType(journey: Journey, type: FilterState["type"]) {
  if (type === "direct") return journey.transferCount === 0;
  if (type === "train") return journey.modes.every((item) => item === "train");
  if (type === "bus") return journey.modes.every((item) => item === "bus");
  if (type === "combined")
    return journey.transferCount > 0 && new Set(journey.modes).size > 1;
  return true;
}

function applySort(journeys: Journey[], sort: SortValue) {
  return [...journeys].sort((a, b) => {
    if (sort === "earliest")
      return (
        timeMinutes(a.arrivalTime, a.arrivalDayOffset) -
        timeMinutes(b.arrivalTime, b.arrivalDayOffset)
      );
    if (sort === "shortest")
      return a.totalDurationMinutes - b.totalDurationMinutes;
    if (sort === "lowest") return a.totalPrice - b.totalPrice;
    if (sort === "fewest")
      return (
        a.transferCount - b.transferCount ||
        a.totalDurationMinutes - b.totalDurationMinutes
      );
    if (sort === "latest")
      return (
        timeMinutes(b.departureTime, b.departureDayOffset) -
        timeMinutes(a.departureTime, a.departureDayOffset)
      );
    return (
      Number(isJourneyBookable(b)) - Number(isJourneyBookable(a)) ||
      timeMinutes(a.arrivalTime, a.arrivalDayOffset) -
        timeMinutes(b.arrivalTime, b.arrivalDayOffset) ||
      a.totalPrice - b.totalPrice
    );
  });
}

function SearchSummary({
  search,
  actionPath,
}: {
  search: SearchValues;
  actionPath: string;
}) {
  return (
    <div className="sticky top-16 z-30 border-b border-[#DCE3DE] bg-white/95 shadow-[0_8px_24px_rgba(16,34,53,0.05)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1240px] items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-base font-extrabold tracking-[-0.02em] sm:text-lg">
            <span className="truncate">{search.from}</span>
            <ArrowRight className="size-4 shrink-0 text-[#17966B]" />
            <span className="truncate">{search.to}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-semibold text-[#718091] sm:text-sm">
            <span className="inline-flex items-center gap-1">
              <CalendarDays className="size-3.5" /> {dateLabel(search.date)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="size-3.5" /> {search.travellers}{" "}
              {search.travellers === 1 ? "traveller" : "travellers"}
            </span>
            <span className="hidden sm:inline">· {modeLabel(search.mode)}</span>
          </div>
        </div>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="h-11 shrink-0 rounded-xl border-[#D5DED8] bg-white font-extrabold text-[#102235]"
            >
              <Search className="size-4" />
              <span className="hidden sm:inline">Modify search</span>
              <span className="sm:hidden">Modify</span>
            </Button>
          </SheetTrigger>
          <SheetContent
            side="top"
            className="max-h-[96vh] overflow-y-auto border-[#DCE3DE] bg-[#F7F8F4] p-0"
          >
            <SheetHeader className="mx-auto w-full max-w-[1180px] px-4 pb-2 pt-5 text-left sm:px-6">
              <SheetTitle className="text-xl font-extrabold">
                Modify your journey search
              </SheetTitle>
              <SheetDescription>
                Update any detail and search again.
              </SheetDescription>
            </SheetHeader>
            <div className="mx-auto w-full max-w-[1180px] px-4 pb-6 sm:px-6">
              <SearchForm
                actionPath={actionPath}
                initialFrom={`${search.from} · City`}
                initialTo={`${search.to} · City`}
                initialDate={search.date}
                initialMode={search.mode}
                initialTravellers={search.travellers}
                initialArriveBefore={search.arriveBefore}
              />
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

export function ResultsExperience({
  search,
  backendJourneys,
}: {
  search: SearchValues;
  backendJourneys?: Journey[];
}) {
  const actionPath = backendJourneys ? "/search" : "/demo";
  const router = useRouter();
  const [soldOut, setSoldOut] = useState<string[]>([]);
  const journeys = useMemo(
    () =>
      backendJourneys ??
      generateJourneys(
        search,
        services.map((s) =>
          soldOut.includes(s.id)
            ? { ...s, availabilityStatus: "sold-out", seatsRemaining: 0 }
            : s,
        ),
      ),
    [search, soldOut, backendJourneys],
  );
  const [filters, setFilters] = useState<FilterState>(() => ({
    ...defaultFilters,
    maxPrice: search.budget ?? defaultFilters.maxPrice,
    arriveBefore: search.arriveBefore || "",
  }));
  const [sort, setSort] = useState<SortValue>("recommended");
  const [loading, setLoading] = useState(true);
  const [loadingStage, setLoadingStage] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [comparisonIds, setComparisonIds] = useState<string[]>([]);

  useEffect(() => {
    const stageTimers = [350, 700, 1050].map((delay, index) =>
      window.setTimeout(() => setLoadingStage(index + 1), delay),
    );
    const completeTimer = window.setTimeout(() => setLoading(false), 1400);
    return () => {
      stageTimers.forEach(window.clearTimeout);
      window.clearTimeout(completeTimer);
    };
  }, []);

  const results = useMemo(() => {
    const filtered = journeys.filter((journey) => {
      if (!matchesSearchMode(journey, search.mode)) return false;
      if (!matchesType(journey, filters.type)) return false;
      if (filters.availableOnly && !isJourneyBookable(journey)) return false;
      if (
        !filters.includeWaitlisted &&
        journey.segments.some(
          (segment) => segment.availabilityStatus === "waitlisted",
        )
      )
        return false;
      if (
        filters.departureWindows.length &&
        !filters.departureWindows.includes(departureWindow(journey))
      )
        return false;
      if (journey.transferCount > filters.maxTransfers) return false;
      if (
        journey.totalPrice < filters.minPrice ||
        journey.totalPrice > filters.maxPrice
      )
        return false;
      if (
        filters.safety === "comfortable" &&
        !["direct", "comfortable"].includes(journey.connectionRisk)
      )
        return false;
      if (
        filters.arriveBefore &&
        minutes(journey.arrivalTime, journey.arrivalDayOffset) >
          minutes(filters.arriveBefore, 1)
      )
        return false;
      return true;
    });
    return applySort(filtered, sort);
  }, [filters, search.mode, sort, journeys]);

  const unavailableDirect = results.filter(
    (journey) => journey.transferCount === 0 && !isJourneyBookable(journey),
  );
  const primaryResults = results.filter(
    (journey) => !unavailableDirect.some((item) => item.id === journey.id),
  );
  const bookableCount = results.filter(isJourneyBookable).length;
  const combinedBookableCount = results.filter(
    (journey) => journey.transferCount > 0 && isJourneyBookable(journey),
  ).length;
  const comparisonJourneys = comparisonIds
    .map((id) => journeys.find((journey) => journey.id === id))
    .filter((journey): journey is Journey => Boolean(journey));

  function showJourney(journey: Journey) {
    setSelectedJourney(journey);
    setDetailsOpen(true);
  }

  function toggleComparison(journey: Journey, checked: boolean) {
    if (!checked) {
      setComparisonIds((current) => current.filter((id) => id !== journey.id));
      return;
    }
    if (comparisonIds.includes(journey.id)) return;
    if (comparisonIds.length >= 3) {
      toast.warning("You can compare up to three journeys at a time.");
      return;
    }
    setComparisonIds((current) => [...current, journey.id]);
  }

  function shiftDate(days: number) {
    const date = new Date(`${search.date}T12:00:00`);
    date.setDate(date.getDate() + days);
    const params = new URLSearchParams({
      from: search.from,
      to: search.to,
      date: date.toISOString().split("T")[0],
      arriveBefore: filters.arriveBefore,
      travellers: String(search.travellers),
      mode: search.mode,
    });
    router.push(`${actionPath}?${params.toString()}`);
  }

  return (
    <main className="min-h-screen bg-[#F7F8F4] text-[#102235]">
      <SiteNav />
      <SearchSummary search={search} actionPath={actionPath} />

      <section className="mx-auto max-w-[1240px] px-4 pb-24 pt-7 sm:px-6 sm:pt-10 lg:px-8">
        {!backendJourneys && (
          <div className="mb-6 rounded-2xl border bg-white p-5 space-y-3">
            <h2 className="font-bold">Hackathon demo · simulated services</h2>
            <p>
              Budget is the total for the whole group, including terminal
              transfers. Arrival deadline is on the day after departure, in
              India time.
            </p>
            <Button
              onClick={() => {
                setSoldOut([]);
                setFilters({
                  ...defaultFilters,
                  maxPrice: 1200,
                  arriveBefore: "09:00",
                });
                router.push(
                  `/demo?from=Indore&to=New+Delhi&date=${search.date}&travellers=1&mode=all&arriveBefore=09%3A00&budget=1200`,
                );
              }}
            >
              Load judging scenario
            </Button>
            <div className="flex flex-wrap gap-3">
              {["train-A", "train-B"].map((id) => (
                <label key={id} className="flex min-h-11 items-center gap-2">
                  <input
                    type="checkbox"
                    checked={soldOut.includes(id)}
                    onChange={(e) =>
                      setSoldOut((current) =>
                        e.target.checked
                          ? [...current, id]
                          : current.filter((x) => x !== id),
                      )
                    }
                  />
                  Sell out {id}
                </label>
              ))}
              <Button variant="outline" onClick={() => setSoldOut([])}>
                Reset seats
              </Button>
            </div>
            <p role="status" aria-live="polite">
              {bookableCount
                ? `Recommended: ${results
                    .find(isJourneyBookable)
                    ?.segments.map((s) => s.serviceNumber)
                    .join(
                      " + ",
                    )}. ${results.find(isJourneyBookable)?.recommendationReason}`
                : "No fully available itinerary meets your constraints. Review blocked legs below, try another date or check nearby stations."}
            </p>
          </div>
        )}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-[#CDE5D8] bg-white px-3 py-1.5 text-xs font-extrabold text-[#0B7C55]">
                <Sparkles className="size-3.5" /> Complete route search
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#718091]">
                <Clock3 className="size-3.5" /> Simulated data · no live tickets
              </span>
            </div>
            <h1 className="mt-4 text-balance text-3xl font-extrabold tracking-[-0.045em] sm:text-4xl">
              {results.length} possible {results.length === 1 ? "way" : "ways"}{" "}
              from {search.from} to {search.to}
            </h1>
            <p
              className="mt-2 text-base font-medium text-[#687687]"
              aria-live="polite"
            >
              {bookableCount} currently bookable ·{" "}
              {results.length - bookableCount} need attention
            </p>
          </div>

          <div className="hidden items-center gap-2 md:flex">
            <span className="text-sm font-bold text-[#718091]">Sort by</span>
            <SortSelect value={sort} onChange={setSort} />
          </div>
        </div>

        <div className="sticky top-[129px] z-20 -mx-4 mt-5 border-y border-[#DCE3DE] bg-[#F7F8F4]/95 px-4 py-2 backdrop-blur md:hidden">
          <div className="grid grid-cols-2 gap-2">
            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
              <SheetTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 rounded-xl border-[#D5DED8] bg-white font-extrabold"
                >
                  <Filter className="size-4" /> Filters
                </Button>
              </SheetTrigger>
              <SheetContent
                side="bottom"
                className="max-h-[88vh] rounded-t-[24px] border-[#DCE3DE] bg-white p-0"
              >
                <SheetHeader className="border-b border-[#E2E7E3] p-5 text-left">
                  <SheetTitle className="text-xl font-extrabold">
                    Filter journeys
                  </SheetTitle>
                  <SheetDescription>
                    {results.length} journeys currently match
                  </SheetDescription>
                </SheetHeader>
                <div className="flex-1 overflow-y-auto px-5 py-4">
                  <FilterPanel
                    filters={filters}
                    onChange={setFilters}
                    resultCount={results.length}
                  />
                </div>
                <SheetFooter className="border-t border-[#E2E7E3] bg-white p-4">
                  <Button
                    type="button"
                    onClick={() => setFilterOpen(false)}
                    className="h-12 w-full rounded-xl bg-[#102235] font-extrabold text-white"
                  >
                    Show {results.length} journeys
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
            <SortSelect value={sort} onChange={setSort} mobile />
          </div>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[276px_minmax(0,1fr)] md:items-start">
          <aside
            className="sticky top-[152px] hidden max-h-[calc(100vh-176px)] overflow-y-auto rounded-[22px] border border-[#DFE5E0] bg-white p-5 shadow-[0_10px_32px_rgba(16,34,53,0.04)] md:block"
            aria-label="Journey filters"
          >
            <FilterPanel
              filters={filters}
              onChange={setFilters}
              resultCount={results.length}
            />
          </aside>

          <div className="min-w-0">
            {loading ? (
              <div>
                <div
                  className="mb-4 flex items-center gap-3 rounded-2xl border border-[#CDE5D8] bg-[#EFF9F4] p-4 text-sm font-extrabold text-[#0B6949]"
                  role="status"
                  aria-live="polite"
                >
                  <RefreshCcw className="size-4 animate-spin" />
                  {loadingMessages[loadingStage]}
                </div>
                <div className="space-y-4">
                  <LoadingJourneyCard />
                  <LoadingJourneyCard />
                  <LoadingJourneyCard />
                </div>
              </div>
            ) : results.length ? (
              <>
                {unavailableDirect.length > 0 && combinedBookableCount > 0 ? (
                  <div className="mb-4 flex items-start gap-3 rounded-2xl border border-[#C9DEEC] bg-[#F0F8FC] p-4 text-sm leading-6 text-[#365F78]">
                    <Info className="mt-0.5 size-4 shrink-0" />
                    <p>
                      <strong>
                        Some direct tickets are unavailable for this date.
                      </strong>{" "}
                      We found {combinedBookableCount} connected{" "}
                      {combinedBookableCount === 1 ? "journey" : "journeys"}{" "}
                      that can still get you there.
                    </p>
                  </div>
                ) : null}

                <div
                  className="space-y-4"
                  aria-label="Available and connected journeys"
                >
                  <AnimatePresence initial={false}>
                    {primaryResults.map((journey) => (
                      <JourneyCard
                        key={journey.id}
                        journey={journey}
                        travelDate={search.date}
                        compared={comparisonIds.includes(journey.id)}
                        onCompareChange={(checked) =>
                          toggleComparison(journey, checked)
                        }
                        onView={() => showJourney(journey)}
                      />
                    ))}
                  </AnimatePresence>
                </div>

                {unavailableDirect.length ? (
                  <details className="group mt-5 rounded-[20px] border border-[#E5D6D4] bg-white">
                    <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 font-extrabold text-[#7A4C4C] sm:px-5">
                      <span>
                        View {unavailableDirect.length} unavailable direct{" "}
                        {unavailableDirect.length === 1 ? "option" : "options"}
                      </span>
                      <ChevronDown className="size-4 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="space-y-4 border-t border-[#EDE3E2] bg-[#FBF8F7] p-3 sm:p-4">
                      {unavailableDirect.map((journey) => (
                        <JourneyCard
                          key={journey.id}
                          journey={journey}
                          travelDate={search.date}
                          compared={comparisonIds.includes(journey.id)}
                          onCompareChange={(checked) =>
                            toggleComparison(journey, checked)
                          }
                          onView={() => showJourney(journey)}
                        />
                      ))}
                    </div>
                  </details>
                ) : null}
              </>
            ) : (
              <EmptyState
                filters={filters}
                onReset={() => setFilters(defaultFilters)}
                onShiftDate={shiftDate}
              />
            )}
          </div>
        </div>
      </section>

      <SiteFooter />

      <JourneyDetailsSheet
        journey={journeys.find((j) => j.id === selectedJourney?.id) ?? null}
        travelDate={search.date}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
      <ComparisonTray
        journeys={comparisonJourneys}
        onRemove={(id) =>
          setComparisonIds((current) => current.filter((item) => item !== id))
        }
        onClear={() => setComparisonIds([])}
        onView={showJourney}
      />
    </main>
  );
}

function SortSelect({
  value,
  onChange,
  mobile = false,
}: {
  value: SortValue;
  onChange: (value: SortValue) => void;
  mobile?: boolean;
}) {
  return (
    <Select value={value} onValueChange={(next) => onChange(next as SortValue)}>
      <SelectTrigger
        className={`${mobile ? "h-12 w-full" : "h-11 w-[205px]"} rounded-xl border-[#D5DED8] bg-white font-extrabold shadow-none`}
      >
        {mobile ? (
          <ListFilter className="size-4" />
        ) : (
          <SlidersHorizontal className="size-4" />
        )}
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="rounded-xl border-[#DCE3DE]">
        {sortOptions.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="min-h-10"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function EmptyState({
  filters,
  onReset,
  onShiftDate,
}: {
  filters: FilterState;
  onReset: () => void;
  onShiftDate: (days: number) => void;
}) {
  return (
    <section className="rounded-[24px] border border-[#DFE5E0] bg-white px-5 py-10 text-center sm:px-8 sm:py-14">
      <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-[#FFF4E5] text-[#B66E16]">
        <CircleAlert className="size-6" />
      </span>
      <h2 className="mt-5 text-2xl font-extrabold tracking-[-0.035em]">
        We couldn’t find a fully matching journey.
      </h2>
      <p className="mx-auto mt-3 max-w-lg leading-7 text-[#687687]">
        Try a nearby date or relax one of your filters. Your search information
        will stay in place.
      </p>
      <div className="mx-auto mt-6 grid max-w-xl gap-2 sm:grid-cols-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => onShiftDate(-1)}
          className="h-12 rounded-xl border-[#DCE3DE]"
        >
          Check previous day
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => onShiftDate(1)}
          className="h-12 rounded-xl border-[#DCE3DE]"
        >
          Check next day
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onReset}
          className="h-12 rounded-xl border-[#DCE3DE]"
        >
          Reset all filters
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            toast.info(
              "Availability alerts are a prototype action and are not yet enabled.",
            )
          }
          className="h-12 rounded-xl border-[#DCE3DE]"
        >
          Create availability alert
        </Button>
      </div>
      {filters.type === "direct" ? (
        <p className="mt-4 text-sm font-bold text-[#B66E16]">
          The direct-only filter is currently limiting connected alternatives.
        </p>
      ) : null}
    </section>
  );
}
