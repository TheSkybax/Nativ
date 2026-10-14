"use client";

import { useId } from "react";

export type VerificationSealVariant = "founder" | "standard" | "creator";

const sealStyles: Record<VerificationSealVariant, {
  label: string;
  highlight: string;
  midtone: string;
  shadow: string;
}> = {
  founder: {
    label: "Founder verified account",
    highlight: "#fff1a8",
    midtone: "#e5b943",
    shadow: "#8c6118"
  },
  standard: {
    label: "Verified account",
    highlight: "#c6e7ff",
    midtone: "#4da5e8",
    shadow: "#205b9c"
  },
  creator: {
    label: "Verified creator account",
    highlight: "#c9f4c8",
    midtone: "#55bd72",
    shadow: "#24713d"
  }
};

export function VerifiedSeal({
  className,
  variant = "standard",
  label
}: {
  className: string;
  variant?: VerificationSealVariant;
  label?: string;
}) {
  const gradientId = `verified-seal-${useId().replaceAll(":", "")}`;
  const style = sealStyles[variant];

  return (
    <svg className={className} viewBox="0 0 24 24" role="img" aria-label={label ?? style.label}>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={style.highlight} />
          <stop offset="0.52" stopColor={style.midtone} />
          <stop offset="1" stopColor={style.shadow} />
        </linearGradient>
      </defs>
      <path d="m12 1.2 2.7 2 3.4-.2 1.4 3.1 3 1.7-.6 3.4 1.4 3.1-2.4 2.5-.4 3.4-3.3.9L15 23l-3-1.5L9 23l-2.2-2.3-3.3-.9-.4-3.4L.7 14l1.4-3.1-.6-3.4 3-1.7 1.4-3.1 3.4.2z" fill={`url(#${gradientId})`} stroke={style.shadow} strokeLinejoin="round" />
      <path d="m7.5 12.2 3 3 6.2-6.4" fill="none" stroke="#fffdf3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}
