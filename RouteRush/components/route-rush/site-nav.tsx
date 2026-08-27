"use client"

import Link from "next/link"
import { HelpCircle, LogIn, Menu, Route, TrainFront } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

const navItems = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Saved journeys", href: "/#saved" },
  { label: "Help", href: "/#help" },
]

export function BrandMark() {
  return (
    <Link
      href="/"
      className="group inline-flex min-h-11 items-center gap-2 rounded-xl focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-emerald-600/30"
      aria-label="RouteRush home"
    >
      <span className="grid size-9 place-items-center rounded-xl bg-[#102235] text-white transition-transform group-hover:-rotate-3">
        <Route aria-hidden="true" className="size-5" />
      </span>
      <span className="text-lg font-extrabold tracking-[-0.04em] text-[#102235]">
        Route<span className="text-[#17966B]">Rush</span>
      </span>
    </Link>
  )
}

function SignInButton({ className = "" }: { className?: string }) {
  return (
    <Button
      type="button"
      variant="outline"
      className={`min-h-11 rounded-xl border-[#DCE3DE] bg-white px-4 text-[#102235] hover:bg-[#F1F5F2] ${className}`}
      onClick={() => toast.info("Sign-in is not enabled in this frontend prototype.")}
    >
      <LogIn aria-hidden="true" className="size-4" />
      Sign in
    </Button>
  )
}

export function SiteNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#E1E6E2]/90 bg-[#F7F8F4]/92 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1240px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <BrandMark />

        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="rounded-xl px-4 py-3 text-sm font-semibold text-[#536273] transition-colors hover:bg-white hover:text-[#102235] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-emerald-600/30"
            >
              {item.label}
            </Link>
          ))}
          <SignInButton className="ml-2" />
        </nav>

        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="icon-lg"
              className="rounded-xl border-[#DCE3DE] bg-white md:hidden"
              aria-label="Open navigation menu"
            >
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[88vw] max-w-sm border-[#DCE3DE] bg-[#F7F8F4] p-0">
            <SheetHeader className="border-b border-[#E1E6E2] p-5 text-left">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SheetDescription className="sr-only">
                Navigate RouteRush
              </SheetDescription>
              <BrandMark />
            </SheetHeader>
            <nav className="flex flex-1 flex-col gap-2 p-5" aria-label="Mobile navigation">
              {navItems.map((item, index) => {
                const Icon = index === 0 ? TrainFront : index === 1 ? Route : HelpCircle
                return (
                  <SheetClose asChild key={item.label}>
                    <Link
                      href={item.href}
                      className="flex min-h-12 items-center gap-3 rounded-2xl border border-transparent px-4 font-semibold text-[#102235] transition-colors hover:border-[#DCE3DE] hover:bg-white"
                    >
                      <Icon aria-hidden="true" className="size-5 text-[#17966B]" />
                      {item.label}
                    </Link>
                  </SheetClose>
                )
              })}
              <SignInButton className="mt-3 w-full" />
            </nav>
            <p className="px-6 pb-6 text-sm leading-6 text-[#718091]">
              Every possible way to get there.
            </p>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}

