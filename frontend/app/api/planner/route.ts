import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserIdFromSession, getPlannerTasks, createPlannerTask, togglePlannerTask } from "@/lib/store";

export async function GET() {
  const token = cookies().get("better-auth.session_token")?.value;
  const userId = getUserIdFromSession(token);
  return NextResponse.json(getPlannerTasks(userId));
}

export async function POST(request: Request) {
  try {
    const token = cookies().get("better-auth.session_token")?.value;
    const userId = getUserIdFromSession(token);
    const body = await request.json();

    if (!body.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const task = createPlannerTask(userId, {
      title: body.title,
      category: body.category || "english",
      durationMinutes: body.durationMinutes || 30,
      dueDate: body.dueDate || new Date().toISOString().split("T")[0],
    });

    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create planner task" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }
    const updated = togglePlannerTask(body.id);
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}
