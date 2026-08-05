import { NextResponse } from "next/server";
import { getResources } from "@/lib/store";

export async function GET() {
  return NextResponse.json(getResources());
}
