import { NextResponse } from "next/server";
import { demoBlocks, demoFollowing, demoPosts } from "@/lib/demo-data";
import { buildDiscoveryFeed } from "@/lib/discovery-rules";
import { getChronologicalFollowingFeed } from "@/lib/social-rules";

export async function GET() {
  const viewer = { id: "user-1", verified: true };

  const following = getChronologicalFollowingFeed(demoPosts, {
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
  );

  return NextResponse.json({
    viewer,
    following,
    discovery
  });
}
