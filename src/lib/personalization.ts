export type ThemeName = "forest" | "aurora" | "midnight" | "sunset" | "lilac";
export type BackgroundName =
  | "forest"
  | "sunset"
  | "aurora"
  | "lavender"
  | "founder"
  | `gradient-${BasicColorFamily}`
  | "gradient-event-preview";
export type MusicMood = "ambient" | "indie" | "lofi" | "acoustic" | "none";
export type NameColor = "nativ" | "gold" | "sage";
export type ProfilePanelColor =
  | "default"
  | `${BasicColorFamily}-${PanelColorTreatment}`
  | "midnight"
  | "promotion-preview";
export type ProfileCardsColor =
  | "default"
  | `${BasicColorFamily}-${PanelColorTreatment}`
  | "plum"
  | "promotion-preview";

export const basicColorFamilies = ["red", "orange", "yellow", "green", "blue", "purple"] as const;
export type BasicColorFamily = (typeof basicColorFamilies)[number];
export type PanelColorTreatment = "tint" | "solid";

export type ProfileCustomization = {
  nameColor: NameColor;
  profilePanelColor: ProfilePanelColor;
  profileCardsColor: ProfileCardsColor;
  theme: ThemeName;
  background: BackgroundName;
  musicMood: MusicMood;
  style: {
    label: string;
    gradient: string;
  };
};

export type BadgeCategory =
  | "membership"
  | "posting"
  | "conversation"
  | "community"
  | "prompt"
  | "founder"
  | "subscription";

export type BadgeIconName =
  | "sprout"
  | "calendar-one"
  | "calendar-five"
  | "paper-pencil"
  | "post-stack-100"
  | "post-stack-1k"
  | "post-stack-10k"
  | "speech-first"
  | "speech-active"
  | "speech-regular"
  | "community-member"
  | "community-regular"
  | "community-contributor"
  | "camera-first"
  | "camera-regular"
  | "camera-veteran"
  | "founder-shield"
  | "founding-group"
  | "supporter-hand"
  | "ad-free"
  | "support-month"
  | "support-year";

export type BadgeDefinition = {
  slug: string;
  label: string;
  description: string;
  category: BadgeCategory;
  icon: BadgeIconName;
};

export type BadgeEligibilityRule = {
  basis:
    | "join-date"
    | "post-count"
    | "comment-count"
    | "community-discussion-count"
    | "prompt-response-count"
    | "manual-assignment"
    | "member-rank"
    | "subscription-rank"
    | "active-subscription"
    | "subscription-duration";
  threshold?: number;
  cutoff?: string;
  demoOnly?: boolean;
  note?: string;
};

export const EARLY_MEMBER_CUTOFF_DATE = "2026-01-01T00:00:00Z";
export const FOUNDING_MEMBER_RANK_CUTOFF = 1000;
export const EARLY_SUPPORTER_SUBSCRIBER_RANK_CUTOFF = 100;

export const demoBadgeThresholds = {
  activeConversationalistComments: 50,
  conversationRegularComments: 250,
  communityRegularDiscussions: 25,
  communityContributorDiscussions: 100,
  promptRegularResponses: 7,
  promptVeteranResponses: 30
} as const;

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

export const badgeCatalog = [
  { slug: "early-member", label: "Early Member", description: "Joined Nativ before the designated early-membership cutoff.", category: "membership", icon: "sprout" },
  { slug: "one-year", label: "One Year", description: "One full year since creating the account.", category: "membership", icon: "calendar-one" },
  { slug: "five-years", label: "Five Years", description: "Five full years since creating the account.", category: "membership", icon: "calendar-five" },
  { slug: "first-post", label: "First Post", description: "Published an original post for the first time.", category: "posting", icon: "paper-pencil" },
  { slug: "posts-100", label: "100 Posts", description: "Published 100 original posts.", category: "posting", icon: "post-stack-100" },
  { slug: "posts-1000", label: "1,000 Posts", description: "Published 1,000 original posts.", category: "posting", icon: "post-stack-1k" },
  { slug: "posts-10000", label: "10,000 Posts", description: "Published 10,000 original posts.", category: "posting", icon: "post-stack-10k" },
  { slug: "first-conversation", label: "First Conversation", description: "Joined a conversation by posting a comment.", category: "conversation", icon: "speech-first" },
  { slug: "active-conversationalist", label: "Active Conversationalist", description: "Reached the demo comment-participation milestone.", category: "conversation", icon: "speech-active" },
  { slug: "conversation-regular", label: "Conversation Regular", description: "Reached the higher demo comment-participation milestone.", category: "conversation", icon: "speech-regular" },
  { slug: "community-member", label: "Community Member", description: "Participated in a community discussion.", category: "community", icon: "community-member" },
  { slug: "community-regular", label: "Community Regular", description: "Participated in community discussions over time.", category: "community", icon: "community-regular" },
  { slug: "community-contributor", label: "Community Contributor", description: "Made sustained contributions to community discussions.", category: "community", icon: "community-contributor" },
  { slug: "first-prompt", label: "First Prompt", description: "Shared a response to a Daily Prompt for the first time.", category: "prompt", icon: "camera-first" },
  { slug: "prompt-regular", label: "Prompt Regular", description: "Responded to multiple Daily Prompts over time.", category: "prompt", icon: "camera-regular" },
  { slug: "prompt-veteran", label: "Prompt Veteran", description: "Reached a substantial cumulative Daily Prompt participation milestone.", category: "prompt", icon: "camera-veteran" },
  { slug: "founder", label: "Founder", description: "Manually designated by Nativ as a founder.", category: "founder", icon: "founder-shield" },
  { slug: "founding-member", label: "Founding Member", description: "Joined within the first 1,000 Nativ members (placeholder cutoff).", category: "founder", icon: "founding-group" },
  { slug: "early-supporter", label: "Early Supporter", description: "One of the first 100 subscribers (eligibility tracking not connected).", category: "founder", icon: "supporter-hand" },
  { slug: "ad-free-supporter", label: "Ad-Free Supporter", description: "Currently eligible for Nativ's ad-free subscription.", category: "subscription", icon: "ad-free" },
  { slug: "one-month-supporting", label: "One Month Supporting", description: "Maintained an eligible subscription for one month.", category: "subscription", icon: "support-month" },
  { slug: "one-year-supporting", label: "One Year Supporting", description: "Maintained an eligible subscription for one year.", category: "subscription", icon: "support-year" }
] as const satisfies readonly BadgeDefinition[];

export type BadgeSlug = (typeof badgeCatalog)[number]["slug"];
type CatalogBadge = (typeof badgeCatalog)[number];

export type ProfileCosmeticUnlock =
  | { method: "earned-badge"; badgeSlug: BadgeSlug }
  | { method: "event-eligibility"; eventId: string }
  | { method: "free-promotion"; grantId: string }
  | { method: "account-age"; days: number };

export type ProfileCosmeticStatus = "available" | "locked" | "unreleased";

export type ProfileCosmeticEligibility = {
  earnedBadgeSlugs: readonly BadgeSlug[];
  eligibleEventIds?: readonly string[];
  freePromotionGrantIds?: readonly string[];
  accountAgeDays?: number;
};

export type ProfileColorOption<T extends string> = {
  value: T;
  label: string;
  swatch: string;
  treatment?: "default" | "tint" | "solid" | "gradient";
  unlock?: ProfileCosmeticUnlock;
  unreleased?: boolean;
};

export const profileNameColorOptions: readonly ProfileColorOption<NameColor>[] = [
  { value: "nativ", label: "Nativ", swatch: "var(--text-primary)", treatment: "default" },
  { value: "gold", label: "Founder Gold", swatch: "var(--profile-name-gold)", unlock: { method: "earned-badge", badgeSlug: "founder" } },
  { value: "sage", label: "One-Year Sage", swatch: "var(--profile-name-sage)", unlock: { method: "account-age", days: 365 } }
];

export const profileNameColorStyles: Record<NameColor, string> = {
  nativ: "var(--text-primary)",
  gold: "var(--profile-name-gold)",
  sage: "var(--profile-name-sage)"
};

const headerGradientNames: Record<BasicColorFamily, string> = {
  red: "Crimson Current",
  orange: "Citrus Ember",
  yellow: "Golden Hour",
  green: "Verdant Tide",
  blue: "Azure Drift",
  purple: "Amethyst Haze"
};

const panelTintNames: Record<BasicColorFamily, string> = {
  red: "Crimson Mist",
  orange: "Citrus Glow",
  yellow: "Golden Veil",
  green: "Verdant Mist",
  blue: "Azure Mist",
  purple: "Amethyst Mist"
};

const panelSolidNames: Record<BasicColorFamily, string> = {
  red: "Crimson Velvet",
  orange: "Citrus Clay",
  yellow: "Golden Ochre",
  green: "Verdant Grove",
  blue: "Azure Slate",
  purple: "Amethyst Stone"
};

export const profileHeaderBackgroundOptions: readonly ProfileColorOption<BackgroundName>[] = [
  { value: "forest", label: "Nativ", swatch: "var(--profile-header-default-gradient)", treatment: "default" },
  { value: "sunset", label: "Sunset", swatch: "var(--profile-header-sunset-gradient)", treatment: "gradient" },
  { value: "aurora", label: "Aurora", swatch: "var(--profile-header-aurora-gradient)", treatment: "gradient" },
  { value: "lavender", label: "Lavender", swatch: "var(--profile-header-lavender-gradient)", treatment: "gradient" },
  { value: "founder", label: "Founder Gold", swatch: "var(--profile-header-founder-gradient)", treatment: "gradient", unlock: { method: "earned-badge", badgeSlug: "founder" } },
  ...basicColorFamilies.map((family) => ({
    value: `gradient-${family}` as const,
    label: `${headerGradientNames[family]} (${family[0].toUpperCase()}${family.slice(1)} Gradient)`,
    swatch: `var(--profile-header-${family}-gradient)`,
    treatment: "gradient" as const
  })),
  { value: "gradient-event-preview", label: "Launch Event Gradient", swatch: "linear-gradient(135deg, #183f4c, #397365)", treatment: "gradient", unlock: { method: "event-eligibility", eventId: "nativ-launch" }, unreleased: true }
];

const basicPanelColorOptions: readonly ProfileColorOption<`${BasicColorFamily}-${PanelColorTreatment}`>[] =
  basicColorFamilies.flatMap((family) => ([
    {
      value: `${family}-tint` as `${BasicColorFamily}-tint`,
      label: `${panelTintNames[family]} (${family[0].toUpperCase()}${family.slice(1)} Tint)`,
      swatch: `var(--profile-panel-${family}-tint)`,
      treatment: "tint" as const
    },
    {
      value: `${family}-solid` as `${BasicColorFamily}-solid`,
      label: `${panelSolidNames[family]} (${family[0].toUpperCase()}${family.slice(1)} Solid)`,
      swatch: `var(--profile-panel-${family}-solid)`,
      treatment: "solid" as const
    }
  ]));

const defaultPanelColorOption: ProfileColorOption<"default"> = {
  value: "default",
  label: "Nativ",
  swatch: "var(--surface-primary)",
  treatment: "default"
};

export const profilePanelColorOptions: readonly ProfileColorOption<ProfilePanelColor>[] = [
  defaultPanelColorOption,
  ...basicPanelColorOptions,
  { value: "midnight", label: "Founding Midnight", swatch: "#365276", treatment: "solid", unlock: { method: "earned-badge", badgeSlug: "founding-member" } },
  { value: "promotion-preview", label: "Community Thank-You Tint", swatch: "var(--profile-panel-green-tint)", treatment: "tint", unlock: { method: "free-promotion", grantId: "community-thank-you" }, unreleased: true }
];

export const profileCardsColorOptions: readonly ProfileColorOption<ProfileCardsColor>[] = [
  defaultPanelColorOption,
  ...basicPanelColorOptions,
  { value: "plum", label: "Supporter Plum", swatch: "#735e94", treatment: "solid", unlock: { method: "earned-badge", badgeSlug: "early-supporter" } },
  { value: "promotion-preview", label: "Community Thank-You Tint", swatch: "var(--profile-panel-green-tint)", treatment: "tint", unlock: { method: "free-promotion", grantId: "community-thank-you" }, unreleased: true }
];

export function getProfileCosmeticStatus(
  option: ProfileColorOption<string>,
  eligibility: ProfileCosmeticEligibility
): ProfileCosmeticStatus {
  if (option.unreleased) {
    return "unreleased";
  }

  const unlock = option.unlock;
  const unlocked = !unlock
    || (unlock.method === "earned-badge" && eligibility.earnedBadgeSlugs.includes(unlock.badgeSlug))
    || (unlock.method === "event-eligibility" && eligibility.eligibleEventIds?.includes(unlock.eventId) === true)
    || (unlock.method === "free-promotion" && eligibility.freePromotionGrantIds?.includes(unlock.grantId) === true)
    || (unlock.method === "account-age" && (eligibility.accountAgeDays ?? 0) >= unlock.days);

  return unlocked ? "available" : "locked";
}

export function getLockedProfileBadges(earnedBadgeSlugs: readonly BadgeSlug[]): CatalogBadge[] {
  return badgeCatalog.filter((badge) => !earnedBadgeSlugs.includes(badge.slug));
}

export function getVisibleProfileCosmeticOptions<T extends string>(
  options: readonly ProfileColorOption<T>[],
  eligibility: ProfileCosmeticEligibility,
  includePreviewOptions = false
): readonly ProfileColorOption<T>[] {
  return includePreviewOptions
    ? options
    : options.filter((option) => getProfileCosmeticStatus(option, eligibility) === "available");
}

export function isDeveloperCosmeticsPreviewEnabled(
  nodeEnvironment: string | undefined,
  previewFlag: string | undefined
) {
  return nodeEnvironment === "development" && previewFlag === "1";
}

export function isProfileColorUnlocked(
  option: ProfileColorOption<string>,
  eligibility: ProfileCosmeticEligibility
) {
  return getProfileCosmeticStatus(option, eligibility) === "available";
}

export const badgeEligibility: Record<BadgeSlug, BadgeEligibilityRule> = {
  "early-member": { basis: "join-date", cutoff: EARLY_MEMBER_CUTOFF_DATE, note: "Boilerplate cutoff; replace with the actual launch cutoff." },
  "one-year": { basis: "join-date", threshold: 1 },
  "five-years": { basis: "join-date", threshold: 5 },
  "first-post": { basis: "post-count", threshold: 1 },
  "posts-100": { basis: "post-count", threshold: 100 },
  "posts-1000": { basis: "post-count", threshold: 1000 },
  "posts-10000": { basis: "post-count", threshold: 10000 },
  "first-conversation": { basis: "comment-count", threshold: 1 },
  "active-conversationalist": { basis: "comment-count", threshold: demoBadgeThresholds.activeConversationalistComments, demoOnly: true },
  "conversation-regular": { basis: "comment-count", threshold: demoBadgeThresholds.conversationRegularComments, demoOnly: true },
  "community-member": { basis: "community-discussion-count", threshold: 1 },
  "community-regular": { basis: "community-discussion-count", threshold: demoBadgeThresholds.communityRegularDiscussions, demoOnly: true, note: "Longitudinal participation tracking is not implemented." },
  "community-contributor": { basis: "community-discussion-count", threshold: demoBadgeThresholds.communityContributorDiscussions, demoOnly: true, note: "Longitudinal participation tracking is not implemented." },
  "first-prompt": { basis: "prompt-response-count", threshold: 1 },
  "prompt-regular": { basis: "prompt-response-count", threshold: demoBadgeThresholds.promptRegularResponses, demoOnly: true },
  "prompt-veteran": { basis: "prompt-response-count", threshold: demoBadgeThresholds.promptVeteranResponses, demoOnly: true },
  founder: { basis: "manual-assignment", demoOnly: true, note: "Founder accounts are intended to be assigned manually." },
  "founding-member": { basis: "member-rank", threshold: FOUNDING_MEMBER_RANK_CUTOFF, demoOnly: true, note: "The first-1,000 cutoff is a placeholder until launch membership ranks exist." },
  "early-supporter": { basis: "subscription-rank", threshold: EARLY_SUPPORTER_SUBSCRIBER_RANK_CUTOFF, demoOnly: true, note: "Subscriber order and billing history are not tracked." },
  "ad-free-supporter": { basis: "active-subscription", demoOnly: true, note: "Subscription status is not integrated." },
  "one-month-supporting": { basis: "subscription-duration", threshold: 30, demoOnly: true, note: "Subscription history is not integrated; duration is in days." },
  "one-year-supporting": { basis: "subscription-duration", threshold: 365, demoOnly: true, note: "Subscription history is not integrated; duration is in days." }
};

export function getThemeStyle(theme: ThemeName) {
  return themeCatalog[theme] ?? themeCatalog.forest;
}

export function buildProfileCustomization(input: Partial<ProfileCustomization> = {}): ProfileCustomization {
  const theme = input.theme ?? "aurora";
  const background = input.background ?? "forest";
  const nameColor = input.nameColor ?? "nativ";
  const profilePanelColor = input.profilePanelColor ?? "default";
  const profileCardsColor = input.profileCardsColor ?? "default";
  const musicMood = input.musicMood ?? "ambient";

  return {
    nameColor,
    profilePanelColor,
    profileCardsColor,
    theme,
    background,
    musicMood,
    style: getThemeStyle(theme)
  };
}

export function getBadge(slug: BadgeSlug): CatalogBadge {
  const badge = badgeCatalog.find((item) => item.slug === slug);
  if (!badge) {
    throw new Error(`Unknown badge: ${slug}`);
  }

  return badge;
}

export function getEarlyMemberBadge(createdAt: string): CatalogBadge | null {
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime()) || created.getTime() >= Date.parse(EARLY_MEMBER_CUTOFF_DATE)) {
    return null;
  }

  return getBadge("early-member");
}

function hasReachedAnniversary(createdAt: string, years: number, now: Date) {
  const created = new Date(createdAt);
  if (Number.isNaN(created.getTime())) {
    return false;
  }

  const anniversary = new Date(created);
  anniversary.setUTCFullYear(anniversary.getUTCFullYear() + years);
  return now.getTime() >= anniversary.getTime();
}

export function getAccountAgeBadges(createdAt: string, now = new Date()): CatalogBadge[] {
  const badges: CatalogBadge[] = [];

  if (hasReachedAnniversary(createdAt, 1, now)) {
    badges.push(getBadge("one-year"));
  }

  if (hasReachedAnniversary(createdAt, 5, now)) {
    badges.push(getBadge("five-years"));
  }

  return badges;
}

export function getAccountAgeDays(createdAt: string, now = new Date()): number {
  const created = Date.parse(createdAt);
  if (Number.isNaN(created) || created > now.getTime()) {
    return 0;
  }

  return Math.floor((now.getTime() - created) / 86_400_000);
}

export function getPostMilestoneBadges(postCount: number): CatalogBadge[] {
  if (!Number.isInteger(postCount) || postCount < 1) {
    return [];
  }

  const badges = [getBadge("first-post")];
  if (postCount >= 100) {
    badges.push(getBadge("posts-100"));
  }
  if (postCount >= 1000) {
    badges.push(getBadge("posts-1000"));
  }
  if (postCount >= 10000) {
    badges.push(getBadge("posts-10000"));
  }

  return badges;
}

export function getCommentMilestoneBadges(commentCount: number): CatalogBadge[] {
  if (!Number.isInteger(commentCount) || commentCount < 1) {
    return [];
  }

  const badges = [getBadge("first-conversation")];
  if (commentCount >= demoBadgeThresholds.activeConversationalistComments) {
    badges.push(getBadge("active-conversationalist"));
  }
  if (commentCount >= demoBadgeThresholds.conversationRegularComments) {
    badges.push(getBadge("conversation-regular"));
  }

  return badges;
}

export function getFoundingMemberBadge(memberRank: number): CatalogBadge | null {
  return Number.isInteger(memberRank) && memberRank > 0 && memberRank <= FOUNDING_MEMBER_RANK_CUTOFF
    ? getBadge("founding-member")
    : null;
}

export function getEarlySupporterBadge(subscriberRank: number): CatalogBadge | null {
  return Number.isInteger(subscriberRank) && subscriberRank > 0 && subscriberRank <= EARLY_SUPPORTER_SUBSCRIBER_RANK_CUTOFF
    ? getBadge("early-supporter")
    : null;
}

export function getProfileBadges({
  createdAt,
  postCount,
  assignedBadgeSlugs = [],
  now = new Date()
}: {
  createdAt: string;
  postCount: number;
  assignedBadgeSlugs?: readonly BadgeSlug[];
  now?: Date;
}): CatalogBadge[] {
  const earnedSlugs = new Set<BadgeSlug>([
    ...assignedBadgeSlugs,
    ...(getEarlyMemberBadge(createdAt) ? ["early-member" as const] : []),
    ...getAccountAgeBadges(createdAt, now).map((badge) => badge.slug),
    ...getPostMilestoneBadges(postCount).map((badge) => badge.slug)
  ]);

  return badgeCatalog.filter((badge) => earnedSlugs.has(badge.slug));
}

export function isHealthyBadgeSystem() {
  return true;
}
