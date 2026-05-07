import Link from 'next/link'
import { Logo } from './Logo'

export function SiteFooter() {
  return (
    <footer className="border-t border-[hsl(40_30%_20%/0.6)] bg-[hsl(220_15%_7%/0.6)] mt-12">
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
          <div>
            <Logo size={28} withWord />
            <p className="mt-3 text-[hsl(38_15%_60%/0.95)] font-prose text-base leading-snug max-w-xs">
              A premium, mobile-first companion for Magic: The Gathering — built for the
              table, the rules, and the moment of resolution.
            </p>
          </div>
          <div>
            <h4 className="font-display tracking-[0.2em] text-xs uppercase text-[hsl(38_15%_60%)] mb-3">
              Project
            </h4>
            <ul className="space-y-2 text-[hsl(38_15%_60%)]">
              <li>
                <Link href="/about" className="hover:text-[hsl(42_75%_65%)]">
                  About
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-[hsl(42_75%_65%)]">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-[hsl(42_75%_65%)]">
                  Terms
                </Link>
              </li>
              <li>
                <a
                  href="mailto:hello@thestack.gg"
                  className="hover:text-[hsl(42_75%_65%)]"
                >
                  Contact
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-display tracking-[0.2em] text-xs uppercase text-[hsl(38_15%_60%)] mb-3">
              Community
            </h4>
            <ul className="space-y-2 text-[hsl(38_15%_60%)]">
              <li>
                <a href="#" className="hover:text-[hsl(42_75%_65%)]">
                  Discord
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-[hsl(42_75%_65%)]">
                  Twitter / X
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/moatsmd/thestack-gg"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-[hsl(42_75%_65%)] inline-flex items-center gap-1.5"
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-display tracking-[0.2em] text-xs uppercase text-[hsl(38_15%_60%)] mb-3">
              Tools
            </h4>
            <ul className="space-y-2 text-[hsl(38_15%_60%)]">
              <li>
                <Link href="/tracker" className="hover:text-[hsl(42_75%_65%)]">
                  Life Tracker
                </Link>
              </li>
              <li>
                <Link href="/toolkit" className="hover:text-[hsl(42_75%_65%)]">
                  Card Lookup
                </Link>
              </li>
              <li>
                <Link href="/glossary" className="hover:text-[hsl(42_75%_65%)]">
                  Glossary
                </Link>
              </li>
              <li>
                <Link href="/dice" className="hover:text-[hsl(42_75%_65%)]">
                  Dice
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-[hsl(40_30%_20%/0.5)] text-xs text-[hsl(38_15%_60%/0.85)] space-y-2 max-w-3xl">
          <p>
            Card data from{' '}
            <a
              className="text-[hsl(42_75%_65%/0.85)] hover:text-[hsl(42_75%_65%)]"
              href="https://scryfall.com"
              target="_blank"
              rel="noreferrer"
            >
              Scryfall
            </a>
            . Magic: The Gathering is © Wizards of the Coast.
          </p>
          <p>
            TheStack.gg is unaffiliated with Wizards of the Coast. All trademarks are
            property of their respective owners.
          </p>
        </div>
      </div>
    </footer>
  )
}
