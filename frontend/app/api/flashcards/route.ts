import { NextResponse } from "next/server";
import { getFlashcards, toggleFlashcardMastered } from "@/lib/store";

export async function GET() {
  return NextResponse.json(getFlashcards());
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: "Flashcard ID required" }, { status: 400 });
    }
    const card = toggleFlashcardMastered(body.id);
    return NextResponse.json(card);
  } catch (err) {
    return NextResponse.json({ error: "Failed to update flashcard" }, { status: 500 });
  }
}
