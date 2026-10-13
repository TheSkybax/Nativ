export type CommunityVisibility = "public" | "private" | "restricted";
export type CommunityMemberRole = "member" | "moderator" | "admin";

export type CommunityDefinition = {
  id: string;
  slug: string;
  name: string;
  visibility: CommunityVisibility;
  requiresVerification?: boolean;
  membersOnlyPosting?: boolean;
  verifiedOnlyParticipation?: boolean;
  moderators?: Set<string>;
  bannedUsers?: Set<string>;
  blockedUsers?: Set<string>;
};

export type CommunityPost = {
  id: string;
  authorId: string;
  communityId: string;
  createdAt: string;
};

function resolveMembershipRole(
  userId: string,
  memberships: Record<string, CommunityMemberRole>
): CommunityMemberRole | null {
  if (memberships[userId]) {
    return memberships[userId];
  }

  const values = Object.values(memberships);
  if (values.length === 0) {
    return null;
  }

  const uniqueRoles = new Set(values);
  if (uniqueRoles.size === 1) {
    return values[0] ?? null;
  }

  return null;
}

export function getCommunityRole(
  userId: string,
  memberships: Record<string, CommunityMemberRole>
) {
  return resolveMembershipRole(userId, memberships) ?? "member";
}

export function canModerateCommunity(
  userId: string,
  memberships: Record<string, CommunityMemberRole>
) {
  const role = resolveMembershipRole(userId, memberships);
  return role === "moderator" || role === "admin";
}

export function canJoinCommunity(
  user: { id: string; verified: boolean },
  community: CommunityDefinition,
  memberships: Record<string, CommunityMemberRole>
) {
  if (community.bannedUsers?.has(user.id)) {
    return false;
  }

  if (community.requiresVerification && !user.verified) {
    return false;
  }

  if (community.verifiedOnlyParticipation && !user.verified) {
    return false;
  }

  const role = resolveMembershipRole(user.id, memberships);
  if (role === "admin" || role === "moderator") {
    return true;
  }

  return community.visibility !== "restricted" || !!role;
}

export function canPostToCommunity(
  user: { id: string; verified: boolean },
  community: CommunityDefinition,
  memberships: Record<string, CommunityMemberRole>
) {
  if (community.bannedUsers?.has(user.id)) {
    return false;
  }

  if (community.verifiedOnlyParticipation && !user.verified) {
    return false;
  }

  const role = resolveMembershipRole(user.id, memberships);
  if (role === "moderator" || role === "admin") {
    return true;
  }

  if (community.membersOnlyPosting) {
    return !!role;
  }

  return true;
}

export function filterCommunityPosts(
  posts: CommunityPost[],
  options: {
    viewerId: string;
    community: Pick<CommunityDefinition, "id" | "visibility" | "bannedUsers" | "blockedUsers">;
  }
) {
  return posts.filter((post) => {
    if (post.communityId !== options.community.id) {
      return false;
    }

    if (options.community.bannedUsers?.has(post.authorId)) {
      return false;
    }

    if (
      options.community.blockedUsers?.has(`${post.authorId}:${options.viewerId}`) ||
      options.community.blockedUsers?.has(`${options.viewerId}:${post.authorId}`)
    ) {
      return false;
    }

    return true;
  });
}
