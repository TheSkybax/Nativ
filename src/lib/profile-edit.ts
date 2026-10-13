export type EditableProfileDetails = {
  displayName: string;
  bio: string;
};

export type ProfileEditState = {
  saved: EditableProfileDetails;
  draft: EditableProfileDetails;
  editing: boolean;
};

export type ProfileEditAction =
  | { type: "open" }
  | { type: "change"; field: keyof EditableProfileDetails; value: string }
  | { type: "save" }
  | { type: "cancel" };

export function createProfileEditState(details: EditableProfileDetails): ProfileEditState {
  return {
    saved: details,
    draft: details,
    editing: false
  };
}

export function profileEditReducer(state: ProfileEditState, action: ProfileEditAction): ProfileEditState {
  switch (action.type) {
    case "open":
      return {
        ...state,
        draft: { ...state.saved },
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
    case "save": {
      if (!state.editing) {
        return state;
      }

      const unchanged =
        state.draft.displayName === state.saved.displayName &&
        state.draft.bio === state.saved.bio;
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
        draft: state.saved,
        editing: false
      };
  }
}
