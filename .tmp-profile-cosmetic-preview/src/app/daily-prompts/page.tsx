import { AppShell } from "@/components/social-shell";
import { PromptExperience } from "@/components/prompt-experience";
import { PageAdRails } from "@/components/page-ad-rails";
import { getCurrentDailyPrompt } from "@/lib/daily-prompt";

export default function DailyPromptPage() {
  const prompt = getCurrentDailyPrompt();

  return (
    <AppShell viewer={{ id: "user-1", username: "calvinm", displayName: "Calvin M.", verified: true }}>
      <PageAdRails>
        <main className="prompt-page">
          <PromptExperience prompt={prompt} />
        </main>
      </PageAdRails>
    </AppShell>
  );
}
