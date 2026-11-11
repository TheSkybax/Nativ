import { Suspense } from "react";
import { AppShell } from "@/components/social-shell";
import { ProfileViewer } from "@/components/profile-viewer";
import { PageAdRails } from "@/components/page-ad-rails";
import { demoBadgeAsOf, demoBadgeAssignments, demoPosts, demoProfileCustomization, demoUsers, getDemoPrimaryBadge } from "@/lib/demo-data";
import {
  buildProfileCustomization,
  getAccountAgeDays,
  getProfileBadges,
  isDeveloperCosmeticsPreviewEnabled
} from "@/lib/personalization";

export default async function ProfilePage() {
  const customization = buildProfileCustomization(demoProfileCustomization);
  const owner = {
    ...demoUsers[0],
    followers: 12,
    verifiedFollowers: 8,
    following: 73,
    posts: 18
  };
  const visitor = {
    ...demoUsers[1],
    followers: 248,
    following: 91,
    posts: 42
  };
  const ownerPosts = demoPosts
    .filter((post) => post.authorId === owner.id)
    .map((post) => ({
      ...post,
      text: post.text ?? "",
      contentType: "text" as const
    }));
  const demoNow = new Date(demoBadgeAsOf);
  const developerCosmeticsPreview = isDeveloperCosmeticsPreviewEnabled(
    process.env.NODE_ENV,
    process.env.NATIV_PROFILE_COSMETICS_PREVIEW
  );
  const badges = getProfileBadges({
    createdAt: owner.createdAt,
    postCount: owner.posts,
    assignedBadgeSlugs: demoBadgeAssignments[owner.id],
    now: demoNow
  });
  const visitorBadges = getProfileBadges({
    createdAt: visitor.createdAt,
    postCount: visitor.posts,
    assignedBadgeSlugs: demoBadgeAssignments[visitor.id],
    now: demoNow
  });
  return (
    <AppShell viewer={{ id: owner.id, username: owner.username, displayName: owner.displayName, verified: owner.verified, verificationType: owner.verificationType, badge: getDemoPrimaryBadge(owner.id) }}>
      <PageAdRails>
        <Suspense fallback={null}>
          <ProfileViewer
            owner={owner}
            visitor={visitor}
            customization={customization}
            badges={badges}
            visitorBadges={visitorBadges}
            posts={ownerPosts}
            accountAgeDays={getAccountAgeDays(owner.createdAt, demoNow)}
            developerCosmeticsPreview={developerCosmeticsPreview}
          />
        </Suspense>
      </PageAdRails>
    </AppShell>
  );
}
