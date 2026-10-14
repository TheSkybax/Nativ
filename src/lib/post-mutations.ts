export type PostMutationState<TPost> = {
  updates: Record<string, Partial<TPost>>;
  deletedIds: string[];
};

export type PostMutationAction<TPost> =
  | { type: "update"; id: string; changes: Partial<TPost> }
  | { type: "delete"; id: string };

export function createPostMutationState<TPost>(): PostMutationState<TPost> {
  return { updates: {}, deletedIds: [] };
}

export function postMutationReducer<TPost>(
  state: PostMutationState<TPost>,
  action: PostMutationAction<TPost>
): PostMutationState<TPost> {
  if (action.type === "update") {
    if (state.deletedIds.includes(action.id)) {
      return state;
    }

    return {
      ...state,
      updates: {
        ...state.updates,
        [action.id]: { ...state.updates[action.id], ...action.changes }
      }
    };
  }

  return state.deletedIds.includes(action.id)
    ? state
    : { ...state, deletedIds: [...state.deletedIds, action.id] };
}
