"use client";

import { useState } from "react";
import type { BadgeDefinition } from "@/lib/personalization";
import type { ProfileCustomization } from "@/lib/personalization";

type ProfileAccount = {
  id: string;
  username: string;
  displayName: string;
  verified: boolean;
  bio: string;
  avatar: string;
  followers: number;
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
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState(owner.bio);
  const isOwner = viewedAccountId === owner.id;
  const account = isOwner ? owner : visitor;
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
                {account.displayName} {account.verified ? <span className="verified-badge">✓</span> : null}
              </h1>
              <p className="light-text">@{account.username}</p>
            </div>
            <div className="profile-actions">
              {isOwner ? (
                <>
                  <button className="profile-action light-action" type="button" onClick={() => setEditing((current) => !current)}>{editing ? "Done" : "Edit profile"}</button>
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

        <div className="profile-stats">
          <span><strong>{account.posts}</strong> Posts</span>
          <span><strong>{account.followers}</strong> Followers</span>
          <span><strong>{account.following}</strong> Following</span>
        </div>

        <div className="profile-content-grid">
          <section className="profile-about-card panel dark-panel">
            <div className="profile-section-heading"><h2>About</h2>{isOwner && editing ? <span className="tag">Editing</span> : null}</div>
            {isOwner && editing ? (
              <textarea value={bio} onChange={(event) => setBio(event.target.value)} rows={4} aria-label="Edit bio" />
            ) : (
              <p className="profile-bio">{account.id === owner.id ? bio : account.bio}</p>
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
                  <small>{badge.kind}</small>
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
