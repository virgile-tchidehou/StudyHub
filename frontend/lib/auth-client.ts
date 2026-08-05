export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthResponse = {
  token?: string;
  user?: {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
  };
};

// Auth calls use relative paths — proxied by Next.js rewrites to the Express backend.
export const API_BASE = "";

async function post(path: string, body: unknown) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || data?.error || "Request failed");
  }
  return res.json() as Promise<AuthResponse>;
}

export const authApi = {
  signInWithEmail: (payload: LoginPayload) =>
    post("/api/auth/sign-in/email", payload),

  signUpWithEmail: (payload: LoginPayload & { name: string }) =>
    post("/api/auth/sign-up/email", payload),

  signOut: () => {
    return fetch(`${API_BASE}/api/auth/sign-out`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    }).then(async (res) => {
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.message || data?.error || "Sign out failed");
      }
      return true;
    });
  },
};
