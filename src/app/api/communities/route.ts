import { NextResponse } from "next/server";
import { demoCommunities } from "@/lib/communities";

export async function GET() {
  return NextResponse.json({
    communities: demoCommunities,
    notice: "Communities are intentionally modular and future-ready for rules, moderation, and verified-only participation settings."
  });
}
