import { describe, expect, it } from "vitest";
import {
  badgeCatalog,
  badgeEligibility,
  buildProfileCustomization,
  demoBadgeThresholds,
  EARLY_MEMBER_CUTOFF_DATE,
  getAccountAgeBadges,
  getEarlyMemberBadge,
  getEarlySupporterBadge,
  getFoundingMemberBadge,
  getCommentMilestoneBadges,
  getPostMilestoneBadges,
  getProfileBadges,
  getThemeStyle,
  isHealthyBadgeSystem,
  isProfileColorUnlocked,
  profileCardsColorOptions,
  profileHeaderBackgroundOptions,
  profileNameColorOptions,
  profilePanelColorOptions
} from "./personalization";

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
      swatch: "#ffffff"
    });
    expect(profileHeaderBackgroundOptions.every((option) => option.swatch.startsWith("linear-gradient("))).toBe(true);
    expect(profileHeaderBackgroundOptions.find((option) => option.value === "founder")?.unlockBadge).toBe("founder");
  });

  it("defaults profile colors and gates special palettes behind their matching badges", () => {
    const profile = buildProfileCustomization();
    expect(profile.profilePanelColor).toBe("default");
    expect(profile.profileCardsColor).toBe("default");
    expect(profileNameColorOptions.find((option) => option.value === "gold")?.unlockBadge).toBe("founder");
    expect(profilePanelColorOptions.find((option) => option.value === "midnight")?.unlockBadge).toBe("founding-member");
    expect(profileCardsColorOptions.find((option) => option.value === "plum")?.unlockBadge).toBe("early-supporter");

    const goldOption = profileNameColorOptions.find((option) => option.value === "gold");
    expect(goldOption && isProfileColorUnlocked(goldOption, [])).toBe(false);
    expect(goldOption && isProfileColorUnlocked(goldOption, ["founder"])).toBe(true);
    expect(isProfileColorUnlocked(profilePanelColorOptions[1], [])).toBe(true);
  });

  it("keeps badge mechanics healthy and non-addictive", () => {
    expect(isHealthyBadgeSystem()).toBe(true);
    expect(getThemeStyle("midnight")).toMatchObject({
      label: "Midnight"
    });
  });
});
