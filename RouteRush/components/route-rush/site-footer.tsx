import Link from "next/link"

import { BrandMark } from "@/components/route-rush/site-nav"

const footerLinks = [
  { label: "Product", href: "/#how-it-works" },
  { label: "Help", href: "/#help" },
  { label: "Privacy", href: "/#privacy" },
  { label: "Terms", href: "/#terms" },
]

export function SiteFooter() {
  return (
    <footer id="help" className="border-t border-[#E0E6E1] bg-white">
      <div className="mx-auto max-w-[1180px] px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-md">
            <BrandMark />
            <p className="mt-4 text-sm leading-6 text-[#718091]">
              RouteRush is a frontend prototype. Availability, schedules and fares shown are demonstrative and must be confirmed on the final booking platform.
            </p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-3" aria-label="Footer navigation">
            {footerLinks.map((link) => (
              <Link key={link.label} href={link.href} className="min-h-11 py-3 text-sm font-bold text-[#536273] hover:text-[#17966B]">
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="mt-8 flex flex-col gap-2 border-t border-[#E8ECE9] pt-6 text-xs leading-5 text-[#84919C] sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 RouteRush. Frontend product demonstration.</p>
          <p>Always verify live ticket data before travelling.</p>
        </div>
      </div>
    </footer>
  )
}

