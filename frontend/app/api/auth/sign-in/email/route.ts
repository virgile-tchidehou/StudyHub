import { NextResponse } from "next/server";
import { findUserByEmail, createUser, createSession } from "@/lib/store";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    let user = findUserByEmail(email);
    if (!user) {
      // Auto-register for smooth onboarding in demo mode if email doesn't exist
      const defaultName = email.split("@")[0] || "Etudiant";
      user = createUser(defaultName, email);
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
    console.error("Sign in error:", err);
    return NextResponse.json({ error: "Echec de connexion" }, { status: 500 });
  }
}
