export type EditableProfileDetails = {
  displayName: string;
  bio: string;
  visibleBadgeSlugs: string[];
};

export type ProfileEditState = {
  saved: EditableProfileDetails;
  draft: EditableProfileDetails;
  editing: boolean;
};

export type ProfileEditAction =
  | { type: "open" }
  | { type: "change"; field: "displayName" | "bio"; value: string }
  | { type: "toggle-badge"; slug: string; visible: boolean }
  | { type: "save" }
  | { type: "cancel" };

export function createProfileEditState(details: EditableProfileDetails): ProfileEditState {
  const saved = { ...details, visibleBadgeSlugs: [...details.visibleBadgeSlugs] };

  return {
    saved,
    draft: { ...saved, visibleBadgeSlugs: [...saved.visibleBadgeSlugs] },
    editing: false
  };
}

export function profileEditReducer(state: ProfileEditState, action: ProfileEditAction): ProfileEditState {
  switch (action.type) {
    case "open":
      return {
        ...state,
        draft: { ...state.saved, visibleBadgeSlugs: [...state.saved.visibleBadgeSlugs] },
        editing: true
      };
    case "change":
      if (!state.editing) {
        return state;
      }

      return {
        ...state,
        draft: { ...state.draft, [action.field]: action.value }
      };
    case "toggle-badge":
      if (!state.editing || state.draft.visibleBadgeSlugs.includes(action.slug) === action.visible) {
        return state;
      }

      return {
        ...state,
        draft: {
          ...state.draft,
          visibleBadgeSlugs: action.visible
            ? [...state.draft.visibleBadgeSlugs, action.slug]
            : state.draft.visibleBadgeSlugs.filter((slug) => slug !== action.slug)
        }
      };
    case "save": {
      if (!state.editing) {
        return state;
      }

      const unchanged =
        state.draft.displayName === state.saved.displayName &&
        state.draft.bio === state.saved.bio &&
        state.draft.visibleBadgeSlugs.length === state.saved.visibleBadgeSlugs.length &&
        state.draft.visibleBadgeSlugs.every((slug) => state.saved.visibleBadgeSlugs.includes(slug));
      const saved = unchanged ? state.saved : state.draft;

      return {
        saved,
        draft: saved,
        editing: false
      };
    }
    case "cancel":
      return {
        saved: state.saved,
        draft: { ...state.saved, visibleBadgeSlugs: [...state.saved.visibleBadgeSlugs] },
        editing: false
      };
  }
}
