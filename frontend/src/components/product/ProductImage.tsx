"use client";

import { useState } from "react";
import Image from "next/image";

import { cn } from "@/lib/cn";

/**
 * Product image with a branded, category-aware SVG fallback. If the local asset
 * is missing (a freshly admin-added product, or assets not yet generated) we
 * render an on-brand placeholder instead of a broken-image icon — so the app is
 * fully offline-safe. Drop real webp files into public/images/products to swap in.
 */
export function ProductImage({
  src,
  alt,
  category,
  className,
  sizes,
  priority,
}: {
  src: string;
  alt: string;
  category?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  const [failed, setFailed] = useState(!src);

  if (failed) {
    return <Fallback alt={alt} category={category} />;
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes ?? "(max-width: 768px) 100vw, 33vw"}
      priority={priority}
      className={cn("object-cover", className)}
      onError={() => setFailed(true)}
    />
  );
}

const GLYPHS: Record<string, { from: string; to: string; ink: string; path: React.ReactNode }> = {
  harnesses: {
    from: "oklch(var(--color-primary-100))",
    to: "oklch(var(--color-primary-300))",
    ink: "oklch(var(--color-primary-700))",
    path: (
      <>
        <path d="M40 28h40l-6 22a14 14 0 0 1-28 0z" />
        <path d="M34 50h52" />
        <path d="M48 72v12M72 72v12" />
      </>
    ),
  },
  helmets: {
    from: "oklch(0.86 0.06 58)",
    to: "oklch(0.78 0.12 55)",
    ink: "oklch(var(--color-accent-700))",
    path: (
      <>
        <path d="M28 70a32 32 0 0 1 64 0z" />
        <path d="M22 70h76" />
        <path d="M44 41l6 16M76 41l-6 16" />
      </>
    ),
  },
  ropes: {
    from: "oklch(var(--color-primary-100))",
    to: "oklch(var(--color-primary-200))",
    ink: "oklch(var(--color-primary-600))",
    path: (
      <>
        <circle cx="60" cy="60" r="30" />
        <circle cx="60" cy="60" r="19" />
        <circle cx="60" cy="60" r="8" />
      </>
    ),
  },
  carabiners: {
    from: "oklch(var(--color-primary-200))",
    to: "oklch(var(--color-primary-400))",
    ink: "oklch(var(--color-primary-800))",
    path: (
      <>
        <path d="M60 24c-18 0-30 14-30 34v18a16 16 0 0 0 32 0V44a8 8 0 0 1 16 0v6" />
        <circle cx="78" cy="50" r="6" fill="currentColor" stroke="none" />
      </>
    ),
  },
};

function Fallback({ alt, category }: { alt: string; category?: string }) {
  const glyph = GLYPHS[category ?? ""] ?? GLYPHS.carabiners;
  return (
    <div
      role="img"
      aria-label={alt}
      className="flex h-full w-full items-center justify-center"
      style={{ background: `linear-gradient(135deg, ${glyph.from}, ${glyph.to})` }}
    >
      <svg
        viewBox="0 0 120 120"
        className="h-1/2 w-1/2"
        fill="none"
        stroke={glyph.ink}
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
        style={{ color: glyph.ink }}
      >
        {glyph.path}
      </svg>
    </div>
  );
}
