"use client";

import { useReducer, useState } from "react";
import type { BadgeDefinition } from "@/lib/personalization";
import type { ProfileCustomization } from "@/lib/personalization";
import { createProfileEditState, profileEditReducer } from "@/lib/profile-edit";

type ProfileAccount = {
  id: string;
  username: string;
  displayName: string;
  verified: boolean;
  bio: string;
  avatar: string;
  followers: number;
  verifiedFollowers?: number;
  following: number;
  posts: number;
};

const nameColors = {
  sunset: "var(--brand-teal-bright)",
  ocean: "var(--brand-sky)",
  rose: "var(--brand-teal-bright)",
  forest: "var(--brand-teal)",
  gold: "var(--brand-teal-soft)"
};

const backgroundStyles = {
  forest: "linear-gradient(135deg, var(--brand-midnight) 0%, var(--brand-teal-deep) 100%)",
  sunset: "linear-gradient(135deg, var(--brand-navy) 0%, var(--brand-teal) 100%)",
  aurora: "linear-gradient(135deg, var(--brand-midnight) 0%, var(--brand-slate-light) 100%)",
  lavender: "linear-gradient(135deg, var(--brand-navy) 0%, var(--brand-teal-soft) 100%)"
};

const badgeIcons: Record<string, string> = {
  "founder-1000": "✦",
  veteran: "◷",
  contributor: "✎",
  creator: "✹",
  "prompt-participant": "▣"
};

export function ProfileSpace({
  owner,
  visitor,
  customization,
  badges,
  initialViewedAccountId
}: {
  owner: ProfileAccount;
  visitor: ProfileAccount;
  customization: ProfileCustomization;
  badges: BadgeDefinition[];
  initialViewedAccountId?: string;
}) {
  const [viewedAccountId, setViewedAccountId] = useState(initialViewedAccountId ?? owner.id);
  const [followerCountExpanded, setFollowerCountExpanded] = useState(false);
  const [profileEdit, dispatchProfileEdit] = useReducer(
    profileEditReducer,
    { displayName: owner.displayName, bio: owner.bio },
    createProfileEditState
  );
  const { editing } = profileEdit;
  const isOwner = viewedAccountId === owner.id;
  const account = isOwner ? { ...owner, ...profileEdit.saved } : visitor;
  const bannerBackground = backgroundStyles[customization.background];
  const nameColor = nameColors[customization.nameColor];

  return (
    <main className="profile-page">
      <div className="profile-view-switcher" aria-label="Prototype profile states">
        <span>Viewing</span>
        <button className={isOwner ? "active" : ""} type="button" onClick={() => setViewedAccountId(owner.id)}>My profile</button>
        <button className={!isOwner ? "active" : ""} type="button" onClick={() => setViewedAccountId(visitor.id)}>Another profile</button>
      </div>

      <section className="profile-panel panel">
        <div className="profile-banner" style={{ background: bannerBackground }}>
          <div className="profile-header">
            <div className="avatar large">{account.avatar}</div>
            <div className="profile-heading-copy">
              <p className="eyebrow">{isOwner ? "My profile" : "Public profile"}</p>
              <h1 style={{ color: isOwner ? nameColor : "var(--text-primary)" }}>
                <span className="profile-display-name">{account.displayName}</span>
                {account.verified ? (
                  <svg className="profile-verified-seal" viewBox="0 0 24 24" role="img" aria-label="Verified account">
                    <defs>
                      <linearGradient id="profile-verified-gold" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0" stopColor="#fff1a8" />
                        <stop offset="0.52" stopColor="#e5b943" />
                        <stop offset="1" stopColor="#aa7418" />
                      </linearGradient>
                    </defs>
                    <path d="m12 1.2 2.7 2 3.4-.2 1.4 3.1 3 1.7-.6 3.4 1.4 3.1-2.4 2.5-.4 3.4-3.3.9L15 23l-3-1.5L9 23l-2.2-2.3-3.3-.9-.4-3.4L.7 14l1.4-3.1-.6-3.4 3-1.7 1.4-3.1 3.4.2z" fill="url(#profile-verified-gold)" stroke="#8c6118" strokeLinejoin="round" />
                    <path d="m7.5 12.2 3 3 6.2-6.4" fill="none" stroke="#fffdf3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                  </svg>
                ) : null}
              </h1>
              <p className="light-text">@{account.username}</p>
            </div>
            <div className="profile-actions">
              {isOwner ? (
                <>
                  {!editing ? <button className="profile-action light-action" type="button" onClick={() => dispatchProfileEdit({ type: "open" })}>Edit profile</button> : null}
                  <button className="profile-action light-action" type="button">Customize</button>
                </>
              ) : (
                <>
                  <button className="profile-action light-action" type="button">Follow</button>
                  <button className="profile-action subtle-action" type="button">More</button>
                </>
              )}
            </div>
          </div>
        </div>

        {isOwner ? (
          <div className="profile-stats profile-stats-owner">
            <span><strong>{account.posts}</strong> Posts</span>
            <span><strong>{account.following}</strong> Following</span>
            <div className="profile-follower-stat">
              <span className="profile-follower-count">
                <strong>{(account.verifiedFollowers ?? 0).toLocaleString("en-US")}</strong>{" "}
                {followerCountExpanded ? "Verified / " : "Verified Followers"}
                {followerCountExpanded ? (
                  <>
                    <strong>{account.followers.toLocaleString("en-US")}</strong> total followers
                  </>
                ) : null}
                <button
                  className="profile-follower-toggle"
                  type="button"
                  aria-label={followerCountExpanded ? "Hide total follower count" : "Show total follower count"}
                  aria-expanded={followerCountExpanded}
                  onClick={() => setFollowerCountExpanded((expanded) => !expanded)}
                >
                  {followerCountExpanded ? "⌄" : "⌃"}
                </button>
              </span>
              <span className="profile-follower-demo">Demo counts</span>
            </div>
          </div>
        ) : (
          <div className="profile-stats">
            <span><strong>{account.posts}</strong> Posts</span>
            <span><strong>{account.followers}</strong> Followers</span>
            <span><strong>{account.following}</strong> Following</span>
          </div>
        )}

        <div className="profile-content-grid">
          <section className="profile-about-card panel dark-panel">
            <div className="profile-section-heading"><h2>About</h2>{isOwner && editing ? <span className="tag">Editing</span> : null}</div>
            {isOwner && editing ? (
              <>
                <label className="profile-edit-field">
                  Display name
                  <input
                    value={profileEdit.draft.displayName}
                    onChange={(event) => dispatchProfileEdit({ type: "change", field: "displayName", value: event.target.value })}
                  />
                </label>
                <label className="profile-edit-field">
                  About
                  <textarea
                    value={profileEdit.draft.bio}
                    onChange={(event) => dispatchProfileEdit({ type: "change", field: "bio", value: event.target.value })}
                    rows={4}
                  />
                </label>
                <div className="profile-edit-actions">
                  <button className="profile-action light-action" type="button" onClick={() => dispatchProfileEdit({ type: "save" })}>Save</button>
                  <button className="profile-action subtle-action" type="button" onClick={() => dispatchProfileEdit({ type: "cancel" })}>Cancel</button>
                </div>
              </>
            ) : (
              <p className="profile-bio">{account.bio}</p>
            )}
            <div className="profile-meta-row">
              <span>Joined August 2024</span>
              <span>Public profile</span>
            </div>
            {isOwner && customization.musicMood !== "none" ? <div className="music-control"><span>♫</span><span>{customization.musicMood} profile music</span><button type="button" aria-label="Play profile music">▶</button></div> : null}
          </section>

          <section className="profile-badges-card panel dark-panel">
            <div className="profile-section-heading"><h2>Badges</h2><span className="muted">{badges.length} earned</span></div>
            <div className="badge-grid">
              {badges.map((badge) => (
                <div key={badge.slug} className="badge-tile" title={badge.description}>
                  <span className="badge-icon">{badgeIcons[badge.slug] ?? "●"}</span>
                  <strong>{badge.label}</strong>
                </div>
              ))}
            </div>
          </section>
        </div>

        {isOwner ? (
          <section className="profile-customization panel dark-panel">
            <div className="profile-section-heading"><div><p className="eyebrow">Your look</p><h2>Customization</h2></div><span className="muted">Earned and chosen</span></div>
            <div className="customization-preview-row">
              <div className="customization-swatch" style={{ background: customization.style.gradient }}><span style={{ color: nameColor }}>{account.displayName}</span></div>
              <div><strong>{customization.style.label} theme</strong><p className="muted">{customization.background} background · {customization.musicMood} music</p></div>
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}
