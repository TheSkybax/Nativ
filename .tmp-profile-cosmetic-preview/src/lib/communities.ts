export type CommunityCard = {
  id: string;
  slug: string;
  name: string;
  description: string;
  visibility: "public" | "private" | "restricted";
  members: number;
  verifiedOnly: boolean;
  moderatorCount: number;
  tags: string[];
};

export const demoCommunities: CommunityCard[] = [
  {
    id: "comm-1",
    slug: "calm-communities",
    name: "Calm Communities",
    description: "A place for thoughtful, low-pressure conversation and practical routines.",
    visibility: "public",
    members: 2043,
    verifiedOnly: false,
    moderatorCount: 8,
    tags: ["wellbeing", "slow living", "support"]
  },
  {
    id: "comm-2",
    slug: "verified-circle",
    name: "Verified Circle",
    description: "A trusted community where verified participation is encouraged for safety.",
    visibility: "restricted",
    members: 873,
    verifiedOnly: true,
    moderatorCount: 5,
    tags: ["verified", "safe spaces", "trust"]
  },
  {
    id: "comm-3",
    slug: "makers-lab",
    name: "Makers Lab",
    description: "Share practical experiments, thoughtful builds, and creative prototypes.",
    visibility: "public",
    members: 1512,
    verifiedOnly: false,
    moderatorCount: 7,
    tags: ["creativity", "projects", "learning"]
  }
];

export const demoCommunityPosts = [
  {
    id: "community-post-1",
    authorId: "user-1",
    communityId: "comm-1",
    createdAt: "2026-08-14T09:00:00Z",
    title: "What’s one small routine that made your week calmer?",
    body: "I started leaving my phone in another room during the first hour of the morning and it changed my energy more than I expected.",
    author: "Calvin M."
  },
  {
    id: "community-post-2",
    authorId: "user-2",
    communityId: "comm-2",
    createdAt: "2026-08-15T14:00:00Z",
    title: "How do you know a community feels safe?",
    body: "Trust is built by clear rules, predictable moderation, and user control over visibility.",
    author: "Dragonfire"
  },
  {
    id: "community-post-3",
    authorId: "user-3",
    communityId: "comm-3",
    createdAt: "2026-08-16T08:30:00Z",
    title: "Prototype drop: a calm-note-taking workflow",
    body: "Tiny personal systems are often more useful than huge productivity suites.",
    author: "Horizon"
  }
];
