import Link from "next/link"
import {
  ArrowRight,
  BadgeIndianRupee,
  BusFront,
  Check,
  CircleCheckBig,
  Clock3,
  MapPin,
  Route,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  TrainFront,
} from "lucide-react"

import { SearchForm } from "@/components/route-rush/search-form"
import { SiteFooter } from "@/components/route-rush/site-footer"
import { SiteNav } from "@/components/route-rush/site-nav"

const steps = [
  {
    number: "01",
    title: "Enter your destination and date",
    body: "Tell us where you need to be and when you need to travel.",
    icon: MapPin,
  },
  {
    number: "02",
    title: "We check direct and connected routes",
    body: "Trains, buses and useful combinations are considered together.",
    icon: SearchCheck,
  },
  {
    number: "03",
    title: "Compare the complete journey",
    body: "See total time, cost, availability and transfer safety in one place.",
    icon: Route,
  },
]

const benefits = [
  {
    icon: BadgeIndianRupee,
    title: "One complete cost",
    body: "Compare the estimated price of the whole journey, not just one ticket.",
  },
  {
    icon: Clock3,
    title: "Real transfer visibility",
    body: "Know the waiting time, location changes and connection risk before deciding.",
  },
  {
    icon: TrainFront,
    title: "Every useful travel mode",
    body: "Direct train, direct bus, or a smart combination when neither works alone.",
  },
]

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-[#F7F8F4] text-[#102235]">
      <SiteNav />

      <section className="relative isolate pb-20 pt-14 sm:pb-24 sm:pt-20 lg:pt-24">
        <div className="route-grid pointer-events-none absolute inset-0 -z-10 opacity-70" />
        <div className="pointer-events-none absolute left-1/2 top-20 -z-10 h-[440px] w-[760px] -translate-x-1/2 rounded-full bg-[#DDF3E8]/65 blur-3xl" />

        <div className="mx-auto max-w-[1240px] px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#CDE5D8] bg-white/90 px-3.5 py-2 text-sm font-bold text-[#0B6949] shadow-sm">
              <Sparkles aria-hidden="true" className="size-4" />
              Built for urgent journeys
            </div>
            <h1 className="text-balance text-[clamp(2.8rem,7vw,5.7rem)] font-extrabold leading-[0.98] tracking-[-0.065em] text-[#102235]">
              Every possible way
              <span className="block text-[#17966B]">to get there.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-8 text-[#5B6A79] sm:text-xl">
              Find available trains, buses and smart train + bus combinations for the exact date you need to travel.
            </p>
          </div>

          <div className="mx-auto mt-10 max-w-[1180px] sm:mt-12">
            <SearchForm />
            <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-medium text-[#687687]">
              <span className="inline-flex items-center gap-1.5">
                <Check className="size-4 text-[#17966B]" /> Complete journey price
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="size-4 text-[#17966B]" /> Transfer risk shown
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Check className="size-4 text-[#17966B]" /> Source-labelled schedule data
              </span>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-y border-[#E0E6E1] bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="mb-3 text-sm font-extrabold uppercase tracking-[0.18em] text-[#17966B]">
                How RouteRush is different
              </p>
              <h2 className="max-w-2xl text-balance text-4xl font-extrabold leading-tight tracking-[-0.045em] sm:text-5xl">
                Complete journeys, not isolated tickets.
              </h2>
            </div>
            <p className="max-w-2xl text-lg leading-8 text-[#617080] lg:justify-self-end">
              RouteRush looks beyond a sold-out direct ticket to show connected journeys that can still get you to your destination.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {steps.map((step) => {
              const Icon = step.icon
              return (
                <article key={step.number} className="group rounded-[22px] border border-[#DFE5E0] bg-[#FAFBF8] p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[#BBD9C8] hover:bg-white hover:shadow-[0_18px_45px_rgba(16,34,53,0.08)]">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-extrabold tracking-[0.16em] text-[#8B99A4]">{step.number}</span>
                    <span className="grid size-11 place-items-center rounded-2xl bg-[#E9F6F0] text-[#0B7C55]">
                      <Icon aria-hidden="true" className="size-5" />
                    </span>
                  </div>
                  <h3 className="mt-8 text-xl font-extrabold tracking-[-0.025em]">{step.title}</h3>
                  <p className="mt-3 leading-7 text-[#657483]">{step.body}</p>
                </article>
              )
            })}
          </div>

          <div className="mt-10 overflow-hidden rounded-[26px] border border-[#DCE4DE] bg-[#102235] p-5 text-white shadow-[0_22px_60px_rgba(16,34,53,0.16)] sm:p-8 lg:p-10">
            <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-center">
              <div>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm font-bold text-white/80">
                  <SearchCheck className="size-4" /> Alternative route found
                </span>
                <h3 className="mt-5 text-3xl font-extrabold leading-tight tracking-[-0.04em] sm:text-4xl">
                  When direct is sold out, your journey may not be.
                </h3>
                <p className="mt-4 max-w-lg leading-7 text-[#B9C7D3]">
                  RouteRush joins available segments and checks the whole itinerary before calling it a usable option.
                </p>
              </div>

              <div className="rounded-[22px] bg-white p-4 text-[#102235] sm:p-5">
                <div className="flex items-center justify-between rounded-2xl border border-[#F0CACA] bg-[#FFF6F5] p-4">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 place-items-center rounded-xl bg-white text-[#D85858] shadow-sm"><TrainFront className="size-5" /></span>
                    <div>
                      <p className="font-extrabold">Direct train · Indore → Delhi</p>
                      <p className="mt-0.5 text-sm text-[#718091]">Fastest direct option</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-[#FDE8E6] px-3 py-1.5 text-xs font-extrabold text-[#B73E3E]">Sold out</span>
                </div>

                <div className="mx-8 flex h-9 items-center gap-2 border-l-2 border-dashed border-[#B7C8BE] pl-4 text-xs font-bold uppercase tracking-[0.14em] text-[#17966B]">
                  <ArrowRight className="size-4" /> Another way is available
                </div>

                <div className="rounded-2xl border border-[#BFE1CE] bg-[#F0FAF5] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-extrabold">Bus to Bhopal + Train to Delhi</p>
                      <p className="mt-1 text-sm font-medium text-[#5F7067]">15h 25m · 1 transfer · ₹2,320 total</p>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white px-2.5 py-1.5 text-xs font-extrabold text-[#0B7C55] shadow-sm">
                      <CircleCheckBig className="size-3.5" /> Available
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-[auto_1fr_auto_1fr_auto] items-center gap-2 text-sm font-bold">
                    <BusFront className="size-5 text-[#4A9AC7]" />
                    <span className="h-1 rounded-full bg-[#B9D9EA]" />
                    <span className="rounded-full border border-[#C8D8CF] bg-white px-3 py-1 text-xs">Bhopal · 1h 35m</span>
                    <span className="h-1 rounded-full bg-[#A9D9C1]" />
                    <TrainFront className="size-5 text-[#17966B]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24">
        <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-3 text-sm font-extrabold uppercase tracking-[0.18em] text-[#17966B]">
              Clear answers under pressure
            </p>
            <h2 className="text-balance text-4xl font-extrabold tracking-[-0.045em] sm:text-5xl">
              Built for decisions, not endless searching.
            </h2>
          </div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {benefits.map((benefit) => {
              const Icon = benefit.icon
              return (
                <article key={benefit.title} className="rounded-[22px] border border-[#DFE5E0] bg-white p-6 shadow-[0_12px_35px_rgba(16,34,53,0.05)]">
                  <span className="grid size-12 place-items-center rounded-2xl bg-[#102235] text-white">
                    <Icon aria-hidden="true" className="size-5" />
                  </span>
                  <h3 className="mt-6 text-xl font-extrabold tracking-[-0.025em]">{benefit.title}</h3>
                  <p className="mt-3 leading-7 text-[#657483]">{benefit.body}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      <section id="saved" className="px-4 pb-20 sm:px-6 sm:pb-24 lg:px-8">
        <div className="relative mx-auto max-w-[1180px] overflow-hidden rounded-[28px] bg-[#17966B] px-6 py-14 text-white sm:px-10 sm:py-16 lg:px-16">
          <div className="pointer-events-none absolute -right-20 -top-24 size-80 rounded-full border-[60px] border-white/10" />
          <div className="relative max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-sm font-bold">
              <ShieldCheck className="size-4" /> Calm, transparent route planning
            </div>
            <h2 className="mt-5 text-balance text-4xl font-extrabold leading-tight tracking-[-0.05em] sm:text-5xl">
              Need to get there? Find a way.
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-8 text-white/80">
              Search the complete journey and compare the routes that are actually useful for your date.
            </p>
            <ButtonLink />
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  )
}

function ButtonLink() {
  return (
    <Link
      href="#search"
      className="mt-8 inline-flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-white px-6 py-3 font-extrabold text-[#102235] shadow-lg transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/60"
    >
      Search available journeys
      <ArrowRight className="size-4" />
    </Link>
  )
}

