import { CommunityDirectory } from "@/components/community-directory";
import { AppShell } from "@/components/social-shell";
import { PageAdRails } from "@/components/page-ad-rails";
import { demoCommunities } from "@/lib/communities";

export default function CommunitiesPage() {
  return (
    <AppShell viewer={{ id: "user-1", username: "calvinm", displayName: "Calvin M.", verified: true }}>
      <PageAdRails>
        <div className="directory-page">
          <CommunityDirectory communities={demoCommunities} />
        </div>
      </PageAdRails>
    </AppShell>
  );
}
