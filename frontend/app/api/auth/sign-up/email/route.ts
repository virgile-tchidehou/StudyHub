import { NextResponse } from "next/server";
import { findUserByEmail, createUser, createSession } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { name, email, password } = body;

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Nom, email et mot de passe sont requis" },
        { status: 400 }
      );
    }

    let user = findUserByEmail(email);
    if (!user) {
      user = createUser(name, email);
    }

    const token = createSession(user.id);
    const response = NextResponse.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });

    response.cookies.set("better-auth.session_token", token, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 86400 * 7,
    });

    return response;
  } catch (err) {
    console.error("Sign up error:", err);
    return NextResponse.json({ error: "Echec d'inscription" }, { status: 500 });
  }
}
