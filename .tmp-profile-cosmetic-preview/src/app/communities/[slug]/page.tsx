import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/social-shell";
import { PageAdRails } from "@/components/page-ad-rails";
import { demoCommunities } from "@/lib/communities";

export function generateStaticParams() {
  return demoCommunities.map((community) => ({ slug: community.slug }));
}

export default async function CommunityPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const community = demoCommunities.find((item) => item.slug === slug);

  if (!community) {
    notFound();
  }

  return (
    <AppShell viewer={{ id: "user-1", username: "calvinm", displayName: "Calvin M.", verified: true }}>
      <PageAdRails>
        <main className="community-space-page">
      <section className="community-space-hero">
        <Link className="back-link" href="/communities">← Communities</Link>
        <div className="community-space-icon">{community.name.slice(0, 2).toUpperCase()}</div>
        <div>
          <p className="eyebrow">{community.visibility} community</p>
          <h1>{community.name}</h1>
          <p className="community-description">{community.description}</p>
        </div>
        <button className="primary-action" type="button">{community.visibility === "private" ? "Request access" : "Joined"}</button>
      </section>

      <nav className="community-space-tabs" aria-label="Community sections">
        <span className="active">Overview</span>
        <span>Posts</span>
        <span>Members</span>
        <span>About</span>
      </nav>

      <section className="community-space-grid">
        <div className="panel">
          <p className="panel-label">About this space</p>
          <p className="muted">Posts, members, events, rules, and media for this community will live here.</p>
          <div className="tag-row">
            {community.tags.map((tag) => <span key={tag} className="tag">#{tag}</span>)}
          </div>
        </div>
        <div className="panel">
          <p className="panel-label">Community details</p>
          <div className="community-detail-list">
            <span><strong>{community.members.toLocaleString()}</strong> members</span>
            <span><strong>{community.moderatorCount}</strong> moderators</span>
            <span><strong>{community.verifiedOnly ? "Verified" : "Open"}</strong> participation</span>
          </div>
        </div>
      </section>
        </main>
      </PageAdRails>
    </AppShell>
  );
}
