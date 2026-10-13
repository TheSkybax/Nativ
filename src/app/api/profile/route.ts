import { NextResponse } from "next/server";
import { demoBadges, demoProfileCustomization } from "@/lib/demo-data";
import { buildProfileCustomization, getAccountAgeBadge, getFounderBadge } from "@/lib/personalization";

export async function GET() {
  const customization = buildProfileCustomization(demoProfileCustomization);

  return NextResponse.json({
    customization,
    badges: [
      getFounderBadge(250),
      getAccountAgeBadge("2024-08-18T00:00:00Z", new Date("2026-08-18T00:00:00Z")),
      ...demoBadges
    ].filter(Boolean),
    profile: {
      displayName: "Calvin M.",
      username: "calvinm",
      verified: true,
      bio: "Building a calmer internet."
    }
  });
}
