import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getUserIdFromSession, getUniversities, createUniversity } from "@/lib/store";

export async function GET() {
  const token = cookies().get("better-auth.session_token")?.value;
  const userId = getUserIdFromSession(token);
  const unis = getUniversities(userId);
  return NextResponse.json(unis);
}

export async function POST(request: Request) {
  try {
    const token = cookies().get("better-auth.session_token")?.value;
    const userId = getUserIdFromSession(token);
    const body = await request.json();

    if (!body.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const uni = createUniversity(userId, {
      name: body.name,
      country: body.country,
      ranking: body.ranking,
      requirements: body.requirements,
      deadlines: body.deadlines,
      website: body.website,
      description: body.description,
    });

    return NextResponse.json(uni, { status: 201 });
  } catch (err) {
    console.error("Create university error:", err);
    return NextResponse.json({ error: "Failed to create university" }, { status: 500 });
  }
}
