import { SocialShell } from "@/components/social-shell";
import { demoBlocks, demoDiscoveryPosts, demoFollowing, demoPosts, demoUsers } from "@/lib/demo-data";
import { buildDiscoveryFeed } from "@/lib/discovery-rules";

export default function DiscoveryPage() {
  const viewer = {
    id: "user-1",
    verified: true,
    interests: ["community", "calm-internet", "design", "healthy-routines"]
  };

  const rankedPosts = buildDiscoveryFeed(
    [...demoPosts, ...demoDiscoveryPosts].map((post) => {
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
    viewer,
    {
      followed: demoFollowing,
      blocks: demoBlocks,
      limit: 6
    }
  );

  const posts = rankedPosts.map((post) => ({
    ...post,
    author: demoUsers.find((user) => user.id === post.authorId)
  }));

  return (
    <SocialShell
      viewer={{ id: viewer.id, username: "calvinm", displayName: "Calvin M.", verified: viewer.verified }}
      feed={posts}
      discovery={posts}
      mode="discovery"
    />
  );
}
