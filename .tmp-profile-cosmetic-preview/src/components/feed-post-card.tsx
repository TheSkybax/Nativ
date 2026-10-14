"use client";

import Link from "next/link";
import { useState } from "react";
import type { ReactNode } from "react";

export type FeedPost = {
  id: string;
  authorId: string;
  text?: string;
  createdAt: string;
  visibility: string;
  isAd?: boolean;
  author?: {
    displayName?: string;
    username?: string;
    verified?: boolean;
    avatar?: string;
  };
  discoveryScore?: number;
  contentType?: "text" | "photo" | "video" | "long-form" | "poll";
  communityId?: string;
  repostedBy?: { id: string; displayName: string; avatar: string };
  originalPost?: FeedPost;
  // Reposts reference the original post; its visibility remains authoritative.
  originalVisibility?: string;
};

type MockComment = {
  id: string;
  userId: string;
  displayName: string;
  username: string;
  avatar: string;
  text: string;
};

const commentsByPost: Record<string, MockComment[]> = {
  "post-1": [
    { id: "comment-1", userId: "user-2", displayName: "Dragonfire", username: "dragonfire", avatar: "DF", text: "That's actually really interesting." },
    { id: "comment-2", userId: "user-3", displayName: "Horizon", username: "horizon", avatar: "HO", text: "I was thinking the exact same thing." }
  ],
  "post-2": [
    { id: "comment-3", userId: "user-3", displayName: "Horizon", username: "horizon", avatar: "HO", text: "That sounds like a great reset." }
  ],
  "post-3": [
    { id: "comment-4", userId: "user-2", displayName: "Dragonfire", username: "dragonfire", avatar: "DF", text: "Clear rules make such a difference." },
    { id: "comment-5", userId: "user-1", displayName: "Calvin M.", username: "calvinm", avatar: "CM", text: "Exactly. Trust needs something people can see." }
  ]
};

export function FeedPostCard({
  post,
  footer,
  showDiscoveryScore = false,
  onRepost,
  canRepost = true
}: {
  post: FeedPost;
  footer?: ReactNode;
  showDiscoveryScore?: boolean;
  onRepost?: (post: FeedPost) => void;
  canRepost?: boolean;
}) {
  const [liked, setLiked] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<MockComment[]>(commentsByPost[post.id] ?? []);
  const [reposted, setReposted] = useState(false);

  function submitComment() {
    if (!comment.trim()) return;
    setComments((current) => [...current, {
      id: `comment-${Date.now()}`,
      userId: "user-1",
      displayName: "Calvin M.",
      username: "calvinm",
      avatar: "CM",
      text: comment.trim()
    }]);
    setComment("");
  }

  const timestamp = new Date(post.createdAt).toLocaleString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });

  if (post.repostedBy && post.originalPost) {
    return (
      <article className="post-card repost-card">
        <p className="repost-label"><span className="repost-icon" aria-hidden="true">↻</span> {post.repostedBy.displayName} shared this post</p>
        <div className="repost-nested-card">
          <FeedPostCard post={post.originalPost} showDiscoveryScore={showDiscoveryScore} onRepost={onRepost} canRepost={false} />
        </div>
      </article>
    );
  }

  return (
    <article className="post-card">
      {post.isAd ? <span className="sponsored-tag">Sponsored</span> : null}
      <div className="post-head">
        <Link href={`/profile?user=${post.authorId}`} className="avatar-link" aria-label={`View ${post.author?.displayName ?? "user"}'s profile`}>
          <div className="avatar">{post.author?.avatar ?? "NA"}</div>
        </Link>
        <div>
          <h3>
            <Link className="post-author-link" href={`/profile?user=${post.authorId}`}>
              {post.author?.displayName ?? "Community member"}
            </Link>
            {post.author?.verified ? <span className="verified-badge">✓</span> : null}
          </h3>
          <p className="post-timestamp">{timestamp}</p>
        </div>
        <span className="visibility-tag">{post.visibility}</span>
      </div>

      <p className="post-body">{post.text}</p>

      {showDiscoveryScore && post.discoveryScore !== undefined ? (
        <p className="post-context">Recommended for your interests</p>
      ) : null}

      <div className="post-meta">
        <button className={`post-action like-action ${liked ? "liked" : ""}`} type="button" onClick={() => setLiked((value) => !value)} aria-pressed={liked}><span aria-hidden="true">{liked ? "♥" : "♡"}</span> {12 + (liked ? 1 : 0)}</button>
        <button className={`post-action ${commenting ? "active" : ""}`} type="button" onClick={() => setCommenting((value) => !value)} aria-expanded={commenting}>💬 {comments.length}</button>
        {canRepost ? <button className={`post-action ${reposted ? "active" : ""}`} type="button" disabled={reposted} onClick={() => { setReposted(true); onRepost?.(post); }}>{reposted ? "✓ Reposted" : "↻ Repost"}</button> : null}
      </div>
      {commenting ? (
        <div className="comments-section">
          <div className="comment-box">
            <input value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Write a comment..." aria-label="Write a comment" />
            <button className="text-button" type="button" onClick={submitComment}>Post</button>
          </div>
          <div className="comment-list">
            {comments.map((item) => (
              <div key={item.id} className="comment-item">
                <Link href={`/profile?user=${item.userId}`} className="avatar-link" aria-label={`View ${item.displayName}'s profile`}>
                  <div className="mini-avatar">{item.avatar}</div>
                </Link>
                <div>
                  <Link className="comment-author" href={`/profile?user=${item.userId}`}>{item.displayName}</Link>
                  <Link className="muted comment-username" href={`/profile?user=${item.userId}`}>@{item.username}</Link>
                  <p>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      {footer}
    </article>
  );
}
