import { NextResponse } from "next/server";
import { z } from "zod";
import { registerUser } from "@/lib/auth-store";

const schema = z.object({
  username: z.string().min(3),
  email: z.email(),
  password: z.string().min(8),
  displayName: z.string().min(1).optional()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.parse(body);
    const user = await registerUser(parsed);

    return NextResponse.json({
      success: true,
      user
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create account.";

    return NextResponse.json(
      {
        success: false,
        error: message
      },
      { status: 400 }
    );
  }
}
