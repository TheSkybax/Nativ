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
  const wordColor = isLight ? "#f2fbff" : isMono ? "currentColor" : "#dcebf4";
  const style = { "--logo-word": wordColor } as CSSProperties;

  return (
    <span className={`nativ-logo nativ-logo-${variant}${compact ? " nativ-logo-compact" : ""}`} style={style} aria-label="Nativ">
      <img className="nativ-logo-mark" src="/nativ-logo.svg" alt="" aria-hidden="true" />
      {!compact ? <span className="nativ-logo-word">nativ</span> : null}
    </span>
  );
}
