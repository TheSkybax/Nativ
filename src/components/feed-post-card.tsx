"use client";

import Link from "next/link";
import { useState } from "react";
import type { ReactNode } from "react";
import { useProfileAppearance } from "@/components/profile-appearance-provider";
import { profileNameColorStyles } from "@/lib/personalization";
import { getPopularTagSuggestions } from "@/lib/post-tag-suggestions";
import { usePostMutations } from "./post-mutations-provider";
import { VerifiedSeal } from "./verified-seal";

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
  tags?: readonly string[];
  communityId?: string;
  repostedBy?: { id: string; displayName: string; avatar: string; verified?: boolean };
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
  verified: boolean;
};

const commentsByPost: Record<string, MockComment[]> = {
  "post-1": [
    { id: "comment-1", userId: "user-2", displayName: "Dragonfire", username: "dragonfire", avatar: "DF", text: "That's actually really interesting.", verified: false },
    { id: "comment-2", userId: "user-3", displayName: "Horizon", username: "horizon", avatar: "HO", text: "I was thinking the exact same thing.", verified: true }
  ],
  "post-2": [
    { id: "comment-3", userId: "user-3", displayName: "Horizon", username: "horizon", avatar: "HO", text: "That sounds like a great reset.", verified: true }
  ],
  "post-3": [
    { id: "comment-4", userId: "user-2", displayName: "Dragonfire", username: "dragonfire", avatar: "DF", text: "Clear rules make such a difference.", verified: false },
    { id: "comment-5", userId: "user-1", displayName: "Calvin M.", username: "calvinm", avatar: "CM", text: "Exactly. Trust needs something people can see.", verified: true }
  ]
};

export function FeedPostCard({
  post,
  footer,
  showDiscoveryScore = false,
  onRepost,
  canRepost = true,
  viewerId
}: {
  post: FeedPost;
  footer?: ReactNode;
  showDiscoveryScore?: boolean;
  onRepost?: (post: FeedPost) => void;
  canRepost?: boolean;
  viewerId?: string;
}) {
  const { nameColor } = useProfileAppearance();
  const { resolvePost, isDeleted, updatePost, deletePost } = usePostMutations();
  const currentPost = resolvePost(post);
  const [liked, setLiked] = useState(false);
  const [commenting, setCommenting] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<MockComment[]>(commentsByPost[post.id] ?? []);
  const [reposted, setReposted] = useState(false);
  const [editing, setEditing] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [draftText, setDraftText] = useState(currentPost.text ?? "");
  const [draftTags, setDraftTags] = useState((currentPost.tags ?? []).join(", "));
  const [draftVisibility, setDraftVisibility] = useState(currentPost.visibility);
  const isAuthor = viewerId !== undefined && currentPost.authorId === viewerId;
  const suggestedTags = getPopularTagSuggestions(draftText);
  const selectedDraftTags = draftTags.split(",").map((tag) => tag.trim().replace(/^#/, "")).filter(Boolean);

  if (isDeleted(currentPost.id)) {
    return null;
  }

  function startEditing() {
    setDraftText(currentPost.text ?? "");
    setDraftTags((currentPost.tags ?? []).join(", "));
    setDraftVisibility(currentPost.visibility);
    setEditing(true);
    setConfirmingDelete(false);
  }

  function savePost() {
    const tags = [...new Set(draftTags.split(",").map((tag) => tag.trim().replace(/^#/, "")).filter(Boolean))];
    updatePost(currentPost.id, {
      text: draftText.trim(),
      tags,
      visibility: draftVisibility
    });
    setEditing(false);
  }

  function toggleSuggestedTag(tag: string) {
    const selected = new Set(selectedDraftTags);
    if (selected.has(tag)) {
      selected.delete(tag);
    } else {
      selected.add(tag);
    }
    setDraftTags([...selected].join(", "));
  }

  function submitComment() {
    if (!comment.trim()) return;
    setComments((current) => [...current, {
      id: `comment-${Date.now()}`,
      userId: viewerId ?? "user-1",
      displayName: "Calvin M.",
      username: "calvinm",
      avatar: "CM",
      text: comment.trim(),
      verified: true
    }]);
    setComment("");
  }

  if (currentPost.repostedBy && currentPost.originalPost) {
    return (
      <article className="post-card repost-card">
        <div className="post-topline">
          <p className="repost-label">
            <span className="repost-icon" aria-hidden="true">↻</span>{" "}
            <span style={currentPost.repostedBy.id === viewerId ? { color: profileNameColorStyles[nameColor] } : undefined}>
              {currentPost.repostedBy.displayName}
            </span>
            {currentPost.repostedBy.id === viewerId && currentPost.repostedBy.verified ? <VerifiedSeal className="post-verified-seal" /> : null}
            {" "}shared this post
          </p>
        {isAuthor ? (
          <div className="post-owner-actions post-owner-actions-top">
            {confirmingDelete ? (
              <>
                <span>Delete this repost?</span>
                <button type="button" onClick={() => deletePost(currentPost.id)}>Delete</button>
                <button type="button" onClick={() => setConfirmingDelete(false)}>Cancel</button>
              </>
            ) : (
              <button type="button" onClick={() => setConfirmingDelete(true)}>Delete repost</button>
            )}
          </div>
        ) : null}
        </div>
        <div className="repost-nested-card">
          <FeedPostCard post={currentPost.originalPost} showDiscoveryScore={showDiscoveryScore} onRepost={onRepost} canRepost={false} viewerId={viewerId} />
        </div>
      </article>
    );
  }

  return (
    <article className="post-card">
      {currentPost.isAd ? <span className="sponsored-tag">Sponsored</span> : null}
      <div className="post-head">
        <Link href={`/profile?user=${currentPost.authorId}`} className="avatar-link" aria-label={`View ${currentPost.author?.displayName ?? "user"}'s profile`}>
          <div className="avatar">{currentPost.author?.avatar ?? "NA"}</div>
        </Link>
        <div>
          <h3>
            <Link className="post-author-link" href={`/profile?user=${currentPost.authorId}`}>
              <span style={currentPost.authorId === viewerId ? { color: profileNameColorStyles[nameColor] } : undefined}>
                {currentPost.author?.displayName ?? "Community member"}
              </span>
            </Link>
            {currentPost.author?.verified ? <VerifiedSeal className="post-verified-seal" /> : null}
          </h3>
          <p className="post-timestamp">{new Date(currentPost.createdAt).toLocaleString(undefined, {
            month: "long",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
          })}</p>
        </div>
        <div className="post-topline-actions">
          {isAuthor ? (
            <div className="post-owner-actions post-owner-actions-top">
              {confirmingDelete ? (
                <>
                  <span>Delete this post?</span>
                  <button type="button" onClick={() => deletePost(currentPost.id)}>Delete</button>
                  <button type="button" onClick={() => setConfirmingDelete(false)}>Cancel</button>
                </>
              ) : (
                <>
                  <button type="button" onClick={startEditing} disabled={editing}>Edit</button>
                  <button type="button" onClick={() => { setConfirmingDelete(true); setEditing(false); }}>Delete</button>
                </>
              )}
            </div>
          ) : null}
          <span className="visibility-tag">{currentPost.visibility}</span>
        </div>
      </div>

      {editing ? (
        <div className="post-edit-form">
          <label>
            Post
            <textarea value={draftText} onChange={(event) => setDraftText(event.target.value)} rows={4} />
          </label>
          <label>
            Suggested tags
            {suggestedTags.length ? (
              <span className="post-tag-suggestions">
                {suggestedTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={selectedDraftTags.includes(tag) ? "selected" : ""}
                    aria-pressed={selectedDraftTags.includes(tag)}
                    onClick={() => toggleSuggestedTag(tag)}
                  >
                    #{tag}
                  </button>
                ))}
              </span>
            ) : (
              <small>No popular tags match this text yet.</small>
            )}
          </label>
          <label className="post-custom-tags-label">
            Other tags (optional)
            <input
              value={draftTags}
              onChange={(event) => setDraftTags(event.target.value)}
              placeholder="Choose suggested tags above"
              aria-describedby={`post-tag-guidance-${currentPost.id}`}
            />
            <small id={`post-tag-guidance-${currentPost.id}`}>Using popular suggestions helps people find related posts.</small>
          </label>
          <label>
            Audience
            <select value={draftVisibility} onChange={(event) => setDraftVisibility(event.target.value)}>
              <option value="everyone">Everyone</option>
              <option value="verified-only">Verified only</option>
              <option value="followers">Followers</option>
              <option value="verified-followers">Verified followers</option>
              <option value="private">Only me</option>
            </select>
          </label>
          <div className="post-owner-actions">
            <button type="button" onClick={savePost}>Save changes</button>
            <button type="button" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      ) : (
        <>
          <p className="post-body">{currentPost.text}</p>
          {currentPost.tags?.length ? (
            <div className="tag-row post-tags">{currentPost.tags.map((tag) => <span className="tag" key={tag}>#{tag}</span>)}</div>
          ) : null}
        </>
      )}

      {showDiscoveryScore && currentPost.discoveryScore !== undefined ? (
        <p className="post-context">Recommended for your interests</p>
      ) : null}

      <div className="post-meta">
        <button className={`post-action like-action ${liked ? "liked" : ""}`} type="button" onClick={() => setLiked((value) => !value)} aria-pressed={liked}><span aria-hidden="true">{liked ? "♥" : "♡"}</span> {12 + (liked ? 1 : 0)}</button>
        <button className={`post-action ${commenting ? "active" : ""}`} type="button" onClick={() => setCommenting((value) => !value)} aria-expanded={commenting}>💬 {comments.length}</button>
        {canRepost ? <button className={`post-action ${reposted ? "active" : ""}`} type="button" disabled={reposted} onClick={() => { setReposted(true); onRepost?.(currentPost); }}>{reposted ? "✓ Reposted" : "↻ Repost"}</button> : null}
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
                  <Link
                    className="comment-author"
                    href={`/profile?user=${item.userId}`}
                    style={item.userId === viewerId ? { color: profileNameColorStyles[nameColor] } : undefined}
                  >
                    {item.displayName}
                  </Link>
                  {item.verified ? <VerifiedSeal className="comment-verified-seal" /> : null}
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
