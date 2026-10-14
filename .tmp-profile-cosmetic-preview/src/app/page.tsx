import { demoBlocks, demoFollowing, demoPosts, demoUsers } from "@/lib/demo-data";
import { buildDiscoveryFeed } from "@/lib/discovery-rules";
import { getChronologicalFollowingFeed } from "@/lib/social-rules";
import { SocialShell } from "@/components/social-shell";

export default function HomePage() {
  const viewer = {
    id: "user-1",
    username: "calvinm",
    displayName: "Calvin M.",
    verified: true
  };

  const feed = getChronologicalFollowingFeed(demoPosts, {
    viewerId: viewer.id,
    followed: demoFollowing,
    blocks: demoBlocks,
    viewerVerified: viewer.verified
  });

  const discovery = buildDiscoveryFeed(
    demoPosts.map((post) => {
      const text = post.text ?? "";
      return {
        ...post,
        tags: [
          post.visibility === "everyone" ? "public" : post.visibility,
          post.authorId === "user-1" ? "social" : "community",
          text.toLowerCase().includes("community") ? "community" : "general"
        ]
      };
    }),
    {
      id: viewer.id,
      verified: viewer.verified,
      interests: ["community", "calm-internet", "design", "healthy-routines"]
    },
    {
      followed: demoFollowing,
      blocks: demoBlocks,
      limit: 4
    }
  ).map((post) => ({
    ...post,
    author: demoUsers.find((user) => user.id === post.authorId)
  }));

  const communityHighlights = [
    "Calm Communities",
    "Verified Circle",
    "Makers Lab"
  ];

  const timeline = feed.map((post) => ({
    ...post,
    text: post.text ?? "",
    contentType: post.id === "post-2" ? "photo" as const : post.id === "post-3" ? "long-form" as const : "text" as const,
    communityId: post.id === "post-3" ? "comm-3" : undefined,
    author: demoUsers.find((user) => user.id === post.authorId)
  }));

  return <SocialShell viewer={viewer} feed={timeline} discovery={discovery} followedUserIds={demoFollowing} />;
}
