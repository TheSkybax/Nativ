import { describe, expect, it } from "vitest";
import {
  badgeCatalog,
  badgeEligibility,
  buildProfileCustomization,
  basicColorFamilies,
  demoBadgeThresholds,
  EARLY_MEMBER_CUTOFF_DATE,
  getAccountAgeDays,
  getAccountAgeBadges,
  getEarlyMemberBadge,
  getEarlySupporterBadge,
  getFoundingMemberBadge,
  getCommentMilestoneBadges,
  getPostMilestoneBadges,
  getProfileBadges,
  getLockedProfileBadges,
  getThemeStyle,
  getProfileCosmeticStatus,
  getVisibleProfileCosmeticOptions,
  isHealthyBadgeSystem,
  isDeveloperCosmeticsPreviewEnabled,
  isProfileColorUnlocked,
  type ProfileColorOption,
  profileCardsColorOptions,
  profileHeaderBackgroundOptions,
  profileNameColorOptions,
  profilePanelColorOptions
} from "./personalization";

const noCosmeticEligibility = {
  earnedBadgeSlugs: [],
  accountAgeDays: 0
} as const;

describe("phase 2 personalization", () => {
  it("defines stable unique badge IDs across all requested categories", () => {
    const slugs = badgeCatalog.map((badge) => badge.slug);
    expect(badgeCatalog).toHaveLength(22);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(badgeCatalog.map((badge) => badge.category))).toEqual(
      new Set(["membership", "posting", "conversation", "community", "prompt", "founder", "subscription"])
    );
    expect(Object.keys(badgeEligibility).sort()).toEqual([...slugs].sort());
    expect(badgeCatalog.some((badge) => /verif/i.test(`${badge.slug} ${badge.label}`))).toBe(false);
  });

  it("lists only unearned badges in the developer catalog", () => {
    const lockedBadges = getLockedProfileBadges(["founder", "one-year", "first-post"]);
    expect(lockedBadges.some((badge) => badge.slug === "founder")).toBe(false);
    expect(lockedBadges.some((badge) => badge.slug === "one-year")).toBe(false);
    expect(lockedBadges.some((badge) => badge.slug === "posts-100")).toBe(true);
  });

  it("uses the configured early-member date cutoff, not ordinary account age", () => {
    expect(getEarlyMemberBadge("2025-12-31T23:59:59Z")?.slug).toBe("early-member");
    expect(getEarlyMemberBadge(EARLY_MEMBER_CUTOFF_DATE)).toBeNull();
    expect(getEarlyMemberBadge("not-a-date")).toBeNull();
  });

  it("awards account-age milestones only after their full anniversaries", () => {
    expect(getAccountAgeBadges("2025-01-01T00:00:00Z", new Date("2025-12-31T23:59:59Z"))).toEqual([]);
    expect(getAccountAgeBadges("2025-01-01T00:00:00Z", new Date("2026-01-01T00:00:00Z")).map((badge) => badge.slug))
      .toEqual(["one-year"]);
    expect(getAccountAgeBadges("2021-01-01T00:00:00Z", new Date("2026-01-01T00:00:00Z")).map((badge) => badge.slug))
      .toEqual(["one-year", "five-years"]);
  });

  it("calculates non-negative full account-age days and handles invalid dates", () => {
    expect(getAccountAgeDays("2025-01-01T00:00:00Z", new Date("2025-01-02T23:59:59Z"))).toBe(1);
    expect(getAccountAgeDays("2025-01-03T00:00:00Z", new Date("2025-01-02T00:00:00Z"))).toBe(0);
    expect(getAccountAgeDays("not-a-date", new Date("2025-01-02T00:00:00Z"))).toBe(0);
  });

  it("awards cumulative post milestones from the supplied post count", () => {
    expect(getPostMilestoneBadges(0)).toEqual([]);
    expect(getPostMilestoneBadges(1.5)).toEqual([]);
    expect(getPostMilestoneBadges(99).map((badge) => badge.slug)).toEqual(["first-post"]);
    expect(getPostMilestoneBadges(100).map((badge) => badge.slug)).toEqual(["first-post", "posts-100"]);
    expect(getPostMilestoneBadges(10000).map((badge) => badge.slug)).toEqual([
      "first-post", "posts-100", "posts-1000", "posts-10000"
    ]);
  });

  it("uses documented configurable demo thresholds for comment milestones", () => {
    expect(demoBadgeThresholds.activeConversationalistComments).toBe(50);
    expect(demoBadgeThresholds.conversationRegularComments).toBe(250);
    expect(getCommentMilestoneBadges(49).map((badge) => badge.slug)).toEqual(["first-conversation"]);
    expect(getCommentMilestoneBadges(250).map((badge) => badge.slug)).toEqual([
      "first-conversation", "active-conversationalist", "conversation-regular"
    ]);
  });

  it("keeps founder designation separate from member and subscriber rank rules", () => {
    expect(badgeEligibility.founder.basis).toBe("manual-assignment");
    expect(getFoundingMemberBadge(1000)?.slug).toBe("founding-member");
    expect(getFoundingMemberBadge(1001)).toBeNull();
    expect(getFoundingMemberBadge(0)).toBeNull();
    expect(getEarlySupporterBadge(100)?.slug).toBe("early-supporter");
    expect(getEarlySupporterBadge(101)).toBeNull();
  });

  it("combines supported age/post rules with explicit demo assignments", () => {
    expect(getProfileBadges({
      createdAt: "2025-01-01T00:00:00Z",
      postCount: 1,
      assignedBadgeSlugs: ["founder", "first-prompt"],
      now: new Date("2026-02-01T00:00:00Z")
    }).map((badge) => badge.slug)).toEqual([
      "early-member", "one-year", "first-post", "first-prompt", "founder"
    ]);
  });

  it("creates a profile customization package with user values", () => {
    const profile = buildProfileCustomization({
      nameColor: "gold",
      profilePanelColor: "midnight",
      profileCardsColor: "plum",
      theme: "aurora",
      background: "forest",
      musicMood: "ambient"
    });

    expect(profile.nameColor).toBe("gold");
    expect(profile.profilePanelColor).toBe("midnight");
    expect(profile.profileCardsColor).toBe("plum");
    expect(profile.theme).toBe("aurora");
    expect(profile.background).toBe("forest");
  });

  it("uses the original white Nativ name color as the default option", () => {
    expect(buildProfileCustomization().nameColor).toBe("nativ");
    expect(buildProfileCustomization().background).toBe("forest");
    expect(profileNameColorOptions.find((option) => option.value === "nativ")).toMatchObject({
      label: "Nativ",
      treatment: "default"
    });
    expect(profileHeaderBackgroundOptions.find((option) => option.value === "founder")?.unlock).toEqual({
      method: "earned-badge",
      badgeSlug: "founder"
    });
  });

  it("exposes six named gradient header colors and six tint/solid panel families", () => {
    const expectedGradientNames = {
      red: "Crimson Current (Red Gradient)",
      orange: "Citrus Ember (Orange Gradient)",
      yellow: "Golden Hour (Yellow Gradient)",
      green: "Verdant Tide (Green Gradient)",
      blue: "Azure Drift (Blue Gradient)",
      purple: "Amethyst Haze (Purple Gradient)"
    } as const;
    for (const family of basicColorFamilies) {
      expect(profileHeaderBackgroundOptions.some((option) => option.value === `solid-${family}`)).toBe(false);
      expect(profileHeaderBackgroundOptions.find((option) => option.value === `gradient-${family}`)).toMatchObject({
        label: expectedGradientNames[family],
        treatment: "gradient"
      });
      expect(profilePanelColorOptions.some((option) => option.value === `${family}-tint` && option.treatment === "tint")).toBe(true);
      expect(profilePanelColorOptions.some((option) => option.value === `${family}-solid` && option.treatment === "solid")).toBe(true);
      expect(profileCardsColorOptions.some((option) => option.value === `${family}-tint` && option.treatment === "tint")).toBe(true);
      expect(profileCardsColorOptions.some((option) => option.value === `${family}-solid` && option.treatment === "solid")).toBe(true);
    }
    expect(profileHeaderBackgroundOptions.every((option) => option.treatment !== "solid")).toBe(true);
    const normalHeaderOptions = getVisibleProfileCosmeticOptions(profileHeaderBackgroundOptions, noCosmeticEligibility);
    for (const family of basicColorFamilies) {
      expect(normalHeaderOptions.some((option) => option.value === `gradient-${family}`)).toBe(true);
    }
    expect(profilePanelColorOptions.find((option) => option.value === "red-tint")?.label).toBe("Crimson Mist (Red Tint)");
    expect(profilePanelColorOptions.find((option) => option.value === "red-solid")?.label).toBe("Crimson Velvet (Red Solid)");
    expect(profileCardsColorOptions.find((option) => option.value === "blue-tint")?.label).toBe("Azure Mist (Blue Tint)");
    expect(profileCardsColorOptions.find((option) => option.value === "blue-solid")?.label).toBe("Azure Slate (Blue Solid)");
  });

  it("keeps alternative name colors earned-only and available only after eligibility", () => {
    expect(profileNameColorOptions.map((option) => option.value)).toEqual(["nativ", "gold", "sage"]);
    expect(getVisibleProfileCosmeticOptions(profileNameColorOptions, noCosmeticEligibility).map((option) => option.value))
      .toEqual(["nativ"]);
    expect(getVisibleProfileCosmeticOptions(profileNameColorOptions, { earnedBadgeSlugs: ["founder"], accountAgeDays: 0 }).map((option) => option.value))
      .toEqual(["nativ", "gold"]);
    expect(getVisibleProfileCosmeticOptions(profileNameColorOptions, { earnedBadgeSlugs: [], accountAgeDays: 365 }).map((option) => option.value))
      .toEqual(["nativ", "sage"]);
  });

  it("defaults profile colors and gates earned colors behind their matching badges", () => {
    const profile = buildProfileCustomization();
    expect(profile.profilePanelColor).toBe("default");
    expect(profile.profileCardsColor).toBe("default");
    expect(profileNameColorOptions.find((option) => option.value === "gold")?.unlock).toEqual({ method: "earned-badge", badgeSlug: "founder" });
    expect(profilePanelColorOptions.find((option) => option.value === "midnight")?.unlock).toEqual({ method: "earned-badge", badgeSlug: "founding-member" });
    expect(profileCardsColorOptions.find((option) => option.value === "plum")?.unlock).toEqual({ method: "earned-badge", badgeSlug: "early-supporter" });

    const goldOption = profileNameColorOptions.find((option) => option.value === "gold");
    expect(goldOption && isProfileColorUnlocked(goldOption, noCosmeticEligibility)).toBe(false);
    expect(goldOption && isProfileColorUnlocked(goldOption, { earnedBadgeSlugs: ["founder"], accountAgeDays: 0 })).toBe(true);
    expect(isProfileColorUnlocked(profilePanelColorOptions[1], noCosmeticEligibility)).toBe(true);
    expect(isProfileColorUnlocked(profilePanelColorOptions.find((option) => option.value === "midnight")!, { earnedBadgeSlugs: ["founding-member"], accountAgeDays: 0 })).toBe(true);
    expect(isProfileColorUnlocked(profileCardsColorOptions.find((option) => option.value === "plum")!, { earnedBadgeSlugs: ["early-supporter"], accountAgeDays: 0 })).toBe(true);
  });

  it("hides locked and unreleased entries in normal mode", () => {
    const founderGradient = profileHeaderBackgroundOptions.find((option) => option.value === "founder")!;
    const eventGradient = profileHeaderBackgroundOptions.find((option) => option.value === "gradient-event-preview")!;
    const foundingMidnight = profilePanelColorOptions.find((option) => option.value === "midnight")!;
    const supporterPlum = profileCardsColorOptions.find((option) => option.value === "plum")!;
    const unreleasedPromotion = profileCardsColorOptions.find((option) => option.value === "promotion-preview")!;
    expect(getProfileCosmeticStatus(founderGradient, noCosmeticEligibility)).toBe("locked");
    expect(getProfileCosmeticStatus(eventGradient, { ...noCosmeticEligibility, eligibleEventIds: ["nativ-launch"] })).toBe("unreleased");
    const eligibleForRelease = {
      ...noCosmeticEligibility,
      earnedBadgeSlugs: ["founding-member", "early-supporter"] as const,
      eligibleEventIds: ["nativ-launch"]
    };
    expect(getVisibleProfileCosmeticOptions(profileHeaderBackgroundOptions, eligibleForRelease)).not.toContain(founderGradient);
    expect(getVisibleProfileCosmeticOptions(profileHeaderBackgroundOptions, eligibleForRelease)).not.toContain(eventGradient);
    expect(getVisibleProfileCosmeticOptions(profilePanelColorOptions, noCosmeticEligibility)).not.toContain(foundingMidnight);
    expect(getVisibleProfileCosmeticOptions(profileCardsColorOptions, noCosmeticEligibility)).not.toContain(supporterPlum);
    expect(getVisibleProfileCosmeticOptions(profileCardsColorOptions, {
      ...eligibleForRelease,
      freePromotionGrantIds: ["community-thank-you"]
    })).not.toContain(unreleasedPromotion);
  });

  it("supports event, free-promotion, and account-age unlock metadata without granting eligibility", () => {
    const testOption = (unlock: NonNullable<ProfileColorOption<string>["unlock"]>) => ({
      value: "future-cosmetic",
      label: "Future cosmetic",
      swatch: "#000000",
      unlock
    });
    const eventOption = testOption({ method: "event-eligibility", eventId: "nativ-launch" });
    const promotionOption = testOption({ method: "free-promotion", grantId: "community-thank-you" });
    const ageOption = testOption({ method: "account-age", days: 365 });

    expect(getProfileCosmeticStatus(eventOption, noCosmeticEligibility)).toBe("locked");
    expect(getProfileCosmeticStatus(eventOption, { ...noCosmeticEligibility, eligibleEventIds: ["nativ-launch"] })).toBe("available");
    expect(getProfileCosmeticStatus(promotionOption, noCosmeticEligibility)).toBe("locked");
    expect(getProfileCosmeticStatus(promotionOption, { ...noCosmeticEligibility, freePromotionGrantIds: ["community-thank-you"] })).toBe("available");
    expect(getProfileCosmeticStatus(ageOption, { ...noCosmeticEligibility, accountAgeDays: 364 })).toBe("locked");
    expect(getProfileCosmeticStatus(ageOption, { ...noCosmeticEligibility, accountAgeDays: 365 })).toBe("available");
  });

  it("shows locked and unreleased options only in the temporary catalog preview without changing rewards", () => {
    const ownerEligibility = { ...noCosmeticEligibility, earnedBadgeSlugs: ["first-post"] as const };
    const optionsIncludingHidden = getVisibleProfileCosmeticOptions(profileHeaderBackgroundOptions, ownerEligibility, true);
    const founderOption = optionsIncludingHidden.find((option) => option.value === "founder")!;
    const unreleasedOption = optionsIncludingHidden.find((option) => option.value === "gradient-event-preview")!;

    expect(optionsIncludingHidden).toContain(founderOption);
    expect(optionsIncludingHidden).toContain(unreleasedOption);
    expect(getProfileCosmeticStatus(founderOption, ownerEligibility)).toBe("locked");
    expect(getProfileCosmeticStatus(unreleasedOption, ownerEligibility)).toBe("unreleased");
    expect(ownerEligibility.earnedBadgeSlugs).toEqual(["first-post"]);
    expect(isProfileColorUnlocked(founderOption, ownerEligibility)).toBe(false);
  });

  it("requires an explicit development-only environment flag for the catalog preview", () => {
    expect(isDeveloperCosmeticsPreviewEnabled("development", "1")).toBe(true);
    expect(isDeveloperCosmeticsPreviewEnabled("development", undefined)).toBe(false);
    expect(isDeveloperCosmeticsPreviewEnabled("production", "1")).toBe(false);
  });

  it("keeps defaults available in their catalogs", () => {
    const defaults = buildProfileCustomization();
    expect(isProfileColorUnlocked(profileNameColorOptions.find((option) => option.value === defaults.nameColor)!, noCosmeticEligibility)).toBe(true);
    expect(isProfileColorUnlocked(profileHeaderBackgroundOptions.find((option) => option.value === defaults.background)!, noCosmeticEligibility)).toBe(true);
    expect(isProfileColorUnlocked(profilePanelColorOptions.find((option) => option.value === defaults.profilePanelColor)!, noCosmeticEligibility)).toBe(true);
    expect(isProfileColorUnlocked(profileCardsColorOptions.find((option) => option.value === defaults.profileCardsColor)!, noCosmeticEligibility)).toBe(true);
  });

  it("keeps badge mechanics healthy and non-addictive", () => {
    expect(isHealthyBadgeSystem()).toBe(true);
    expect(getThemeStyle("midnight")).toMatchObject({
      label: "Midnight"
    });
  });
});
