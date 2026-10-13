export type PromptParticipation = {
  userId: string;
  date: string;
};

export type DailyPrompt = {
  id: string;
  category: "current-moment" | "environment" | "observation" | "object" | "creative-interpretation";
  question: string;
  date: string;
  timing: "surprise-window";
};

export type PromptResponsePreview = {
  userId: string;
  displayName: string;
  text: string;
};

export type PromptAchievement = {
  slug: string;
  label: string;
  description: string;
  level: "bronze" | "silver" | "gold";
};

const promptBank = [
  {
    id: "prompt-1",
    category: "environment",
    question: "Show us the view from the nearest window.",
    dateKey: "2026-08-18"
  },
  {
    id: "prompt-2",
    category: "observation",
    question: "Show us the sky where you are right now.",
    dateKey: "2026-08-19"
  },
  {
    id: "prompt-3",
    category: "object",
    question: "Photograph the object closest to you.",
    dateKey: "2026-08-20"
  },
  {
    id: "prompt-4",
    category: "current-moment",
    question: "What are you doing right now?",
    dateKey: "2026-08-21"
  },
  {
    id: "prompt-5",
    category: "creative-interpretation",
    question: "Take a photo that represents your mood right now.",
    dateKey: "2026-08-22"
  }
] as const;

export function getDailyPrompt(date: Date): DailyPrompt {
  const dateKey = date.toISOString().slice(0, 10);
  const prompt =
    promptBank.find((item) => item.dateKey === dateKey) ??
    promptBank[0];

  return {
    id: prompt.id,
    category: prompt.category,
    question: prompt.question,
    date: dateKey,
    timing: "surprise-window"
  };
}

export function getCurrentDailyPrompt() {
  return getDailyPrompt(new Date("2026-08-19T12:00:00Z"));
}

export const promptResponsePreviews: PromptResponsePreview[] = [
  {
    userId: "user-2",
    displayName: "Dragonfire",
    text: "My desk has somehow become even more chaotic."
  },
  {
    userId: "user-3",
    displayName: "Horizon",
    text: "The sky looked completely different five minutes ago."
  },
  {
    userId: "user-1",
    displayName: "Calvin M.",
    text: "A quiet corner and the first coffee of the morning."
  }
];

export function recordPromptParticipation(
  history: PromptParticipation[],
  userId: string,
  date: string
) {
  const existing = history.some(
    (entry) => entry.userId === userId && entry.date === date
  );

  if (existing) {
    return history;
  }

  return [...history, { userId, date }];
}

export function hasPromptParticipation(
  history: PromptParticipation[],
  userId: string
) {
  return history.some((entry) => entry.userId === userId);
}

export function getPromptAchievement(
  history: PromptParticipation[]
): PromptAchievement | null {
  const total = new Set(history.map((entry) => `${entry.userId}:${entry.date}`)).size;

  if (total >= 3) {
    return {
      slug: "prompt-participant",
      label: "Prompt Participant",
      description: "Cumulative participation in community prompts and reflection activities.",
      level: "gold"
    };
  }

  if (total >= 1) {
    return {
      slug: "prompt-participant",
      label: "Prompt Participant",
      description: "Cumulative participation in community prompts and reflection activities.",
      level: "bronze"
    };
  }

  return null;
}
