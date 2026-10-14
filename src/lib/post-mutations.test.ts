import { describe, expect, it } from "vitest";
import { createPostMutationState, postMutationReducer } from "./post-mutations";

type TestPost = { text: string; tags: string[]; visibility: string };

describe("post mutation state", () => {
  it("applies edits to existing posts without mutating the source state", () => {
    const initial = createPostMutationState<TestPost>();
    const updated = postMutationReducer(initial, {
      type: "update",
      id: "post-1",
      changes: { text: "Edited", tags: ["community"], visibility: "followers" }
    });

    expect(updated.updates["post-1"]).toEqual({
      text: "Edited",
      tags: ["community"],
      visibility: "followers"
    });
    expect(initial.updates).toEqual({});
  });

  it("does not allow deleted posts to be updated", () => {
    const deleted = postMutationReducer(createPostMutationState<TestPost>(), {
      type: "delete",
      id: "post-1"
    });

    expect(postMutationReducer(deleted, {
      type: "update",
      id: "post-1",
      changes: { text: "Should not return" }
    })).toBe(deleted);
  });

  it("deletes a post only once", () => {
    const deleted = postMutationReducer(createPostMutationState<TestPost>(), {
      type: "delete",
      id: "post-1"
    });

    expect(postMutationReducer(deleted, { type: "delete", id: "post-1" })).toBe(deleted);
    expect(deleted.deletedIds).toEqual(["post-1"]);
  });
});
