"use client";

import { useEffect, useRef, useState } from "react";
import { FeedPostCard, type FeedPost } from "./feed-post-card";

export function DiscoveryFeed({ posts }: { posts: FeedPost[] }) {
  const [visibleCount, setVisibleCount] = useState(3);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const visiblePosts = Array.from({ length: visibleCount }, (_, index) => posts[index % posts.length]);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisibleCount((count) => count + 3);
        }
      },
      { rootMargin: "240px" }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  if (posts.length === 0) {
    return <div className="empty-state">No recommendations yet.</div>;
  }

  return (
    <div className="feed-stack">
      {visiblePosts.map((post, index) => (
        <FeedPostCard
          key={`${post.id}-${index}`}
          post={post}
          showDiscoveryScore
        />
      ))}
      <div ref={loadMoreRef} className="load-more-status" aria-live="polite">
        Loading more recommendations...
      </div>
    </div>
  );
}
