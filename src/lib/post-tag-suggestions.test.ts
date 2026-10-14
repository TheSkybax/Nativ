import { describe, expect, it } from "vitest";
import { getPopularTagSuggestions } from "./post-tag-suggestions";

describe("popular post tag suggestions", () => {
  it("ranks popular tags that match words in the post", () => {
    expect(getPopularTagSuggestions("A photo walk through the market with six frames and a good conversation.")).toEqual([
      "photography",
      "community"
    ]);
  });

  it("does not suggest unrelated tags", () => {
    expect(getPopularTagSuggestions("A quiet weekend reading at home.")).toEqual([]);
  });

  it("respects the maximum suggestion count", () => {
    expect(getPopularTagSuggestions("A creative photography community project with local open source tools and design.", 3))
      .toHaveLength(3);
  });
});
