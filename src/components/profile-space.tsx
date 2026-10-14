"use client";

import { useEffect, useLayoutEffect, useReducer, useRef, useState } from "react";
import type { CSSProperties, PointerEvent } from "react";
import { BadgeIcon } from "@/components/badge-icon";
import { useProfileAppearance } from "@/components/profile-appearance-provider";
import { VerifiedSeal } from "@/components/verified-seal";
import { FeedPostCard, type FeedPost } from "@/components/feed-post-card";
import { usePostMutations } from "@/components/post-mutations-provider";
import {
  getBadge,
  getLockedProfileBadges,
  getProfileCosmeticStatus,
  getVisibleProfileCosmeticOptions,
  type BackgroundName,
  type ProfileCosmeticEligibility,
  type ProfileCosmeticStatus,
  type ProfileCosmeticUnlock,
  type ProfilePanelColor,
  profileCardsColorOptions,
  profileHeaderBackgroundOptions,
  profileNameColorOptions,
  profilePanelColorOptions,
  profileNameColorStyles,
  type BadgeDefinition,
  type BadgeSlug,
  type ProfileColorOption,
  type ProfileCustomization
} from "@/lib/personalization";
import { createProfileEditState, profileEditReducer } from "@/lib/profile-edit";
import type { VerificationSealVariant } from "./verified-seal";

type ProfileAccount = {
  id: string;
  username: string;
  displayName: string;
  verified: boolean;
  verificationType?: VerificationSealVariant;
  bio: string;
  avatar: string;
  followers: number;
  verifiedFollowers?: number;
  following: number;
  posts: number;
};

type EarnedBadge = BadgeDefinition & { slug: BadgeSlug };
type ProfilePostFilter = "posts" | "reposts" | "all";
type ActiveBadgeDrag = {
  slug: BadgeSlug;
  left: number;
  top: number;
  width: number;
  height: number;
};

const PROFILE_POSTS_PAGE_SIZE = 5;

const profilePanelBackgrounds: Record<ProfilePanelColor, string> = {
  default: "var(--surface-primary)",
  "red-tint": "var(--profile-panel-red-tint)",
  "red-solid": "var(--profile-panel-red-solid)",
  "orange-tint": "var(--profile-panel-orange-tint)",
  "orange-solid": "var(--profile-panel-orange-solid)",
  "yellow-tint": "var(--profile-panel-yellow-tint)",
  "yellow-solid": "var(--profile-panel-yellow-solid)",
  "green-tint": "var(--profile-panel-green-tint)",
  "green-solid": "var(--profile-panel-green-solid)",
  "blue-tint": "var(--profile-panel-blue-tint)",
  "blue-solid": "var(--profile-panel-blue-solid)",
  "purple-tint": "var(--profile-panel-purple-tint)",
  "purple-solid": "var(--profile-panel-purple-solid)",
  midnight: "#182a45",
  "promotion-preview": "var(--profile-panel-green-tint)"
};

function orderBadgesBySlugs(badges: EarnedBadge[], orderedSlugs: readonly string[]) {
  const badgesBySlug = new Map<string, EarnedBadge>(badges.map((badge) => [badge.slug, badge]));
  const ordered = orderedSlugs.flatMap((slug) => {
    const badge = badgesBySlug.get(slug);
    return badge ? [badge] : [];
  });
  const orderedSet = new Set(ordered.map((badge) => badge.slug));
  return [...ordered, ...badges.filter((badge) => !orderedSet.has(badge.slug))];
}

function getBadgeLayoutRect(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const transform = getComputedStyle(element).transform;
  if (transform === "none") {
    return rect;
  }

  const matrix = new DOMMatrixReadOnly(transform);
  return new DOMRect(rect.left - matrix.m41, rect.top - matrix.m42, rect.width, rect.height);
}

function getBadgeDropTarget(
  badges: Array<{ element: HTMLElement; slug: string }>,
  clientX: number,
  clientY: number,
  draggedSlug?: string,
  orderedSlugs?: readonly string[],
  draggedWidth = 0,
  draggedHeight = 0
) {
  const candidates = badges.flatMap(({ element, slug }) => {
    const bounds = getBadgeLayoutRect(element);
    const centerX = (bounds.left + bounds.right) / 2;
    const centerY = (bounds.top + bounds.bottom) / 2;
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;
    const draggedLeft = clientX - draggedWidth / 2;
    const draggedRight = clientX + draggedWidth / 2;
    const draggedTop = clientY - draggedHeight / 2;
    const draggedBottom = clientY + draggedHeight / 2;
    const overlapWidth = Math.max(0, Math.min(draggedRight, bounds.right) - Math.max(draggedLeft, bounds.left));
    const overlapHeight = Math.max(0, Math.min(draggedBottom, bounds.bottom) - Math.max(draggedTop, bounds.top));
    const overlapArea = overlapWidth * overlapHeight;
    if (overlapArea === 0 || !orderedSlugs) {
      return [];
    }

    const targetIndex = orderedSlugs.indexOf(slug);
    if (targetIndex < 0) {
      return [];
    }

    return [{
      slug,
      targetIndex,
      overlapArea,
      distance: deltaX * deltaX + deltaY * deltaY
    }];
  });

  return candidates.sort((left, right) => right.overlapArea - left.overlapArea || left.distance - right.distance)[0] ?? null;
}

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
  const { nameColor: sharedNameColor, setNameColor: setSharedNameColor } = useProfileAppearance();
  const [viewedAccountId, setViewedAccountId] = useState(initialViewedAccountId ?? owner.id);
  const [followerCountExpanded, setFollowerCountExpanded] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [developerCatalogVisible, setDeveloperCatalogVisible] = useState(false);
  const [profileCustomization, setProfileCustomization] = useState(customization);
  const [developerPreviewCustomization, setDeveloperPreviewCustomization] = useState<Partial<ProfileCustomization>>({});
  const [profilePosts, setProfilePosts] = useState(posts);
  const [profilePostFilter, setProfilePostFilter] = useState<ProfilePostFilter>("all");
  const [visibleProfilePostCount, setVisibleProfilePostCount] = useState(PROFILE_POSTS_PAGE_SIZE);
  const customizationPanelRef = useRef<HTMLElement | null>(null);
  const badgeGridRef = useRef<HTMLDivElement | null>(null);
  const previousBadgePositionsRef = useRef<Map<string, DOMRect> | null>(null);
  const pendingBadgeDragRef = useRef<{
    slug: BadgeSlug;
    pointerId: number;
    startX: number;
    startY: number;
    offsetX: number;
    offsetY: number;
    width: number;
    height: number;
    originalOrder: string[];
    currentOrder: string[];
    started: boolean;
  } | null>(null);
  const suppressBadgeClickRef = useRef(false);
  const [badgeReorderAnnouncement, setBadgeReorderAnnouncement] = useState("");
  const [activeBadgeDrag, setActiveBadgeDrag] = useState<ActiveBadgeDrag | null>(null);
  const postMutations = usePostMutations();
  const [activeBadgeSlug, setActiveBadgeSlug] = useState<string | null>(null);
  const [hoveredBadgeSlug, setHoveredBadgeSlug] = useState<string | null>(null);
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
  const profileEditRef = useRef(profileEdit);
  profileEditRef.current = profileEdit;
  const { editing } = profileEdit;
  const isOwner = viewedAccountId === owner.id;
  const account = isOwner ? { ...owner, ...profileEdit.saved } : visitor;
  const earnedBadges = isOwner ? badges : visitorBadges;
  const displayedBadges = isOwner
    ? orderBadgesBySlugs(badges.filter((badge) => profileEdit.saved.visibleBadgeSlugs.includes(badge.slug)), profileEdit.saved.visibleBadgeSlugs)
    : visitorBadges;
  const profileBadges = isOwner && editing
    ? orderBadgesBySlugs(badges, profileEdit.draft.visibleBadgeSlugs)
    : displayedBadges;
  const filteredProfilePosts = profilePosts
    .map((post) => postMutations.resolvePost(post))
    .filter((post) => !postMutations.isDeleted(post.id))
    .filter((post) => {
    const isRepost = post.repostedBy?.id === owner.id;
    if (profilePostFilter === "reposts") {
      return isRepost;
    }
    if (profilePostFilter === "posts") {
      return !isRepost;
    }
    return true;
    });
  const visibleProfilePosts = filteredProfilePosts.slice(0, visibleProfilePostCount);
  const hasMoreProfilePosts = visibleProfilePosts.length < filteredProfilePosts.length;
  const activeBadge = earnedBadges.find((badge) => badge.slug === activeBadgeSlug);
  const hoveredBadge = activeBadgeDrag ? undefined : earnedBadges.find((badge) => badge.slug === hoveredBadgeSlug);
  const draggedBadge = activeBadgeDrag ? badges.find((badge) => badge.slug === activeBadgeDrag.slug) : undefined;
  const earnedBadgeSlugs = earnedBadges.map((badge) => badge.slug);
  const lockedBadges = getLockedProfileBadges(earnedBadgeSlugs);
  const cosmeticEligibility: ProfileCosmeticEligibility = {
    earnedBadgeSlugs,
    accountAgeDays
  };
  const displayCustomization = {
    ...profileCustomization,
    nameColor: sharedNameColor,
    ...developerPreviewCustomization
  };
  const bannerBackground = backgroundStyles[displayCustomization.background];
  const nameColor = profileNameColorStyles[displayCustomization.nameColor];

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

  function selectProfilePostFilter(filter: ProfilePostFilter) {
    setProfilePostFilter(filter);
    setVisibleProfilePostCount(PROFILE_POSTS_PAGE_SIZE);
  }

  function captureBadgePositions() {
    const grid = badgeGridRef.current;
    if (!grid) {
      return;
    }

    previousBadgePositionsRef.current = new Map(
      Array.from(grid.querySelectorAll<HTMLElement>("[data-badge-slug]"))
        .flatMap((element) => element.dataset.badgeSlug
          ? [[element.dataset.badgeSlug, getBadgeLayoutRect(element)] as const]
          : [])
    );
  }

  function isEarnedBadgeSlug(slug: string): slug is BadgeSlug {
    return badges.some((badge) => badge.slug === slug);
  }

  function moveBadgeToIndex(slug: BadgeSlug, targetIndex: number, announce = true) {
    const activeDrag = pendingBadgeDragRef.current;
    const currentOrder = activeDrag?.slug === slug
      ? activeDrag.currentOrder
      : profileEditRef.current.draft.visibleBadgeSlugs;
    if (!currentOrder.includes(slug) || targetIndex < 0 || targetIndex >= currentOrder.length) {
      return;
    }

    captureBadgePositions();
    const orderedSlugs = [...currentOrder];
    orderedSlugs.splice(orderedSlugs.indexOf(slug), 1);
    orderedSlugs.splice(targetIndex, 0, slug);
    if (orderedSlugs.every((currentSlug, index) => currentSlug === currentOrder[index])) {
      previousBadgePositionsRef.current = null;
      return;
    }
    if (activeDrag?.slug === slug) {
      activeDrag.currentOrder = orderedSlugs;
    }
    dispatchProfileEdit({ type: "reorder-badge", slug, targetIndex });
    if (announce) {
      setBadgeReorderAnnouncement(`${getBadge(slug).label} moved to position ${targetIndex + 1} of ${orderedSlugs.length}.`);
    }
  }

  function moveBadgeByOffset(slug: BadgeSlug, offset: -1 | 1) {
    const currentIndex = profileEdit.draft.visibleBadgeSlugs.indexOf(slug);
    const targetIndex = currentIndex + offset;
    if (targetIndex >= 0 && targetIndex < profileEdit.draft.visibleBadgeSlugs.length) {
      moveBadgeToIndex(slug, targetIndex);
    }
  }

  function startBadgePointerDrag(event: PointerEvent<HTMLDivElement>, slug: BadgeSlug, selected: boolean) {
    if (!editing || !selected || !event.isPrimary || event.button !== 0 || (event.target as Element).closest(".badge-reorder-actions")) {
      return;
    }

    const bounds = getBadgeLayoutRect(event.currentTarget);
    const originalOrder = [...profileEditRef.current.draft.visibleBadgeSlugs];
    pendingBadgeDragRef.current = {
      slug,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      offsetX: event.clientX - bounds.left,
      offsetY: event.clientY - bounds.top,
      width: bounds.width,
      height: bounds.height,
      originalOrder,
      currentOrder: [...originalOrder],
      started: false
    };

    const handlePointerMove = (pointerEvent: globalThis.PointerEvent) => {
      const drag = pendingBadgeDragRef.current;
      if (!drag || drag.pointerId !== pointerEvent.pointerId) {
        return;
      }

      if (!drag.started && Math.hypot(pointerEvent.clientX - drag.startX, pointerEvent.clientY - drag.startY) < 5) {
        return;
      }

      pointerEvent.preventDefault();
      drag.started = true;
      setActiveBadgeDrag({
        slug: drag.slug,
        left: pointerEvent.clientX - drag.offsetX,
        top: pointerEvent.clientY - drag.offsetY,
        width: drag.width,
        height: drag.height
      });

      const currentOrder = drag.currentOrder;
      const otherBadges = Array.from(badgeGridRef.current?.querySelectorAll<HTMLElement>("[data-badge-slug]") ?? [])
        .filter((element) => currentOrder.includes(element.dataset.badgeSlug ?? ""))
        .flatMap((element) => {
          const badgeSlug = element.dataset.badgeSlug;
          return badgeSlug && currentOrder.includes(badgeSlug)
            ? [{ element, slug: badgeSlug }]
            : [];
        })
        .sort((left, right) => currentOrder.indexOf(left.slug) - currentOrder.indexOf(right.slug));
      const hoveredBadge = getBadgeDropTarget(
        otherBadges,
        pointerEvent.clientX - drag.offsetX + drag.width / 2,
        pointerEvent.clientY - drag.offsetY + drag.height / 2,
        drag.slug,
        currentOrder,
        drag.width,
        drag.height
      );
      if (hoveredBadge) {
        moveBadgeToIndex(drag.slug, hoveredBadge.targetIndex, false);
      }
    };

    const finishPointerDrag = (pointerEvent: globalThis.PointerEvent, cancelled = false) => {
      const drag = pendingBadgeDragRef.current;
      if (!drag || drag.pointerId !== pointerEvent.pointerId) {
        return;
      }

      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", finishPointerDrag);
      window.removeEventListener("pointercancel", handlePointerCancel);
      if (drag.started) {
        const currentOrder = drag.currentOrder;
        const selectedBadges = Array.from(badgeGridRef.current?.querySelectorAll<HTMLElement>("[data-badge-slug]") ?? [])
          .filter((element) => currentOrder.includes(element.dataset.badgeSlug ?? ""))
          .flatMap((element) => {
            const badgeSlug = element.dataset.badgeSlug;
            return badgeSlug && currentOrder.includes(badgeSlug)
              ? [{ element, slug: badgeSlug }]
              : [];
          })
          .sort((left, right) => currentOrder.indexOf(left.slug) - currentOrder.indexOf(right.slug));
        const finalTarget = cancelled ? null : getBadgeDropTarget(
          selectedBadges,
          pointerEvent.clientX - drag.offsetX + drag.width / 2,
          pointerEvent.clientY - drag.offsetY + drag.height / 2,
          drag.slug,
          currentOrder,
          drag.width,
          drag.height
        );
        if (finalTarget) {
          moveBadgeToIndex(drag.slug, finalTarget.targetIndex, false);
          setBadgeReorderAnnouncement(`${getBadge(drag.slug).label} moved to position ${finalTarget.targetIndex + 1} of ${currentOrder.length}.`);
        } else if (currentOrder.some((badgeSlug, index) => badgeSlug !== drag.originalOrder[index])) {
          captureBadgePositions();
          dispatchProfileEdit({ type: "restore-badge-order", slugs: drag.originalOrder });
        }

        suppressBadgeClickRef.current = true;
        setActiveBadgeDrag(null);
        window.setTimeout(() => {
          suppressBadgeClickRef.current = false;
        }, 0);
      }
      pendingBadgeDragRef.current = null;
    };
    const handlePointerCancel = (pointerEvent: globalThis.PointerEvent) => finishPointerDrag(pointerEvent, true);

    window.addEventListener("pointermove", handlePointerMove, { passive: false });
    window.addEventListener("pointerup", finishPointerDrag);
    window.addEventListener("pointercancel", handlePointerCancel);
  }

  useLayoutEffect(() => {
    const previousPositions = previousBadgePositionsRef.current;
    previousBadgePositionsRef.current = null;
    if (!previousPositions || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    badgeGridRef.current?.querySelectorAll<HTMLElement>("[data-badge-slug]:not(.badge-tile-wrap-dragging)").forEach((element) => {
      const previousPosition = previousPositions.get(element.dataset.badgeSlug ?? "");
      if (!previousPosition) {
        return;
      }

      const nextPosition = getBadgeLayoutRect(element);
      const offsetX = previousPosition.left - nextPosition.left;
      const offsetY = previousPosition.top - nextPosition.top;
      if (offsetX === 0 && offsetY === 0) {
        return;
      }

      element.animate(
        [
          { transform: `translate(${offsetX}px, ${offsetY}px)` },
          { transform: "translate(0, 0)" }
        ],
        { duration: 260, easing: "cubic-bezier(0.2, 0.75, 0.25, 1)" }
      );
    });
  }, [profileEdit.draft.visibleBadgeSlugs]);

  function repostProfilePost(originalPost: FeedPost) {
    setProfilePosts((currentPosts) => {
      if (currentPosts.some((post) => post.originalPost?.id === originalPost.id)) {
        return currentPosts;
      }

      return [{
        id: `repost-${originalPost.id}`,
        authorId: owner.id,
        createdAt: new Date().toISOString(),
        visibility: "everyone",
        repostedBy: {
          id: owner.id,
          displayName: account.displayName,
          avatar: owner.avatar,
          verified: owner.verified,
          verificationType: owner.verificationType
        },
        originalPost
      }, ...currentPosts];
    });
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

      <section
        className="profile-panel panel"
        data-profile-color={displayCustomization.profilePanelColor}
        style={{ "--profile-edit-field-background": profilePanelBackgrounds[displayCustomization.profilePanelColor] } as CSSProperties}
      >
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
                  <VerifiedSeal className="profile-verified-seal" variant={account.verificationType ?? "standard"} />
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
            {isOwner && editing ? (
              <>
                <p className="badge-edit-hint">Select badges to display, then drag selected badges to reorder them.</p>
                <p className="sr-only" aria-live="polite">{badgeReorderAnnouncement}</p>
              </>
            ) : null}
            <div className="badge-grid" ref={badgeGridRef}>
              {profileBadges
                .filter((badge) => !isOwner || editing || profileEdit.saved.visibleBadgeSlugs.includes(badge.slug))
                .map((badge) => {
                  const isSelected = profileEdit.draft.visibleBadgeSlugs.includes(badge.slug);
                  const selectable = isOwner && editing;
                  const selectedIndex = profileEdit.draft.visibleBadgeSlugs.indexOf(badge.slug);
                  const isBeingDragged = activeBadgeDrag?.slug === badge.slug;

                  return (
                    <div
                      key={badge.slug}
                      className={`badge-tile-wrap${selectable && isSelected ? " badge-tile-wrap-draggable" : ""}${isBeingDragged ? " badge-tile-wrap-dragging" : ""}`}
                      data-badge-slug={badge.slug}
                      onPointerDown={(event) => startBadgePointerDrag(event, badge.slug, isSelected)}
                      onMouseEnter={() => {
                        if (editing) {
                          setHoveredBadgeSlug(badge.slug);
                        }
                      }}
                      onMouseLeave={() => {
                        if (editing) {
                          setHoveredBadgeSlug(null);
                        }
                      }}
                      onFocusCapture={() => {
                        if (editing) {
                          setHoveredBadgeSlug(badge.slug);
                        }
                      }}
                      onBlurCapture={(event) => {
                        if (editing && !event.currentTarget.contains(event.relatedTarget as Node | null)) {
                          setHoveredBadgeSlug(null);
                        }
                      }}
                    >
                      <button
                        className={`badge-tile ${selectable ? "badge-tile-selectable" : "badge-tile-informative"} ${selectable && isSelected ? "selected" : ""}`}
                        type="button"
                        aria-label={`${badge.label}: ${badge.description}${selectable ? ` (${isSelected ? "selected" : "not selected"})` : ""}`}
                        aria-pressed={selectable ? isSelected : undefined}
                        onClick={() => {
                          if (suppressBadgeClickRef.current) {
                            suppressBadgeClickRef.current = false;
                            return;
                          }
                          if (selectable) {
                            dispatchProfileEdit({
                              type: "toggle-badge",
                              slug: badge.slug,
                              visible: !isSelected
                            });
                          } else {
                            setActiveBadgeSlug(badge.slug);
                            setIsBadgePopupClosing(false);
                          }
                        }}
                      >
                        <BadgeIcon icon={badge.icon} category={badge.category} />
                        <strong>{badge.label}</strong>
                      </button>
                      {selectable && isSelected ? (
                        <div className="badge-reorder-actions" aria-label={`Reorder ${badge.label}`}>
                          <button
                            type="button"
                            aria-label={`Move ${badge.label} earlier`}
                            disabled={selectedIndex === 0}
                            onClick={() => moveBadgeByOffset(badge.slug, -1)}
                          >
                            ↑
                          </button>
                          <button
                            type="button"
                            aria-label={`Move ${badge.label} later`}
                            disabled={selectedIndex === profileEdit.draft.visibleBadgeSlugs.length - 1}
                            onClick={() => moveBadgeByOffset(badge.slug, 1)}
                          >
                            ↓
                          </button>
                        </div>
                      ) : null}
                      {(editing ? hoveredBadge?.slug === badge.slug : activeBadge?.slug === badge.slug) ? (
                        <div className={`badge-description-popup${editing ? " edit-mode" : ""}${isBadgePopupClosing ? " closing" : ""}`} role={editing ? "tooltip" : "status"} aria-live={editing ? undefined : "polite"}>
                          <div>
                            <strong>{badge.label}</strong>
                            <p>{badge.description}</p>
                          </div>
                          {!editing ? <button type="button" aria-label="Dismiss badge details" onClick={() => setIsBadgePopupClosing(true)}>×</button> : null}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
            </div>
            {activeBadgeDrag ? (
              <div
                className="badge-drag-overlay"
                aria-hidden="true"
                style={{
                  left: activeBadgeDrag.left,
                  top: activeBadgeDrag.top,
                  width: activeBadgeDrag.width,
                  height: activeBadgeDrag.height
                }}
              >
                {draggedBadge ? (
                  <div className="badge-tile badge-tile-selectable selected">
                    <BadgeIcon icon={draggedBadge.icon} category={draggedBadge.category} />
                    <strong>{draggedBadge.label}</strong>
                  </div>
                ) : null}
              </div>
            ) : null}
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
            <div className="profile-post-filters" role="group" aria-label="Filter profile posts">
              <button
                className={profilePostFilter === "posts" ? "active" : ""}
                type="button"
                aria-pressed={profilePostFilter === "posts"}
                onClick={() => selectProfilePostFilter("posts")}
              >
                Posts
              </button>
              <button
                className={profilePostFilter === "reposts" ? "active" : ""}
                type="button"
                aria-pressed={profilePostFilter === "reposts"}
                onClick={() => selectProfilePostFilter("reposts")}
              >
                Reposts
              </button>
              <button
                className={profilePostFilter === "all" ? "active" : ""}
                type="button"
                aria-pressed={profilePostFilter === "all"}
                onClick={() => selectProfilePostFilter("all")}
              >
                All posts
              </button>
            </div>
            <div className="feed-stack">
              {visibleProfilePosts.map((post) => (
                <FeedPostCard
                  key={post.id}
                  post={post}
                  onRepost={repostProfilePost}
                  viewerId={owner.id}
                  viewerVerificationType={owner.verificationType ?? "standard"}
                />
              ))}
            </div>
            {hasMoreProfilePosts ? (
              <button
                className="profile-posts-more"
                type="button"
                onClick={() => setVisibleProfilePostCount((count) => count + PROFILE_POSTS_PAGE_SIZE)}
              >
                Show more posts
              </button>
            ) : (
              <p className="profile-posts-end" role="status">No More Posts</p>
            )}
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
                  <span className="customization-preview-name">
                    <strong style={{ color: nameColor }}>{account.displayName}</strong>
                    {account.verified ? <VerifiedSeal className="profile-verified-seal" variant={account.verificationType ?? "standard"} /> : null}
                  </span>
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
                    onSelect={(nameColor, status) => {
                      chooseCosmetic("nameColor", nameColor, status);
                      if (status === "available") {
                        setSharedNameColor(nameColor);
                      }
                    }}
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
