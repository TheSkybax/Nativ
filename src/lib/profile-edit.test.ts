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
