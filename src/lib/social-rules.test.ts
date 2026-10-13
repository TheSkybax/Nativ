import { describe, expect, it } from "vitest";
import {
  canAccessProfile,
  canInteractWithUser,
  filterPostsForViewer,
  getChronologicalFollowingFeed,
  isBlockedPair
} from "./social-rules";

describe("social access rules", () => {
  it("blocks complete isolation between users", () => {
    expect(
      isBlockedPair("user-1", "user-2", new Set(["user-1:user-2"]))
    ).toBe(true);
    expect(
      isBlockedPair("user-2", "user-1", new Set(["user-1:user-2"]))
    ).toBe(true);
    expect(
      isBlockedPair("user-1", "user-3", new Set(["user-1:user-2"]))
    ).toBe(false);
  });

  it("prevents blocked users from seeing each other profiles", () => {
    const blocks = new Set(["user-1:user-2"]);

    expect(canAccessProfile("user-1", "user-2", blocks)).toBe(false);
    expect(canAccessProfile("user-2", "user-1", blocks)).toBe(false);
  });

  it("applies verified-only interaction controls", () => {
    expect(
      canInteractWithUser(
        { id: "viewer-1", verified: false },
        { id: "target-1", verified: true },
        "verified-only",
        new Set()
      )
    ).toBe(false);

    expect(
      canInteractWithUser(
        { id: "viewer-1", verified: true },
        { id: "target-1", verified: true },
        "verified-only",
        new Set()
      )
    ).toBe(true);
  });

  it("filters posts by visibility and block states", () => {
    const posts = [
      {
        id: "post-1",
        authorId: "user-1",
        visibility: "everyone",
        createdAt: "2024-01-01T00:00:00Z",
        isAd: false
      },
      {
        id: "post-2",
        authorId: "user-2",
        visibility: "verified-only",
        createdAt: "2024-01-02T00:00:00Z",
        isAd: false
      },
      {
        id: "post-3",
        authorId: "user-3",
        visibility: "followers",
        createdAt: "2024-01-03T00:00:00Z",
        isAd: false
      }
    ] as const;

    const viewer = { id: "viewer-1", verified: false };
    const followed = new Set(["user-1", "user-3"]);
    const blocks = new Set(["user-2:viewer-1"]);

    const visible = filterPostsForViewer(posts, viewer, { followed, blocks });

    expect(visible.map((post) => post.id)).toEqual(["post-3", "post-1"]);
  });

  it("keeps the Following feed chronological and free from ads", () => {
    const posts = [
      {
        id: "older",
        authorId: "user-1",
        visibility: "everyone",
        createdAt: "2024-01-01T00:00:00Z",
        isAd: false
      },
      {
        id: "ad-post",
        authorId: "user-9",
        visibility: "everyone",
        createdAt: "2024-01-04T00:00:00Z",
        isAd: true
      },
      {
        id: "newer",
        authorId: "user-2",
        visibility: "everyone",
        createdAt: "2024-01-03T00:00:00Z",
        isAd: false
      }
    ] as const;

    const feed = getChronologicalFollowingFeed(posts, {
      viewerId: "viewer-1",
      followed: new Set(["user-1", "user-2"]),
      blocks: new Set(),
      viewerVerified: false,
      showVerifiedOnly: false
    });

    expect(feed.map((post) => post.id)).toEqual(["older", "newer"]);
  });
});
