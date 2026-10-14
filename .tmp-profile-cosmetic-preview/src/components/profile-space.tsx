"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { BadgeIcon } from "@/components/badge-icon";
import { VerifiedSeal } from "@/components/verified-seal";
import { FeedPostCard, type FeedPost } from "@/components/feed-post-card";
import {
  getBadge,
  getLockedProfileBadges,
  getProfileCosmeticStatus,
  getVisibleProfileCosmeticOptions,
  type BackgroundName,
  type NameColor,
  type ProfileCosmeticEligibility,
  type ProfileCosmeticStatus,
  type ProfileCosmeticUnlock,
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

const nameColors: Record<NameColor, string> = {
  nativ: "var(--text-primary)",
  gold: "var(--profile-name-gold)",
  sage: "var(--profile-name-sage)"
};

const backgroundStyles: Record<BackgroundName, string> = {
  forest: "var(--profile-header-default-gradient)",
  sunset: "var(--profile-header-sunset-gradient)",
  aurora: "var(--profile-header-aurora-gradient)",
  lavender: "var(--profile-header-lavender-gradient)",
  founder: "var(--profile-header-founder-gradient)",
  "gradient-red": "var(--profile-header-red-gradient)",
  "gradient-orange": "var(--profile-header-orange-gradient)",
  "gradient-yellow": "var(--profile-header-yellow-gradient)",
  "gradient-green": "var(--profile-header-green-gradient)",
  "gradient-blue": "var(--profile-header-blue-gradient)",
  "gradient-purple": "var(--profile-header-purple-gradient)",
  "gradient-event-preview": "linear-gradient(135deg, #183f4c 0%, #397365 100%)"
};

function ColorChoiceGroup<T extends string>({
  label,
  options,
  selected,
  eligibility,
  developerPreview,
  onSelect
}: {
  label: string;
  options: readonly ProfileColorOption<T>[];
  selected: T;
  eligibility: ProfileCosmeticEligibility;
  developerPreview: boolean;
  onSelect: (value: T, status: ProfileCosmeticStatus) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const visibleOptions = getVisibleProfileCosmeticOptions(options, eligibility, developerPreview);
  const selectedOption = visibleOptions.find((option) => option.value === selected);
  const sectionId = `customization-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

  function getUnlockDescription(unlock: ProfileCosmeticUnlock | undefined) {
    if (!unlock) {
      return "";
    }

    switch (unlock.method) {
      case "earned-badge":
        return `Requires ${getBadge(unlock.badgeSlug).label}`;
      case "event-eligibility":
        return "Requires event eligibility";
      case "free-promotion":
        return "Requires an explicit free promotion grant";
      case "account-age":
        return `Requires an account age of ${unlock.days} days`;
    }
  }

  return (
    <fieldset className="customization-color-group">
      <legend>
        <button
          className="customization-color-group-toggle"
          type="button"
          aria-expanded={expanded}
          aria-controls={`${sectionId}-options`}
          onClick={() => setExpanded(!expanded)}
        >
          <span>{label}</span>
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path d={expanded ? "m3 10 5-5 5 5" : "m3 6 5 5 5-5"} />
          </svg>
        </button>
      </legend>
      {!expanded && selectedOption ? (
        <div className="customization-color-group-selection">
          <span className="customization-color-swatch" style={{ background: selectedOption.swatch }} aria-hidden="true" />
          <span>{selectedOption.label}</span>
          {developerPreview ? (
            <small className={`customization-option-status status-${getProfileCosmeticStatus(selectedOption, eligibility)}`}>
              {getProfileCosmeticStatus(selectedOption, eligibility)}
            </small>
          ) : null}
        </div>
      ) : null}
      <div id={`${sectionId}-options`} className="customization-color-options" hidden={!expanded}>
        {visibleOptions.map((option) => {
          const status = getProfileCosmeticStatus(option, eligibility);
          const unlocked = status === "available";
          const statusLabel = status === "unreleased" ? "Unreleased" : status === "locked" ? "Locked" : "Available";
          const unlockDescription = getUnlockDescription(option.unlock);
          const accessibleStatus = developerPreview
            ? `, ${statusLabel.toLowerCase()}${unlockDescription ? `; ${unlockDescription}` : ""}`
            : "";
          return (
            <button
              key={option.value}
              className={`customization-color-option${developerPreview ? ` is-${status}` : ""}`}
              data-cosmetic-status={developerPreview ? status : undefined}
              type="button"
              aria-label={`${option.label}${accessibleStatus}`}
              aria-pressed={selected === option.value}
              disabled={!unlocked && !developerPreview}
              onClick={() => onSelect(option.value, status)}
            >
              <span className="customization-color-swatch" style={{ background: option.swatch }} aria-hidden="true" />
              <span>{option.label}</span>
              {developerPreview ? (
                <>
                  <small className={`customization-option-status status-${status}`}>{statusLabel}</small>
                  {unlockDescription ? <small className="customization-option-requirement">{unlockDescription}</small> : null}
                </>
              ) : null}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function ProfileSpace({
  owner,
  visitor,
  customization,
  badges,
  visitorBadges,
  posts,
  accountAgeDays,
  developerCosmeticsPreview,
  initialViewedAccountId
}: {
  owner: ProfileAccount;
  visitor: ProfileAccount;
  customization: ProfileCustomization;
  badges: EarnedBadge[];
  visitorBadges: EarnedBadge[];
  posts: FeedPost[];
  accountAgeDays: number;
  developerCosmeticsPreview: boolean;
  initialViewedAccountId?: string;
}) {
  const [viewedAccountId, setViewedAccountId] = useState(initialViewedAccountId ?? owner.id);
  const [followerCountExpanded, setFollowerCountExpanded] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [developerCatalogVisible, setDeveloperCatalogVisible] = useState(false);
  const [profileCustomization, setProfileCustomization] = useState(customization);
  const [developerPreviewCustomization, setDeveloperPreviewCustomization] = useState<Partial<ProfileCustomization>>({});
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
  const earnedBadgeSlugs = earnedBadges.map((badge) => badge.slug);
  const lockedBadges = getLockedProfileBadges(earnedBadgeSlugs);
  const cosmeticEligibility: ProfileCosmeticEligibility = {
    earnedBadgeSlugs,
    accountAgeDays
  };
  const displayCustomization = { ...profileCustomization, ...developerPreviewCustomization };
  const bannerBackground = backgroundStyles[displayCustomization.background];
  const nameColor = nameColors[displayCustomization.nameColor];

  function chooseCosmetic<K extends keyof ProfileCustomization>(
    key: K,
    value: ProfileCustomization[K],
    status: ProfileCosmeticStatus
  ) {
    if (status === "available") {
      setProfileCustomization((current) => ({ ...current, [key]: value }));
      setDeveloperPreviewCustomization((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
      return;
    }

    setDeveloperPreviewCustomization((current) => ({ ...current, [key]: value }));
  }

  function finishCustomization() {
    setIsCustomizing(false);
    setDeveloperCatalogVisible(false);
    setDeveloperPreviewCustomization({});
  }

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

      <section className="profile-panel panel" data-profile-color={displayCustomization.profilePanelColor}>
        <div
          className="profile-banner"
          data-profile-header-theme={displayCustomization.background}
          style={{ background: bannerBackground }}
        >
          <div className="profile-header">
            <div className="avatar large">{account.avatar}</div>
            <div className="profile-heading-copy">
              <p className="eyebrow">{isOwner ? "My profile" : "Public profile"}</p>
              <h1 style={{ color: isOwner ? nameColor : "var(--text-primary)" }}>
                <span className="profile-display-name">{account.displayName}</span>
                {account.verified ? (
                  <VerifiedSeal className="profile-verified-seal" />
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
                    onClick={() => {
                      if (isCustomizing) {
                        finishCustomization();
                      } else {
                        setIsCustomizing(true);
                      }
                    }}
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
          <section className="profile-about-card panel dark-panel" data-profile-color={displayCustomization.profileCardsColor}>
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

          <section className="profile-badges-card panel dark-panel" data-profile-color={displayCustomization.profileCardsColor}>
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
            {developerCosmeticsPreview && developerCatalogVisible ? (
              <div className="developer-badge-catalog" aria-label="Locked badge catalog">
                <h3>Locked badge catalog</h3>
                <div className="badge-grid">
                  {lockedBadges.map((badge) => (
                    <div key={badge.slug} className="badge-tile badge-tile-locked">
                      <BadgeIcon icon={badge.icon} category={badge.category} />
                      <strong>{badge.label}</strong>
                      <small className="developer-badge-description">{badge.description}</small>
                      <small>Locked</small>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
        </div>

        {isOwner ? (
          <section className="profile-posts" aria-labelledby="profile-posts-heading">
            <div className="profile-section-heading">
              <h2 id="profile-posts-heading">Posts</h2>
            </div>
            <div className="feed-stack">
              {posts.map((post) => <FeedPostCard key={post.id} post={post} />)}
            </div>
          </section>
        ) : null}

        {isOwner ? (
          <section
            className={`profile-customization panel dark-panel${isCustomizing ? " is-customizing" : ""}`}
            id="profile-customization"
            data-profile-color={displayCustomization.profilePanelColor}
            ref={customizationPanelRef}
          >
            <div className="profile-section-heading">
              <div><p className="eyebrow">Your look</p><h2>Customization</h2></div>
              <div className="customization-heading-actions">
                <span className="muted">Earned and chosen</span>
                {isCustomizing ? (
                  <button className="profile-action light-action customization-save" type="button" onClick={finishCustomization}>
                    Save
                  </button>
                ) : null}
              </div>
            </div>
            <div className="customization-preview-row">
              <button
                className="customization-header-preview customization-header-preview-button"
                type="button"
                aria-label="Open profile customization options"
                data-profile-header-theme={displayCustomization.background}
                style={{ background: bannerBackground }}
                onClick={() => setIsCustomizing(true)}
              >
                <div className="customization-header-identity">
                  <span className="customization-preview-avatar">{account.avatar}</span>
                  <strong style={{ color: nameColor }}>{account.displayName}</strong>
                </div>
                <div className="customization-header-actions" aria-hidden="true">
                  <span className="customization-preview-action">Edit profile</span>
                  <span className="customization-preview-action">Customize</span>
                </div>
              </button>
            </div>
            {isCustomizing ? (
              <>
                {developerCosmeticsPreview ? (
                  <button
                    className="profile-action subtle-action developer-catalog-toggle"
                    type="button"
                    aria-expanded={developerCatalogVisible}
                    aria-controls="developer-cosmetic-catalog"
                    onClick={() => {
                      if (developerCatalogVisible) {
                        setDeveloperPreviewCustomization({});
                      }
                      setDeveloperCatalogVisible(!developerCatalogVisible);
                    }}
                  >
                    {developerCatalogVisible ? "Hide locked options and badges" : "Show locked options and badges"}
                  </button>
                ) : null}
                <div className="customization-color-groups" id="developer-cosmetic-catalog">
                  <ColorChoiceGroup
                    label="Profile name"
                    options={profileNameColorOptions}
                    selected={displayCustomization.nameColor}
                    eligibility={cosmeticEligibility}
                    developerPreview={developerCosmeticsPreview && developerCatalogVisible}
                    onSelect={(nameColor, status) => chooseCosmetic("nameColor", nameColor, status)}
                  />
                  <ColorChoiceGroup
                    label="Profile header color and buttons"
                    options={profileHeaderBackgroundOptions}
                    selected={displayCustomization.background}
                    eligibility={cosmeticEligibility}
                    developerPreview={developerCosmeticsPreview && developerCatalogVisible}
                    onSelect={(background, status) => chooseCosmetic("background", background, status)}
                  />
                  <ColorChoiceGroup
                    label="Main profile panel"
                    options={profilePanelColorOptions}
                    selected={displayCustomization.profilePanelColor}
                    eligibility={cosmeticEligibility}
                    developerPreview={developerCosmeticsPreview && developerCatalogVisible}
                    onSelect={(profilePanelColor, status) => chooseCosmetic("profilePanelColor", profilePanelColor, status)}
                  />
                  <ColorChoiceGroup
                    label="About and Badges panels"
                    options={profileCardsColorOptions}
                    selected={displayCustomization.profileCardsColor}
                    eligibility={cosmeticEligibility}
                    developerPreview={developerCosmeticsPreview && developerCatalogVisible}
                    onSelect={(profileCardsColor, status) => chooseCosmetic("profileCardsColor", profileCardsColor, status)}
                  />
                </div>
                {developerCosmeticsPreview && developerCatalogVisible ? (
                  <div className="customization-developer-preview" role="status">
                    <strong>Local developer catalog preview</strong>
                    <span>Available choices update this page only. Locked and unreleased choices are temporary visual previews; they do not unlock cosmetics or award rewards.</span>
                    {Object.keys(developerPreviewCustomization).length > 0 ? (
                      <button type="button" className="text-button" onClick={() => setDeveloperPreviewCustomization({})}>Clear temporary previews</button>
                    ) : null}
                  </div>
                ) : null}
                <p className="customization-demo-note">Earned cosmetics use the current demo profile’s eligibility. Changes reset when the page is refreshed.</p>
              </>
            ) : null}
          </section>
        ) : null}
      </section>
    </main>
  );
}
