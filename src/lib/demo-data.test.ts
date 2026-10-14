import { describe, expect, it } from "vitest";
import { getDemoPrimaryBadge } from "./demo-data";

describe("demo navigation badges", () => {
  it("prioritizes the earned Founder badge for a founder account", () => {
    expect(getDemoPrimaryBadge("user-1")).toMatchObject({
      slug: "founder",
      category: "founder",
      icon: "founder-shield"
    });
  });

  it("uses an earned badge for accounts without the Founder badge", () => {
    expect(getDemoPrimaryBadge("user-2")).toMatchObject({
      slug: expect.any(String),
      category: expect.any(String),
      icon: expect.any(String)
    });
    expect(getDemoPrimaryBadge("user-2")?.slug).not.toBe("founder");
  });

  it("does not create a badge for an unknown account", () => {
    expect(getDemoPrimaryBadge("unknown-user")).toBeUndefined();
  });
});
