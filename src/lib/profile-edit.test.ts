import { describe, expect, it } from "vitest";
import { createProfileEditState, profileEditReducer } from "./profile-edit";

const savedProfile = {
  displayName: "Calvin M.",
  bio: "Photographer, maker, and weekend walker."
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
      saved: { displayName: "Calvin", bio: "Photographer and maker." },
      draft: { displayName: "Calvin", bio: "Photographer and maker." },
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
