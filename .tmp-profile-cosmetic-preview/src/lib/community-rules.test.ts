import { describe, expect, it } from "vitest";
import {
  canJoinCommunity,
  canModerateCommunity,
  canPostToCommunity,
  filterCommunityPosts,
  type CommunityDefinition,
  type CommunityMemberRole
} from "./community-rules";

describe("phase 3 communities", () => {
  const community: CommunityDefinition = {
    id: "c-1",
    slug: "calm-communities",
    name: "Calm Communities",
    visibility: "public",
    requiresVerification: false,
    membersOnlyPosting: false,
    verifiedOnlyParticipation: false,
    moderators: new Set(["user-1"]),
    bannedUsers: new Set(),
    blockedUsers: new Set()
  };

  it("allows public communities and moderator actions", () => {
    expect(
      canJoinCommunity(
        { id: "user-2", verified: false },
        community,
        {} as Record<string, CommunityMemberRole>
      )
    ).toBe(true);

    expect(
      canModerateCommunity("user-1", { "c-1": "moderator" })
    ).toBe(true);
    expect(
      canModerateCommunity("user-2", { "c-1": "member" })
    ).toBe(false);
  });

  it("prevents unverified users from joining verified-only communities", () => {
    const verifiedCommunity: CommunityDefinition = {
      ...community,
      id: "c-2",
      name: "Verified Circle",
      requiresVerification: true,
      verifiedOnlyParticipation: true
    };

    expect(
      canJoinCommunity(
        { id: "user-3", verified: false },
        verifiedCommunity,
        {}
      )
    ).toBe(false);

    expect(
      canJoinCommunity(
        { id: "user-4", verified: true },
        verifiedCommunity,
        {}
      )
    ).toBe(true);
  });

  it("allows moderators to post and members to post only when allowed", () => {
    expect(
      canPostToCommunity(
        { id: "user-1", verified: true },
        community,
        { "c-1": "moderator" }
      )
    ).toBe(true);

    expect(
      canPostToCommunity(
        { id: "user-2", verified: false },
        community,
        { "c-1": "member" }
      )
    ).toBe(true);

    const restrictedCommunity: CommunityDefinition = {
      ...community,
      membersOnlyPosting: true
    };

    expect(
      canPostToCommunity(
        { id: "new-user", verified: false },
        restrictedCommunity,
        { "c-1": "member" }
      )
    ).toBe(true);

    expect(
      canPostToCommunity(
        { id: "new-user", verified: false },
        restrictedCommunity,
        {}
      )
    ).toBe(false);
  });

  it("filters community posts and blocks banned users", () => {
    const posts = [
      { id: "p-1", authorId: "user-1", communityId: "c-1", createdAt: "2026-08-01T00:00:00Z" },
      { id: "p-2", authorId: "user-9", communityId: "c-1", createdAt: "2026-08-02T00:00:00Z" },
      { id: "p-3", authorId: "user-3", communityId: "c-1", createdAt: "2026-08-03T00:00:00Z" }
    ];

    const filtered = filterCommunityPosts(posts, {
      viewerId: "user-2",
      community: {
        id: "c-1",
        visibility: "public",
        bannedUsers: new Set(["user-9"]),
        blockedUsers: new Set(["user-3:user-2"])
      }
    });

    expect(filtered.map((post) => post.id)).toEqual(["p-1"]);
  });
});
