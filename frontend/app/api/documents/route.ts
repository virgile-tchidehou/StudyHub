import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserIdFromSession, getDocuments, createDocument } from "@/lib/store";

export async function GET() {
  const token = cookies().get("better-auth.session_token")?.value;
  const userId = getUserIdFromSession(token);
  const docs = getDocuments(userId);
  return NextResponse.json(docs);
}

export async function POST(request: Request) {
  try {
    const token = cookies().get("better-auth.session_token")?.value;
    const userId = getUserIdFromSession(token);
    const body = await request.json();

    if (!body.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const doc = createDocument(userId, {
      title: body.title,
      type: body.type,
      status: body.status,
      content: body.content,
      universityId: body.universityId,
    });

    return NextResponse.json(doc, { status: 201 });
  } catch (err) {
    console.error("Create document error:", err);
    return NextResponse.json({ error: "Failed to create document" }, { status: 500 });
  }
}
