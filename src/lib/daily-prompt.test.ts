import { describe, expect, it } from "vitest";
import {
  getDailyPrompt,
  getPromptAchievement,
  hasPromptParticipation,
  recordPromptParticipation,
  type PromptParticipation,
} from "./daily-prompt";

describe("phase 4 daily prompts", () => {
  it("returns a positive daily prompt for the current day", () => {
    const prompt = getDailyPrompt(new Date("2026-08-19T12:00:00Z"));
    expect(prompt.question).toContain("sky");
    expect(prompt.category).toBe("observation");
    expect(prompt.timing).toBe("surprise-window");
  });

  it("records participation cumulatively without requiring a streak", () => {
    const history: PromptParticipation[] = [];
    const next = recordPromptParticipation(history, "user-1", "2026-08-18");

    expect(next.length).toBe(1);
    expect(hasPromptParticipation(next, "user-1")).toBe(true);
  });

  it("awards an achievement for participation without streak punishment", () => {
    const participation = [
      { userId: "user-1", date: "2026-08-10" },
      { userId: "user-1", date: "2026-08-18" }
    ];

    expect(getPromptAchievement(participation)).toMatchObject({
      slug: "prompt-participant"
    });
  });
});
