import type { CSSProperties } from "react";
import Image from "next/image";
import logoMark from "../../public/nativ-logo.svg";

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
      <Image className="nativ-logo-mark" src={logoMark} alt="" aria-hidden="true" width={38} height={38} />
      {!compact ? <span className="nativ-logo-word">nativ</span> : null}
    </span>
  );
}
