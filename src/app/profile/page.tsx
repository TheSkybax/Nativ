import { AppShell } from "@/components/social-shell";
import { ProfileSpace } from "@/components/profile-space";
import { PageAdRails } from "@/components/page-ad-rails";
import { demoProfileCustomization, demoUsers } from "@/lib/demo-data";
import {
  badgeCatalog,
  buildProfileCustomization,
  getAccountAgeBadge,
  getFounderBadge
} from "@/lib/personalization";

export default async function ProfilePage({
  searchParams
}: {
  searchParams: Promise<{ user?: string }>;
}) {
  const params = await searchParams;
  const customization = buildProfileCustomization(demoProfileCustomization);
  const founderBadge = getFounderBadge(250);
  const ageBadge = getAccountAgeBadge("2024-08-18T00:00:00Z", new Date("2026-08-18T00:00:00Z"));
  const earnedSlugs = new Set([founderBadge?.slug, ageBadge?.slug, "creator", "contributor"]);
  const badges = badgeCatalog.filter((badge) => earnedSlugs.has(badge.slug));
  const owner = {
    ...demoUsers[0],
    followers: 12,
    following: 73,
    posts: 18
  };
  const visitor = {
    ...demoUsers[1],
    followers: 248,
    following: 91,
    posts: 42
  };

  return (
    <AppShell viewer={{ id: owner.id, username: owner.username, displayName: owner.displayName, verified: owner.verified }}>
      <PageAdRails>
        <ProfileSpace owner={owner} visitor={visitor} customization={customization} badges={badges} initialViewedAccountId={params.user === visitor.id ? visitor.id : owner.id} />
      </PageAdRails>
    </AppShell>
  );
}
