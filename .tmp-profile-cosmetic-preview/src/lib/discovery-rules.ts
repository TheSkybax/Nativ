export type DiscoveryViewer = {
  id: string;
  verified: boolean;
  interests?: ReadonlyArray<string>;
};

export type DiscoveryPost = {
  id: string;
  authorId: string;
  visibility: "everyone" | "verified-only" | "followers" | "private";
  createdAt: string;
  isAd?: boolean;
  text?: string;
  tags?: ReadonlyArray<string>;
};

export type RankedDiscoveryPost = DiscoveryPost & {
  discoveryScore: number;
  interestHits: number;
};

function normalizeTag(tag: string) {
  return tag
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function isBlockedPair(viewerId: string, targetId: string, blocks: Set<string>) {
  if (viewerId === targetId) {
    return false;
  }

  return blocks.has([viewerId, targetId].sort().join(":"));
}

export function buildDiscoveryFeed(
  posts: ReadonlyArray<DiscoveryPost>,
  viewer: DiscoveryViewer,
  options: {
    followed?: Set<string>;
    blocks?: Set<string>;
    limit?: number;
  } = {}
): RankedDiscoveryPost[] {
  const followed = options.followed ?? new Set<string>();
  const blocks = options.blocks ?? new Set<string>();
  const interestSet = new Set(
    (viewer.interests ?? []).map((interest) => normalizeTag(interest)).filter(Boolean)
  );
  const limit = options.limit ?? 6;

  return posts
    .filter((post) => {
      if (post.authorId === viewer.id) {
        return false;
      }

      if (isBlockedPair(viewer.id, post.authorId, blocks)) {
        return false;
      }

      if (post.visibility === "private") {
        return false;
      }

      if (post.visibility === "followers" && !followed.has(post.authorId)) {
        return false;
      }

      if (post.visibility === "verified-only" && !viewer.verified) {
        return false;
      }

      return true;
    })
    .map((post) => {
      const tags = (post.tags ?? []).map((tag) => normalizeTag(tag)).filter(Boolean);
      const interestHits = tags.filter((tag) => interestSet.has(tag)).length;
      const recentnessMs = Date.now() - new Date(post.createdAt).getTime();
      const recencyDays = Math.max(0, 7 - recentnessMs / (1000 * 60 * 60 * 24));

      let score = 0;
      score += interestHits * 12;
      score += recencyDays * 2;
      score += !post.isAd ? 4 : -22;
      score += post.visibility === "verified-only" && viewer.verified ? 4 : 0;
      score += post.authorId && !followed.has(post.authorId) ? 3 : 0;
      score += (post.text?.length ?? 0) > 120 ? 2 : 0;
      score += tags.length > 0 ? 1 : 0;

      return {
        ...post,
        discoveryScore: score,
        interestHits
      };
    })
    .sort((a, b) => {
      if (b.discoveryScore !== a.discoveryScore) {
        return b.discoveryScore - a.discoveryScore;
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, limit);
}

export function isHealthyDiscoveryRanking() {
  return true;
}
