"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { getCurrentDailyPrompt, promptResponsePreviews } from "@/lib/daily-prompt";
import { AdvertisingProvider, SidebarAd, TopBannerAd } from "./banner-ad";
import { DiscoveryFeed } from "./discovery-feed";
import { FeedPostCard, type FeedPost } from "./feed-post-card";
import { NativLogo } from "./nativ-logo";
import { ThemeToggle } from "./theme-toggle";

export type SocialViewer = {
  id: string;
  username?: string;
  displayName?: string;
  verified?: boolean;
};

const emptyFollowedUserIds = new Set<string>();

export function AppShell({
  viewer,
  children,
  adFree = false
}: {
  viewer: SocialViewer;
  children: ReactNode;
  adFree?: boolean;
}) {
  return (
    <AdvertisingProvider adFree={adFree}>
      <div className="app-shell">
      <header className="topbar">
        <div className="brand-wrap">
          <NativLogo variant="primary" />
        </div>

        <nav className="nav" aria-label="Main navigation">
          <Link href="/">Following</Link>
          <Link href="/discovery">Discovery</Link>
          <Link href="/communities">Communities</Link>
          <Link href="/daily-prompts">Prompts</Link>
        </nav>

        <div className="header-user-controls">
          <ThemeToggle />
          <Link className="user-pill user-profile-link" href="/profile">
            <span className="nav-avatar">{viewer.displayName?.slice(0, 2) ?? "NA"}</span>
            <span>{viewer.displayName ?? viewer.username ?? "Guest"}</span>
            {viewer.verified ? <span className="verified-badge">✓</span> : null}
          </Link>
        </div>
        </header>
        <TopBannerAd />
        {children}
      </div>
    </AdvertisingProvider>
  );
}

export function SocialShell({
  viewer,
  feed,
  discovery,
  mode = "following",
  followedUserIds = emptyFollowedUserIds
}: {
  viewer: SocialViewer;
  feed: FeedPost[];
  discovery: FeedPost[];
  mode?: "following" | "discovery";
  followedUserIds?: Set<string>;
}) {
  const isDiscovery = mode === "discovery";
  const [audience, setAudience] = useState<"all" | "people" | "communities">("all");
  const [contentType, setContentType] = useState<"all" | "text" | "photo" | "long-form">("all");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [composerText, setComposerText] = useState("");
  const [localPosts, setLocalPosts] = useState<FeedPost[]>([]);
  const prompt = getCurrentDailyPrompt();
  const followedResponses = promptResponsePreviews.filter((response) => followedUserIds.has(response.userId));
  const [promptResponses, setPromptResponses] = useState(followedResponses.slice(0, 3));

  useEffect(() => {
    setPromptResponses([...followedResponses].sort(() => Math.random() - 0.5).slice(0, 3));
  }, [followedUserIds, viewer.id]);

  const followingPosts = useMemo(() => {
    const posts = [...localPosts, ...feed]
      .filter((post) => !post.isAd)
      .filter((post) => audience === "all" || (audience === "people" ? !post.communityId : Boolean(post.communityId)))
      .filter((post) => contentType === "all" || (post.contentType ?? "text") === contentType)
      .filter((post) => !verifiedOnly || post.author?.verified)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return posts;
  }, [audience, contentType, feed, localPosts, verifiedOnly]);

  function submitPost() {
    const text = composerText.trim();
    if (!text) return;
    setLocalPosts((posts) => [{
      id: `local-${Date.now()}`,
      authorId: viewer.id,
      text,
      createdAt: new Date().toISOString(),
      visibility: "everyone",
      contentType: "text",
      author: {
        displayName: viewer.displayName,
        username: viewer.username,
        verified: viewer.verified,
        avatar: viewer.displayName?.slice(0, 2) ?? "NA"
      }
    }, ...posts]);
    setComposerText("");
  }

  function repostPost(originalPost: FeedPost) {
    setLocalPosts((posts) => {
      if (posts.some((post) => post.originalPost?.id === originalPost.id)) {
        return posts;
      }

      return [{
        id: `repost-${originalPost.id}`,
        authorId: viewer.id,
        createdAt: new Date().toISOString(),
        visibility: "everyone",
        repostedBy: {
          id: viewer.id,
          displayName: viewer.displayName ?? viewer.username ?? "You",
          avatar: viewer.displayName?.slice(0, 2) ?? "NA"
        },
        originalPost
      }, ...posts];
    });
  }

  return (
    <AppShell viewer={viewer}>
      <main className="layout">
        <aside className="rail left-rail">
          {isDiscovery ? (
            <>
              <section className="panel">
                <p className="panel-label">Trending communities</p>
                <div className="rail-list">
                  <Link href="/communities">Gaming <span>+ Explore</span></Link>
                  <Link href="/communities">Photography <span>+ Explore</span></Link>
                  <Link href="/communities">Art & design <span>+ Explore</span></Link>
                  <Link href="/communities">Technology <span>+ Explore</span></Link>
                </div>
              </section>
              <section className="panel">
                <p className="panel-label">Topics to explore</p>
                <div className="tag-row compact-tags">
                  <span className="tag">Creative routines</span>
                  <span className="tag">Local groups</span>
                  <span className="tag">Open source</span>
                </div>
              </section>
              <SidebarAd placement="discovery-left" />
            </>
          ) : (
            <>
              <section className="panel">
                <p className="panel-label">Following filters</p>
                <div className="filter-list">
                  <button className={`filter-button ${audience === "all" ? "active" : ""}`} type="button" onClick={() => setAudience("all")}>Everyone</button>
                  <button className={`filter-button ${audience === "people" ? "active" : ""}`} type="button" onClick={() => setAudience("people")}>People</button>
                  <button className={`filter-button ${audience === "communities" ? "active" : ""}`} type="button" onClick={() => setAudience("communities")}>Communities</button>
                </div>
                <p className="panel-label filter-subheading">Content</p>
                <div className="filter-list">
                  {(["all", "text", "photo", "long-form"] as const).map((type) => <button key={type} className={`filter-button ${contentType === type ? "active" : ""}`} type="button" onClick={() => setContentType(type)}>{type === "all" ? "All content" : type}</button>)}
                </div>
                <button className={`filter-button trust-filter ${verifiedOnly ? "active" : ""}`} type="button" onClick={() => setVerifiedOnly((value) => !value)}>Verified only</button>
              </section>
              <SidebarAd placement="following-left" />
            </>
          )}
        </aside>

        <section className="feed-column">
          <div className="section-header">
            <div>
              <p className="eyebrow">{isDiscovery ? "Explore" : "Your feed"}</p>
              <h2>{isDiscovery ? "Discovery" : "Following"}</h2>
            </div>
            <span className="pill soft">{isDiscovery ? "For you" : "Chronological"}</span>
          </div>

          {!isDiscovery ? (
            <section className="composer panel">
              <div className="composer-head">
                <div className="avatar">{viewer.displayName?.slice(0, 2) ?? "NA"}</div>
                <span>Share something with your network</span>
              </div>
              <textarea aria-label="Create a post" value={composerText} onChange={(event) => setComposerText(event.target.value)} placeholder="What is on your mind?" rows={3} />
              <div className="composer-actions">
                <button className="text-button" type="button">Add image</button>
                <button className="primary-action" type="button" onClick={submitPost} disabled={!composerText.trim()}>Post</button>
              </div>
            </section>
          ) : null}

          {isDiscovery ? (
            <DiscoveryFeed posts={feed} />
          ) : (
            <div className="feed-stack">
              {followingPosts.length === 0 ? <div className="empty-state">No posts match these filters.</div> : followingPosts.map((post) => <FeedPostCard key={post.id} post={post} onRepost={repostPost} />)}
            </div>
          )}
        </section>

        <aside className="rail right-rail">
          {isDiscovery ? (
            <>
              <section className="panel">
                <p className="panel-label">People to follow</p>
                <div className="rail-list people-list">
                  <div><strong>Horizon</strong><span>@horizon</span><button type="button">Follow</button></div>
                  <div><strong>Studio North</strong><span>@studionorth</span><button type="button">Follow</button></div>
                  <div><strong>Field Notes</strong><span>@fieldnotes</span><button type="button">Follow</button></div>
                </div>
              </section>
              <section className="panel">
                <p className="panel-label">Trending now</p>
                <div className="trend-list"><span>#community-builders</span><span>#analog-weekend</span><span>#makers-lab</span></div>
              </section>
              <SidebarAd placement="discovery-right" />
            </>
          ) : (
            <>
              <section className="panel prompt-teaser">
                <p className="panel-label">Today&apos;s prompt</p>
                <Link className="prompt-teaser-link" href="/daily-prompts"><h3>{prompt.question}</h3></Link>
                <p className="muted">{followedResponses.length} people you follow have answered.</p>
                <div className="prompt-response-list">
                  {promptResponses.map((response) => <p key={response.userId}><strong>{response.displayName}:</strong> &quot;{response.text}&quot;</p>)}
                </div>
                <Link className="text-button" href="/daily-prompts">Answer today&apos;s prompt →</Link>
              </section>
              <SidebarAd placement="following-right" />
            </>
          )}
        </aside>
      </main>
    </AppShell>
  );
}
