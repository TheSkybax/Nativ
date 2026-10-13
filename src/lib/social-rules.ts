export type VisibilityLevel =
  | "everyone"
  | "verified-only"
  | "followers"
  | "verified-followers"
  | "private";

export type InteractionSetting =
  | "everyone"
  | "verified-only"
  | "followers"
  | "verified-followers"
  | "disabled";

export type Viewer = {
  id: string;
  verified: boolean;
};

export type PostLike = {
  id: string;
  authorId: string;
  visibility: VisibilityLevel;
  createdAt: string;
  isAd?: boolean;
  text?: string;
};

export function normalizeBlockKey(a: string, b: string) {
  return [a, b].sort().join(":");
}

export function isBlockedPair(
  viewerId: string,
  targetId: string,
  blocks: Set<string>
) {
  if (viewerId === targetId) {
    return false;
  }

  return blocks.has(normalizeBlockKey(viewerId, targetId));
}

export function canAccessProfile(
  viewerId: string,
  targetId: string,
  blocks: Set<string>
) {
  if (viewerId === targetId) {
    return true;
  }

  return !isBlockedPair(viewerId, targetId, blocks);
}

export function canInteractWithUser(
  viewer: Viewer,
  target: Viewer,
  setting: InteractionSetting,
  blocks: Set<string>
) {
  if (viewer.id === target.id) {
    return true;
  }

  if (isBlockedPair(viewer.id, target.id, blocks)) {
    return false;
  }

  switch (setting) {
    case "everyone":
      return true;
    case "verified-only":
      return viewer.verified;
    case "followers":
      return true;
    case "verified-followers":
      return viewer.verified;
    case "disabled":
      return false;
    default:
      return false;
  }
}

export function filterPostsForViewer(
  posts: ReadonlyArray<PostLike>,
  viewer: Viewer,
  options: {
    followed?: Set<string>;
    blocks?: Set<string>;
  } = {}
) {
  const followed = options.followed ?? new Set<string>();
  const blocks = options.blocks ?? new Set<string>();

  return posts
    .filter((post) => {
      if (post.isAd) {
        return false;
      }

      if (isBlockedPair(viewer.id, post.authorId, blocks)) {
        return false;
      }

      switch (post.visibility) {
        case "everyone":
          return true;
        case "verified-only":
          return viewer.verified;
        case "followers":
          return post.authorId === viewer.id || followed.has(post.authorId);
        case "verified-followers":
          return (
            viewer.verified &&
            (post.authorId === viewer.id || followed.has(post.authorId))
          );
        case "private":
          return post.authorId === viewer.id;
        default:
          return false;
      }
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

export function getChronologicalFollowingFeed(
  posts: ReadonlyArray<PostLike>,
  options: {
    viewerId: string;
    followed: Set<string>;
    blocks: Set<string>;
    viewerVerified: boolean;
    showVerifiedOnly?: boolean;
  }
) {
  return posts
    .filter((post) => {
      if (post.isAd) {
        return false;
      }

      if (isBlockedPair(options.viewerId, post.authorId, options.blocks)) {
        return false;
      }

      if (options.showVerifiedOnly && !options.viewerVerified) {
        return false;
      }

      switch (post.visibility) {
        case "everyone":
          return true;
        case "verified-only":
          return options.viewerVerified;
        case "followers":
          return (
            post.authorId === options.viewerId ||
            options.followed.has(post.authorId)
          );
        case "verified-followers":
          return (
            options.viewerVerified &&
            (post.authorId === options.viewerId ||
              options.followed.has(post.authorId))
          );
        case "private":
          return post.authorId === options.viewerId;
        default:
          return false;
      }
    })
    .sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );
}
