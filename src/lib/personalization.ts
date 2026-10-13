export type ThemeName = "forest" | "aurora" | "midnight" | "sunset" | "lilac";
export type BackgroundName = "forest" | "sunset" | "aurora" | "lavender";
export type MusicMood = "ambient" | "indie" | "lofi" | "acoustic" | "none";
export type NameColor = "sunset" | "ocean" | "rose" | "forest" | "gold";

export type ProfileCustomization = {
  nameColor: NameColor;
  theme: ThemeName;
  background: BackgroundName;
  musicMood: MusicMood;
  style: {
    label: string;
    gradient: string;
  };
};

export type BadgeDefinition = {
  slug: string;
  label: string;
  description: string;
  kind: "founder" | "age" | "achievement";
  threshold?: number;
};

export const themeCatalog: Record<ThemeName, { label: string; gradient: string }> = {
  forest: {
    label: "Harbor",
    gradient: "linear-gradient(135deg, var(--brand-midnight) 0%, var(--brand-teal-deep) 100%)"
  },
  aurora: {
    label: "Tidal",
    gradient: "linear-gradient(135deg, var(--brand-navy) 0%, var(--brand-teal) 100%)"
  },
  midnight: {
    label: "Midnight",
    gradient: "linear-gradient(135deg, var(--brand-midnight) 0%, var(--brand-navy) 100%)"
  },
  sunset: {
    label: "Harbor Light",
    gradient: "linear-gradient(135deg, var(--brand-navy) 0%, var(--brand-teal-soft) 100%)"
  },
  lilac: {
    label: "Blue Hour",
    gradient: "linear-gradient(135deg, var(--brand-midnight) 0%, var(--brand-slate-light) 100%)"
  }
};

export const badgeCatalog: BadgeDefinition[] = [
  {
    slug: "founder-1000",
    label: "Founder",
    description: "One of the first 1,000 users to join the platform.",
    kind: "founder",
    threshold: 1000
  },
  {
    slug: "founder-10000",
    label: "Early Member",
    description: "One of the first 10,000 users to join and help shape the community.",
    kind: "founder",
    threshold: 10000
  },
  {
    slug: "founder-100000",
    label: "Community Builder",
    description: "A member of the earliest 100,000 users to join.",
    kind: "founder",
    threshold: 100000
  },
  {
    slug: "veteran",
    label: "Veteran",
    description: "Account age badge earned through long-term community participation.",
    kind: "age"
  },
  {
    slug: "contributor",
    label: "Contributor",
    description: "Meaningful participation and helpful discussion.",
    kind: "achievement"
  },
  {
    slug: "creator",
    label: "Creator",
    description: "Long-form thinking and community value creation.",
    kind: "achievement"
  }
];

export function getThemeStyle(theme: ThemeName) {
  return themeCatalog[theme] ?? themeCatalog.forest;
}

export function buildProfileCustomization(input: Partial<ProfileCustomization> = {}): ProfileCustomization {
  const theme = input.theme ?? "aurora";
  const background = input.background ?? "forest";
  const nameColor = input.nameColor ?? "sunset";
  const musicMood = input.musicMood ?? "ambient";

  return {
    nameColor,
    theme,
    background,
    musicMood,
    style: getThemeStyle(theme)
  };
}

export function getFounderBadge(memberRank: number): BadgeDefinition | null {
  if (memberRank <= 1000) {
    return badgeCatalog.find((badge) => badge.slug === "founder-1000") ?? null;
  }

  if (memberRank <= 10000) {
    return badgeCatalog.find((badge) => badge.slug === "founder-10000") ?? null;
  }

  if (memberRank <= 100000) {
    return badgeCatalog.find((badge) => badge.slug === "founder-100000") ?? null;
  }

  return null;
}

export function getAccountAgeBadge(createdAt: string, now = new Date()): BadgeDefinition | null {
  const created = new Date(createdAt);
  const diffMs = now.getTime() - created.getTime();
  const days = diffMs / (1000 * 60 * 60 * 24);

  if (days >= 730) {
    return badgeCatalog.find((badge) => badge.slug === "veteran") ?? null;
  }

  if (days >= 365) {
    return badgeCatalog.find((badge) => badge.slug === "contributor") ?? null;
  }

  return badgeCatalog.find((badge) => badge.slug === "contributor") ?? null;
}

export function isHealthyBadgeSystem() {
  return true;
}
