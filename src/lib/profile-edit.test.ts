import { describe, expect, it } from "vitest";
import { createProfileEditState, profileEditReducer } from "./profile-edit";

const savedProfile = {
  displayName: "Calvin M.",
  bio: "Photographer, maker, and weekend walker.",
  visibleBadgeSlugs: ["founder", "one-year", "first-post", "first-conversation"]
};

describe("profile editing", () => {
  it("opens with the saved display name and About text", () => {
    const state = createProfileEditState(savedProfile);
    const editing = profileEditReducer(state, { type: "open" });

    expect(editing).toEqual({
      saved: savedProfile,
      draft: savedProfile,
      editing: true
    });
  });

  it("saves edited display name and About text", () => {
    const editing = profileEditReducer(createProfileEditState(savedProfile), { type: "open" });
    const changedName = profileEditReducer(editing, {
      type: "change",
      field: "displayName",
      value: "Calvin"
    });
    const changedBio = profileEditReducer(changedName, {
      type: "change",
      field: "bio",
      value: "Photographer and maker."
    });

    expect(profileEditReducer(changedBio, { type: "save" })).toEqual({
      saved: { ...savedProfile, displayName: "Calvin", bio: "Photographer and maker." },
      draft: { ...savedProfile, displayName: "Calvin", bio: "Photographer and maker." },
      editing: false
    });
  });

  it("discards draft changes when cancelled", () => {
    const editing = profileEditReducer(createProfileEditState(savedProfile), { type: "open" });
    const changed = profileEditReducer(editing, {
      type: "change",
      field: "bio",
      value: "Unsaved About text."
    });

    expect(profileEditReducer(changed, { type: "cancel" })).toEqual({
      saved: savedProfile,
      draft: savedProfile,
      editing: false
    });
  });

  it("saves the selected badges", () => {
    const editing = profileEditReducer(createProfileEditState(savedProfile), { type: "open" });
    const updatedSelection = profileEditReducer(editing, {
      type: "toggle-badge",
      slug: "one-year",
      visible: false
    });

    expect(profileEditReducer(updatedSelection, { type: "save" }).saved).toEqual({
      ...savedProfile,
      visibleBadgeSlugs: ["founder", "first-post", "first-conversation"]
    });
  });

  it("reorders visible badges in the draft and saves the new order", () => {
    const editing = profileEditReducer(createProfileEditState(savedProfile), { type: "open" });
    const reordered = profileEditReducer(editing, {
      type: "reorder-badge",
      slug: "first-conversation",
      targetIndex: 1
    });

    expect(reordered.draft.visibleBadgeSlugs).toEqual([
      "founder",
      "first-conversation",
      "one-year",
      "first-post"
    ]);
    expect(profileEditReducer(reordered, { type: "save" }).saved.visibleBadgeSlugs).toEqual(reordered.draft.visibleBadgeSlugs);
  });

  it("moves a badge to the hovered badge position when dragging forward", () => {
    const editing = profileEditReducer(createProfileEditState(savedProfile), { type: "open" });
    const reordered = profileEditReducer(editing, {
      type: "reorder-badge",
      slug: "founder",
      targetIndex: 2
    });
    expect(reordered.draft.visibleBadgeSlugs).toEqual([
      "one-year",
      "first-post",
      "founder",
      "first-conversation"
    ]);
  });

  it("restores the original badge order after an invalid drag", () => {
    const editing = profileEditReducer(createProfileEditState(savedProfile), { type: "open" });
    const reordered = profileEditReducer(editing, {
      type: "reorder-badge",
      slug: "first-conversation",
      targetIndex: 0
    });
    const restored = profileEditReducer(reordered, {
      type: "restore-badge-order",
      slugs: [...savedProfile.visibleBadgeSlugs]
    });

    expect(restored.draft.visibleBadgeSlugs).toEqual(savedProfile.visibleBadgeSlugs);
  });

  it("treats a badge reorder as a profile edit", () => {
    const editing = profileEditReducer(createProfileEditState(savedProfile), { type: "open" });
    const reordered = profileEditReducer(editing, {
      type: "reorder-badge",
      slug: "first-conversation",
      targetIndex: 1
    });

    expect(profileEditReducer(reordered, { type: "save" }).saved).not.toBe(editing.saved);
  });

  it("ignores badge reorders when not editing or when either badge is hidden", () => {
    const initial = createProfileEditState(savedProfile);
    expect(profileEditReducer(initial, {
      type: "reorder-badge",
      slug: "one-year",
      targetIndex: 2
    })).toBe(initial);

    const editing = profileEditReducer(initial, { type: "open" });
    expect(profileEditReducer(editing, {
      type: "reorder-badge",
      slug: "missing",
      targetIndex: 1
    })).toBe(editing);
    expect(profileEditReducer(editing, {
      type: "reorder-badge",
      slug: "founder",
      targetIndex: savedProfile.visibleBadgeSlugs.length
    })).toBe(editing);
  });

  it("discards badge display changes when cancelled", () => {
    const editing = profileEditReducer(createProfileEditState(savedProfile), { type: "open" });
    const hiddenBadge = profileEditReducer(editing, {
      type: "toggle-badge",
      slug: "first-conversation",
      visible: false
    });

    expect(profileEditReducer(hiddenBadge, { type: "cancel" }).saved).toEqual(savedProfile);
  });

  it("saves without changing saved values when there are no edits", () => {
    const state = createProfileEditState(savedProfile);
    const editing = profileEditReducer(state, { type: "open" });
    const saved = profileEditReducer(editing, { type: "save" });

    expect(saved.saved).toBe(state.saved);
    expect(saved).toEqual({
      saved: savedProfile,
      draft: savedProfile,
      editing: false
    });
  });
});
