import { describe, expect, it } from "vitest";
import {
  buildProfileCustomization,
  getAccountAgeBadge,
  getFounderBadge,
  getThemeStyle,
  isHealthyBadgeSystem
} from "./personalization";

describe("phase 2 personalization", () => {
  it("awards founder badges based on early membership thresholds", () => {
    expect(getFounderBadge(250)).toMatchObject({ slug: "founder-1000" });
    expect(getFounderBadge(12000)).toMatchObject({ slug: "founder-100000" });
    expect(getFounderBadge(100000)).toMatchObject({ slug: "founder-100000" });
  });

  it("awards cumulative account age badges instead of streaks", () => {
    const now = new Date("2026-08-18T00:00:00Z");
    expect(getAccountAgeBadge("2024-08-18T00:00:00Z", now)).toMatchObject({
      slug: "veteran"
    });
  });

  it("creates a profile customization package with user values", () => {
    const profile = buildProfileCustomization({
      nameColor: "sunset",
      theme: "aurora",
      background: "forest",
      musicMood: "ambient"
    });

    expect(profile.nameColor).toBe("sunset");
    expect(profile.theme).toBe("aurora");
    expect(profile.background).toBe("forest");
  });

  it("keeps badge mechanics healthy and non-addictive", () => {
    expect(isHealthyBadgeSystem()).toBe(true);
    expect(getThemeStyle("midnight")).toMatchObject({
      label: "Midnight"
    });
  });
});
