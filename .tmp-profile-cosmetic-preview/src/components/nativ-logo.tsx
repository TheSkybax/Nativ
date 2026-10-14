import type { CSSProperties } from "react";

export type NativLogoVariant = "primary" | "compact" | "light" | "dark" | "monochrome";

export function NativLogo({
  variant = "primary",
  compact = false
}: {
  variant?: NativLogoVariant;
  compact?: boolean;
}) {
  const isLight = variant === "light";
  const isMono = variant === "monochrome";
  const markColor = isLight ? "#f2fbff" : isMono ? "currentColor" : "#21b39b";
  const wordColor = isLight ? "#f2fbff" : isMono ? "currentColor" : "#dcebf4";
  const style = { "--logo-word": wordColor } as CSSProperties;

  return (
    <span className={`nativ-logo nativ-logo-${variant}${compact ? " nativ-logo-compact" : ""}`} style={style} aria-label="Nativ">
      <svg className="nativ-logo-mark" viewBox="0 0 44 44" role="img" aria-hidden="true">
        <path d="M8 32V12h5l14 13V12h9v20h-5L17 19v13H8Z" fill="none" stroke={markColor} strokeWidth="4" strokeLinejoin="round" />
        <path d="M30 8h6" stroke={markColor} strokeWidth="4" strokeLinecap="round" />
      </svg>
      {!compact ? <span className="nativ-logo-word">nativ</span> : null}
    </span>
  );
}
