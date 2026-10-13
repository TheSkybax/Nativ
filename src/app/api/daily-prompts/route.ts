import { NextResponse } from "next/server";
import { getDailyPrompt, getPromptAchievement, recordPromptParticipation } from "@/lib/daily-prompt";

export async function GET() {
  const date = new Date("2026-08-18T12:00:00Z");
  const history = [
    { userId: "user-1", date: "2026-08-10" },
    { userId: "user-1", date: "2026-08-18" }
  ];

  return NextResponse.json({
    prompt: getDailyPrompt(date),
    participation: recordPromptParticipation(history, "user-1", "2026-08-18"),
    achievement: getPromptAchievement(history)
  });
}
