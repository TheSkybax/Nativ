import { describe, expect, it } from "vitest";
import { buildDiscoveryFeed } from "./discovery-rules";

describe("discovery ranking", () => {
  it("prioritizes interest-aligned content and keeps ads lower than organic posts", () => {
    const posts = [
      {
        id: "post-community",
        authorId: "user-3",
        visibility: "everyone",
        createdAt: "2026-08-18T09:00:00Z",
        isAd: false,
        text: "Our community-first approach helps people feel more connected without burnout.",
        tags: ["community", "calm-internet"]
      },
      {
        id: "post-travel",
        authorId: "user-2",
        visibility: "everyone",
        createdAt: "2026-08-16T09:00:00Z",
        isAd: false,
        text: "A weekend trip and some sunlit reflections.",
        tags: ["travel"]
      },
      {
        id: "post-ad",
        authorId: "user-9",
        visibility: "everyone",
        createdAt: "2026-08-18T12:00:00Z",
        isAd: true,
        text: "Sponsored: a new productivity tool for creators.",
        tags: ["productivity"]
      }
    ] as const;

    const discovery = buildDiscoveryFeed(posts, {
      id: "viewer-1",
      verified: true,
      interests: ["community", "calm-internet"]
    }, {
      followed: new Set(),
      blocks: new Set(),
      limit: 5
    });

    expect(discovery[0]?.id).toBe("post-community");
    expect(discovery[discovery.length - 1]?.id).toBe("post-ad");
  });

  it("filters blocked and private posts while preserving diverse recommendations", () => {
    const posts = [
      {
        id: "post-private",
        authorId: "user-4",
        visibility: "private",
        createdAt: "2026-08-18T11:00:00Z",
        isAd: false,
        text: "Only visible to the author.",
        tags: ["personal"]
      },
      {
        id: "post-blocked",
        authorId: "user-5",
        visibility: "everyone",
        createdAt: "2026-08-17T11:00:00Z",
        isAd: false,
        text: "Blocked user content.",
        tags: ["community"]
      },
      {
        id: "post-diverse",
        authorId: "user-6",
        visibility: "everyone",
        createdAt: "2026-08-18T08:00:00Z",
        isAd: false,
        text: "Thoughtful ways to design kinder online spaces.",
        tags: ["design", "community"]
      }
    ] as const;

    const discovery = buildDiscoveryFeed(posts, {
      id: "viewer-1",
      verified: false,
      interests: ["community", "design"]
    }, {
      followed: new Set(),
      blocks: new Set(["user-5:viewer-1"]),
      limit: 10
    });

    expect(discovery.map((post) => post.id)).toEqual(["post-diverse"]);
  });
});
