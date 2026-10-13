export const demoUsers = [
  {
    id: "user-1",
    username: "calvinm",
    displayName: "Calvin M.",
    verified: true,
    bio: "Photographer, maker, and weekend walker.",
    avatar: "CM",
    createdAt: "2024-08-18T00:00:00Z"
  },
  {
    id: "user-2",
    username: "dragonfire",
    displayName: "Dragonfire",
    verified: false,
    bio: "Adventure, photography, and better routines.",
    avatar: "DF",
    createdAt: "2025-01-10T00:00:00Z"
  },
  {
    id: "user-3",
    username: "horizon",
    displayName: "Horizon",
    verified: true,
    bio: "Community first, always.",
    avatar: "HO",
    createdAt: "2023-06-02T00:00:00Z"
  },
  {
    id: "user-9",
    username: "sponsorbot",
    displayName: "Sponsored",
    verified: false,
    bio: "Essential ad placement",
    avatar: "SP",
    createdAt: "2025-04-20T00:00:00Z"
  }
];

export const demoProfileCustomization = {
  theme: "aurora",
  background: "forest",
  nameColor: "sunset",
  musicMood: "ambient"
} as const;

export const demoBadges = [
  { slug: "founder-1000", label: "Founder", description: "One of the first 1,000 users" },
  { slug: "veteran", label: "Veteran", description: "Account age badge" },
  { slug: "contributor", label: "Contributor", description: "Helpful participation" },
  { slug: "creator", label: "Creator", description: "Long-form participation" }
];

export const demoFollowing = new Set(["user-1", "user-2", "user-3"]);
export const demoBlocks = new Set<string>();

export const demoPosts = [
  {
    id: "post-1",
    authorId: "user-1",
    visibility: "everyone",
    createdAt: "2024-02-10T10:00:00Z",
    isAd: false,
    text: "A better social platform should help people leave feeling better, not more drained.",
    author: demoUsers[0]
  },
  {
    id: "post-2",
    authorId: "user-2",
    visibility: "followers",
    createdAt: "2024-02-11T11:00:00Z",
    isAd: false,
    text: "Morning hike complete. Proof that slower routines can be more energizing than endless feeds.",
    author: demoUsers[1]
  },
  {
    id: "post-3",
    authorId: "user-3",
    visibility: "verified-only",
    createdAt: "2024-02-12T09:00:00Z",
    isAd: false,
    text: "Verified communities should help people feel safe, not performative.",
    author: demoUsers[2]
  },
  {
    id: "post-4",
    authorId: "user-9",
    visibility: "everyone",
    createdAt: "2024-02-13T14:00:00Z",
    isAd: true,
    text: "Sponsored: discover a smarter way to run your creative workflow.",
    author: demoUsers[3]
  }
] as const;

export const demoDiscoveryPosts = [
  {
    id: "discovery-post-1",
    authorId: "user-4",
    visibility: "everyone",
    createdAt: "2026-08-18T13:00:00Z",
    isAd: false,
    text: "A photo walk through the old market district: six frames, one good conversation, and a reminder to look up.",
    tags: ["photography", "community"],
    author: {
      id: "user-4",
      username: "fieldnotes",
      displayName: "Field Notes",
      verified: false,
      avatar: "FN"
    }
  },
  {
    id: "discovery-post-2",
    authorId: "user-5",
    visibility: "everyone",
    createdAt: "2026-08-18T11:30:00Z",
    isAd: false,
    text: "What are you making this weekend? Sharing works in progress is more interesting than waiting for perfect results.",
    tags: ["makers-lab", "art", "community"],
    author: {
      id: "user-5",
      username: "studionorth",
      displayName: "Studio North",
      verified: true,
      avatar: "SN"
    }
  },
  {
    id: "discovery-post-3",
    authorId: "user-6",
    visibility: "everyone",
    createdAt: "2026-08-18T10:15:00Z",
    isAd: false,
    text: "A tiny open-source tool for neighborhood groups is looking for early testers.",
    tags: ["technology", "open-source", "local-groups"],
    author: {
      id: "user-6",
      username: "horizon-labs",
      displayName: "Horizon Labs",
      verified: false,
      avatar: "HL"
    }
  }
] as const;
