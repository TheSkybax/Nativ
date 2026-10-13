import { NextResponse } from "next/server";
import { z } from "zod";
import { authenticateUser } from "@/lib/auth-store";

const schema = z.object({
  username: z.string().min(1),
  password: z.string().min(8)
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.parse(body);
    const user = await authenticateUser(parsed);

    return NextResponse.json({
      success: true,
      user
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to sign in.";

    return NextResponse.json(
      {
        success: false,
        error: message
      },
      { status: 401 }
    );
  }
}
