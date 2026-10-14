import { NextResponse } from "next/server";
import { demoBadgeAsOf, demoBadgeAssignments, demoProfileCustomization, demoUsers } from "@/lib/demo-data";
import { buildProfileCustomization, getProfileBadges } from "@/lib/personalization";

export async function GET() {
  const customization = buildProfileCustomization(demoProfileCustomization);
  const demoUser = demoUsers[0];
  const badges = getProfileBadges({
    createdAt: demoUser.createdAt,
    postCount: 18,
    assignedBadgeSlugs: demoBadgeAssignments[demoUser.id],
    now: new Date(demoBadgeAsOf)
  });

  return NextResponse.json({
    customization,
    badgeDataStatus: "Demo account dates, post totals, and badge assignments; event tracking is not connected.",
    badges,
    profile: {
      displayName: "Calvin M.",
      username: "calvinm",
      verified: true,
      bio: "Building a calmer internet."
    }
  });
}
