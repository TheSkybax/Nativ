import { describe, expect, it } from "vitest";
import { BadgeIcon } from "./badge-icon";
import { badgeCatalog } from "../lib/personalization";

describe("profile badge icons", () => {
  it("renders a distinct inline SVG for every catalog badge", () => {
    const icons = badgeCatalog.map((badge) =>
      BadgeIcon({ icon: badge.icon, category: badge.category })
    );

    expect(icons).toHaveLength(badgeCatalog.length);
    expect(icons.every((svg) => svg.type === "svg")).toBe(true);
    expect(icons.every((svg) => svg.props.className.includes("badge-icon--"))).toBe(true);
    expect(new Set(icons.map((svg) => svg.props.children)).size).toBe(badgeCatalog.length);
  });
});
