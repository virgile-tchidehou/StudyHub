import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserIdFromSession, updateGoal, deleteGoal } from "@/lib/store";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = cookies().get("better-auth.session_token")?.value;
    const userId = getUserIdFromSession(token);
    const body = await request.json();

    const updated = updateGoal(userId, params.id, body);
    if (!updated) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("Update goal error:", err);
    return NextResponse.json({ error: "Failed to update goal" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = cookies().get("better-auth.session_token")?.value;
    const userId = getUserIdFromSession(token);

    const deleted = deleteGoal(userId, params.id);
    if (!deleted) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("Delete goal error:", err);
    return NextResponse.json({ error: "Failed to delete goal" }, { status: 500 });
  }
}
