import { NextResponse } from "next/server";
import { getScholarships, createScholarship } from "@/lib/store";

export async function GET() {
  return NextResponse.json(getScholarships());
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    const item = createScholarship({
      name: body.name,
      organization: body.organization || "Organisme de bourse",
      amount: body.amount || "Variable",
      deadline: body.deadline || "A venir",
      coverage: body.coverage || "Prise en charge partielle",
      country: body.country || "International",
      status: body.status || "eligible",
      link: body.link || "#",
    });
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create scholarship" }, { status: 500 });
  }
}
