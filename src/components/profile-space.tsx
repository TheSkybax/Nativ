"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { BadgeIcon } from "@/components/badge-icon";
import {
  getBadge,
  isProfileColorUnlocked,
  profileCardsColorOptions,
  profileHeaderBackgroundOptions,
  profileNameColorOptions,
  profilePanelColorOptions,
  type BadgeDefinition,
  type BadgeSlug,
  type ProfileColorOption,
  type ProfileCustomization
} from "@/lib/personalization";
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

type EarnedBadge = BadgeDefinition & { slug: BadgeSlug };

const nameColors = {
  nativ: "var(--text-primary)",
  sunset: "#ffbd7d",
  ocean: "var(--brand-sky)",
  rose: "#f2a4c3",
  forest: "#a4eadb",
  gold: "#f2d27b"
};

const backgroundStyles = {
  forest: "linear-gradient(135deg, var(--brand-midnight) 0%, var(--brand-teal-deep) 100%)",
  sunset: "linear-gradient(135deg, #432a46 0%, #a34e62 100%)",
  aurora: "linear-gradient(135deg, var(--brand-midnight) 0%, var(--brand-slate-light) 100%)",
  lavender: "linear-gradient(135deg, var(--brand-navy) 0%, var(--brand-teal-soft) 100%)",
  founder: "linear-gradient(135deg, #382a1c 0%, #92703a 100%)"
};

function ColorChoiceGroup<T extends string>({
  label,
  options,
  selected,
  earnedBadgeSlugs,
  onSelect
}: {
  label: string;
  options: readonly ProfileColorOption<T>[];
  selected: T;
  earnedBadgeSlugs: readonly BadgeSlug[];
  onSelect: (value: T) => void;
}) {
  return (
    <fieldset className="customization-color-group">
      <legend>{label}</legend>
      <div className="customization-color-options">
        {options.map((option) => {
          const unlocked = isProfileColorUnlocked(option, earnedBadgeSlugs);
          return (
            <button
              key={option.value}
              className="customization-color-option"
              type="button"
              aria-label={`${option.label}${option.unlockBadge ? `; requires ${getBadge(option.unlockBadge).label}` : ""}`}
              aria-pressed={selected === option.value}
              disabled={!unlocked}
              onClick={() => onSelect(option.value)}
            >
              <span className="customization-color-swatch" style={{ background: option.swatch }} aria-hidden="true" />
              <span>{option.label}</span>
              {option.unlockBadge && !unlocked ? <small>Unlock: {getBadge(option.unlockBadge).label}</small> : null}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function getSelectedOptionLabel<T extends string>(
  options: readonly ProfileColorOption<T>[],
  value: T
) {
  const option = options.find((item) => item.value === value);
  if (!option) {
    throw new Error(`No customization label found for "${value}".`);
  }

  return option.label;
}

export function ProfileSpace({
  owner,
  visitor,
  customization,
  badges,
  visitorBadges,
  initialViewedAccountId
}: {
  owner: ProfileAccount;
  visitor: ProfileAccount;
  customization: ProfileCustomization;
  badges: EarnedBadge[];
  visitorBadges: EarnedBadge[];
  initialViewedAccountId?: string;
}) {
  const [viewedAccountId, setViewedAccountId] = useState(initialViewedAccountId ?? owner.id);
  const [followerCountExpanded, setFollowerCountExpanded] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [profileCustomization, setProfileCustomization] = useState(customization);
  const customizationPanelRef = useRef<HTMLElement | null>(null);
  const [activeBadgeSlug, setActiveBadgeSlug] = useState<string | null>(null);
  const [isBadgePopupClosing, setIsBadgePopupClosing] = useState(false);
  const [profileEdit, dispatchProfileEdit] = useReducer(
    profileEditReducer,
    {
      displayName: owner.displayName,
      bio: owner.bio,
      visibleBadgeSlugs: badges.map((badge) => badge.slug)
    },
    createProfileEditState
  );
  const { editing } = profileEdit;
  const isOwner = viewedAccountId === owner.id;
  const account = isOwner ? { ...owner, ...profileEdit.saved } : visitor;
  const earnedBadges = isOwner ? badges : visitorBadges;
  const displayedBadges = isOwner
    ? badges.filter((badge) => profileEdit.saved.visibleBadgeSlugs.includes(badge.slug))
    : visitorBadges;
  const profileBadges = isOwner && editing
    ? badges
    : displayedBadges;
  const activeBadge = earnedBadges.find((badge) => badge.slug === activeBadgeSlug);
  const bannerBackground = backgroundStyles[profileCustomization.background];
  const nameColor = nameColors[profileCustomization.nameColor];
  const earnedBadgeSlugs = earnedBadges.map((badge) => badge.slug);
  const customizationSummary = [
    { name: getSelectedOptionLabel(profileHeaderBackgroundOptions, profileCustomization.background), descriptor: "theme" },
    { name: getSelectedOptionLabel(profilePanelColorOptions, profileCustomization.profilePanelColor), descriptor: "profile" },
    { name: getSelectedOptionLabel(profileCardsColorOptions, profileCustomization.profileCardsColor), descriptor: "panels" }
  ];

  useEffect(() => {
    if (isCustomizing) {
      customizationPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [isCustomizing]);

  useEffect(() => {
    if (!activeBadgeSlug) {
      return;
    }

    const timeout = window.setTimeout(() => setIsBadgePopupClosing(true), 3500);
    return () => window.clearTimeout(timeout);
  }, [activeBadgeSlug]);

  useEffect(() => {
    if (!isBadgePopupClosing) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setActiveBadgeSlug(null);
      setIsBadgePopupClosing(false);
    }, 160);
    return () => window.clearTimeout(timeout);
  }, [isBadgePopupClosing]);

  useEffect(() => {
    if (!activeBadgeSlug) {
      return;
    }

    const dismissOnOutsideClick = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest(".badge-tile")) {
        return;
      }

      setIsBadgePopupClosing(true);
    };

    document.addEventListener("click", dismissOnOutsideClick);
    return () => document.removeEventListener("click", dismissOnOutsideClick);
  }, [activeBadgeSlug]);

  return (
    <main className="profile-page">
      <div className="profile-view-switcher" aria-label="Prototype profile states">
        <span>Viewing</span>
        <button className={isOwner ? "active" : ""} type="button" onClick={() => setViewedAccountId(owner.id)}>My profile</button>
        <button className={!isOwner ? "active" : ""} type="button" onClick={() => setViewedAccountId(visitor.id)}>Another profile</button>
      </div>

      <section className="profile-panel panel" data-profile-color={profileCustomization.profilePanelColor}>
        <div
          className="profile-banner"
          data-profile-header-theme={profileCustomization.background}
          style={{ background: bannerBackground }}
        >
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
                  {editing ? (
                    <button className="profile-action light-action" type="button" onClick={() => dispatchProfileEdit({ type: "save" })}>Save</button>
                  ) : (
                    <button className="profile-action light-action" type="button" onClick={() => dispatchProfileEdit({ type: "open" })}>Edit profile</button>
                  )}
                  <button
                    className="profile-action light-action"
                    type="button"
                    aria-expanded={isCustomizing}
                    aria-controls="profile-customization"
                    onClick={() => setIsCustomizing((open) => !open)}
                  >
                    {isCustomizing ? "Done customizing" : "Customize"}
                  </button>
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
          <section className="profile-about-card panel dark-panel" data-profile-color={profileCustomization.profileCardsColor}>
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

          <section className="profile-badges-card panel dark-panel" data-profile-color={profileCustomization.profileCardsColor}>
            <div className="profile-section-heading">
              <h2>Badges</h2>
              <span className="muted">{earnedBadges.length} Total Badges</span>
            </div>
            <p className="badge-demo-note">Demo account dates, post totals, and badge assignments; event tracking is not connected.</p>
            {isOwner && editing ? <p className="badge-edit-hint">Select the badges you want to show on your profile.</p> : null}
            <div className="badge-grid">
              {profileBadges
                .filter((badge) => !isOwner || editing || profileEdit.saved.visibleBadgeSlugs.includes(badge.slug))
                .map((badge) => {
                  const isSelected = profileEdit.draft.visibleBadgeSlugs.includes(badge.slug);
                  const selectable = isOwner && editing;

                  return (
                    <div key={badge.slug} className="badge-tile-wrap">
                      <button
                        className={`badge-tile ${selectable ? "badge-tile-selectable" : "badge-tile-informative"} ${selectable && isSelected ? "selected" : ""}`}
                        type="button"
                        aria-label={`${badge.label}: ${badge.description}${selectable ? ` (${isSelected ? "selected" : "not selected"})` : ""}`}
                        aria-pressed={selectable ? isSelected : undefined}
                        onClick={() => {
                          setActiveBadgeSlug(badge.slug);
                          setIsBadgePopupClosing(false);
                          if (selectable) {
                            dispatchProfileEdit({
                              type: "toggle-badge",
                              slug: badge.slug,
                              visible: !isSelected
                            });
                          }
                        }}
                      >
                        <BadgeIcon icon={badge.icon} category={badge.category} />
                        <strong>{badge.label}</strong>
                      </button>
                      {activeBadge?.slug === badge.slug ? (
                        <div className={`badge-description-popup${isBadgePopupClosing ? " closing" : ""}`} role="status" aria-live="polite">
                          <div>
                            <strong>{badge.label}</strong>
                            <p>{badge.description}</p>
                          </div>
                          <button type="button" aria-label="Dismiss badge details" onClick={() => setIsBadgePopupClosing(true)}>×</button>
                        </div>
                      ) : null}
                    </div>
                  );
                })}
            </div>
          </section>
        </div>

        {isOwner ? (
          <section
            className={`profile-customization panel dark-panel${isCustomizing ? " is-customizing" : ""}`}
            id="profile-customization"
            data-profile-color={profileCustomization.profilePanelColor}
            ref={customizationPanelRef}
          >
            <div className="profile-section-heading">
              <div><p className="eyebrow">Your look</p><h2>Customization</h2></div>
              <div className="customization-heading-actions">
                <span className="muted">Earned and chosen</span>
                {isCustomizing ? (
                  <button className="profile-action light-action customization-save" type="button" onClick={() => setIsCustomizing(false)}>
                    Save
                  </button>
                ) : null}
              </div>
            </div>
            <div className="customization-preview-row">
              <div
                className="customization-header-preview"
                data-profile-header-theme={profileCustomization.background}
                style={{ background: bannerBackground }}
              >
                <div className="customization-header-identity">
                  <span className="customization-preview-avatar">{account.avatar}</span>
                  <strong style={{ color: nameColor }}>{account.displayName}</strong>
                </div>
                <div className="customization-header-actions" aria-hidden="true">
                  <span className="customization-preview-action">Edit profile</span>
                  <span className="customization-preview-action">Customize</span>
                </div>
              </div>
              <div className="customization-selection-summary">
                {customizationSummary.map(({ name, descriptor }) => (
                  <span key={descriptor}><strong>{name}</strong> {descriptor}</span>
                ))}
              </div>
            </div>
            {isCustomizing ? (
              <>
                <div className="customization-color-groups">
                  <ColorChoiceGroup
                    label="Profile name"
                    options={profileNameColorOptions}
                    selected={profileCustomization.nameColor}
                    earnedBadgeSlugs={earnedBadgeSlugs}
                    onSelect={(nameColor) => setProfileCustomization((current) => ({ ...current, nameColor }))}
                  />
                  <ColorChoiceGroup
                    label="Profile header gradient and buttons"
                    options={profileHeaderBackgroundOptions}
                    selected={profileCustomization.background}
                    earnedBadgeSlugs={earnedBadgeSlugs}
                    onSelect={(background) => setProfileCustomization((current) => ({ ...current, background }))}
                  />
                  <ColorChoiceGroup
                    label="Main profile panel"
                    options={profilePanelColorOptions}
                    selected={profileCustomization.profilePanelColor}
                    earnedBadgeSlugs={earnedBadgeSlugs}
                    onSelect={(profilePanelColor) => setProfileCustomization((current) => ({ ...current, profilePanelColor }))}
                  />
                  <ColorChoiceGroup
                    label="About and Badges panels"
                    options={profileCardsColorOptions}
                    selected={profileCustomization.profileCardsColor}
                    earnedBadgeSlugs={earnedBadgeSlugs}
                    onSelect={(profileCardsColor) => setProfileCustomization((current) => ({ ...current, profileCardsColor }))}
                  />
                </div>
                <p className="customization-demo-note">Badge-locked colors use this demo profile’s earned badges. Changes reset when the page is refreshed.</p>
              </>
            ) : null}
          </section>
        ) : null}
      </section>
    </main>
  );
}
