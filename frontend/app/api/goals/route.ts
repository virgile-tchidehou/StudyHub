import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserIdFromSession, getGoals, createGoal } from "@/lib/store";

export async function GET() {
  const token = cookies().get("better-auth.session_token")?.value;
  const userId = getUserIdFromSession(token);
  const goals = getGoals(userId);
  return NextResponse.json(goals);
}

export async function POST(request: Request) {
  try {
    const token = cookies().get("better-auth.session_token")?.value;
    const userId = getUserIdFromSession(token);
    const body = await request.json();

    if (!body.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const goal = createGoal(userId, {
      title: body.title,
      description: body.description,
      targetDate: body.targetDate,
    });

    return NextResponse.json(goal, { status: 201 });
  } catch (err) {
    console.error("Create goal error:", err);
    return NextResponse.json({ error: "Failed to create goal" }, { status: 500 });
  }
}
