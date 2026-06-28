import Link from "next/link";
import { ArrowRight, MountainSnow } from "lucide-react";

import { buttonStyles } from "@/components/ui/Button";
import { DemoBadge } from "@/components/home/DemoBadge";

/**
 * Image-led hero. The indigo gradient is the base layer, so if the optional
 * photo 404s the composition still reads as designed (not a broken placeholder).
 */
export function Hero() {
  return (
    <section className="relative overflow-hidden bg-primary-950 text-white">
      {/* Photo layer (cover); gradient sits beneath via the section bg. */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-35"
        style={{ backgroundImage: "url(/images/hero/hero-climber.webp)" }}
        aria-hidden
      />
      {/* Brand gradient wash for text contrast + alpenglow accent. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(110deg, oklch(0.2 0.075 283 / 0.96) 0%, oklch(0.28 0.11 282 / 0.82) 45%, oklch(0.55 0.155 48 / 0.35) 100%)",
        }}
        aria-hidden
      />
      <TopoLines />

      <div className="container-page relative grid gap-8 py-20 sm:py-28 lg:grid-cols-12 lg:py-32">
        <div className="reveal lg:col-span-7">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-medium backdrop-blur-sm">
            <MountainSnow className="size-4 text-accent-400" aria-hidden />
            New season gear, freshly racked
          </span>

          <h1 className="mt-5 max-w-2xl font-display text-[clamp(2.5rem,6vw,4.75rem)] font-semibold leading-[0.98] tracking-tight text-white">
            Gear up for your next send.
          </h1>

          <p className="mt-5 max-w-xl text-lg text-white/80">
            Harnesses, ropes, helmets and hardware for imaginary adventures — chosen by people who
            actually climb. Find your fit, build your rack, and get out there.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/products" className={buttonStyles({ variant: "accent", size: "lg" })}>
              Shop all gear <ArrowRight className="size-4" aria-hidden />
            </Link>
            <Link
              href="/products?category=harnesses"
              className={buttonStyles({
                variant: "secondary",
                size: "lg",
                className: "border-white/25 bg-white/10 text-white hover:bg-white/20 hover:border-white/40",
              })}
            >
              Browse harnesses
            </Link>
          </div>

          <div className="mt-8">
            <DemoBadge className="border-white/20 bg-white/10 text-white/85" />
          </div>
        </div>
      </div>
    </section>
  );
}

function TopoLines() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.12]"
      preserveAspectRatio="none"
      viewBox="0 0 800 400"
      aria-hidden
    >
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <path
          key={i}
          d={`M0 ${80 + i * 55} C 200 ${40 + i * 55}, 320 ${140 + i * 55}, 520 ${90 + i * 55} S 760 ${30 + i * 55}, 800 ${70 + i * 55}`}
          fill="none"
          stroke="white"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
}
