// API calls use relative paths — Next.js rewrites proxy them to the Express backend.
export const API_BASE = "";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers as Record<string, string> || {}),
  };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers, credentials: "include" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || data?.error || `Request failed (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export type Goal = { id: string; title: string; description: string | null; category?: string; target_date: string | null; progress: number; completed: boolean; user_id: string; created_at: string; updated_at: string };
export type University = { id: string; name: string; country: string | null; description: string | null; website: string | null; ranking: number | null; requirements: string | null; deadlines: string | null; application_status?: "researching" | "preparing" | "submitted" | "accepted" | "rejected"; user_id: string; created_at: string; updated_at: string };
export type DocumentItem = { id: string; title: string; type: string | null; status: string; content: string | null; file_path: string | null; expires_at: string | null; user_id: string; university_id: string | null; created_at: string; updated_at: string };
export type Scholarship = { id: string; name: string; organization: string; amount: string; deadline: string; coverage: string; country: string; field_of_study?: string; status: "eligible" | "saved" | "applied" | "awarded"; link: string };
export type PlannerTask = { id: string; title: string; category: "english" | "technical" | "document" | "university"; duration_minutes?: number; durationMinutes?: number; due_date?: string; dueDate?: string; completed: boolean; user_id: string };
export type ResourceItem = { id: string; title: string; category: "MOOC" | "Book" | "Guide" | "YouTube" | "PDF" | "Template"; url: string; description: string; tags: string[] };
export type Flashcard = { id: string; word: string; phonetic: string; definition: string; example: string; category: "IELTS Academic" | "GRE/GMAT" | "TOEFL" | "Technical English"; mastered: boolean };
export type TechnicalProgressNode = { track_id: string; node_id: string; status: string };

export type StudyProfile = { target_degree: string | null; field_of_study: string | null; target_countries: string[]; current_gpa: string | null; target_ielts: string | null; updated_at?: string };
export type AIMode = "english_coach" | "technical_mentor" | "interview" | "general";
export type AIProvider = "gemini" | "groq" | "auto";
export type AIHistoryMessage = { role: "user" | "assistant"; content: string };
export type AIResponse = { text: string; provider: string; notice?: string };

export const profileApi = {
  get: () => request<StudyProfile>("/api/profile"),
  update: (body: Partial<StudyProfile>) => request<StudyProfile>("/api/profile", { method: "PUT", body: JSON.stringify(body) }),
};

export const goalsApi = { list: () => request<Goal[]>("/api/goals"), create: (body: { title: string; description?: string; category?: string; targetDate?: string }) => request<Goal>("/api/goals", { method: "POST", body: JSON.stringify(body) }), update: (id: string, body: Partial<Goal>) => request<Goal>(`/api/goals/${id}`, { method: "PATCH", body: JSON.stringify(body) }), remove: (id: string) => request<void>(`/api/goals/${id}`, { method: "DELETE" }) };
export const universitiesApi = { list: () => request<University[]>("/api/universities"), getById: (id: string) => request<University>(`/api/universities/${id}`), create: (body: { name: string; country?: string; ranking?: number; requirements?: string; deadlines?: string; website?: string; application_status?: string }) => request<University>("/api/universities", { method: "POST", body: JSON.stringify(body) }), update: (id: string, body: Partial<University>) => request<University>(`/api/universities/${id}`, { method: "PATCH", body: JSON.stringify(body) }), remove: (id: string) => request<void>(`/api/universities/${id}`, { method: "DELETE" }) };
export const documentsApi = {
  list: () => request<DocumentItem[]>("/api/documents"), getById: (id: string) => request<DocumentItem>(`/api/documents/${id}`),
  create: (body: { title: string; type?: string; status?: string; content?: string; university_id?: string | null }, file?: File) => { const formData = new FormData(); formData.append('title', body.title); if (body.type) formData.append('type', body.type); if (body.status) formData.append('status', body.status); if (body.content) formData.append('content', body.content); if (body.university_id != null) formData.append('universityId', body.university_id); if (file) formData.append('file', file); return request<DocumentItem>("/api/documents", { method: "POST", body: formData }); },
  update: (id: string, body: Partial<DocumentItem>, file?: File) => { const formData = new FormData(); if (body.title != null) formData.append('title', body.title); if (body.type != null) formData.append('type', body.type); if (body.status != null) formData.append('status', body.status); if (body.content != null) formData.append('content', body.content); if (body.university_id != null) formData.append('universityId', body.university_id); if (file) formData.append('file', file); return request<DocumentItem>(`/api/documents/${id}`, { method: "PATCH", body: formData }); },
  remove: (id: string) => request<void>(`/api/documents/${id}`, { method: "DELETE" }),
};
export const scholarshipsApi = { list: () => request<Scholarship[]>("/api/scholarships"), create: (body: Partial<Scholarship>) => request<Scholarship>("/api/scholarships", { method: "POST", body: JSON.stringify(body) }), update: (id: string, body: Partial<Scholarship>) => request<Scholarship>(`/api/scholarships/${id}`, { method: "PATCH", body: JSON.stringify(body) }), remove: (id: string) => request<void>(`/api/scholarships/${id}`, { method: "DELETE" }), aiSearch: (params: { field?: string; country?: string; level?: string }) => request<{ results: Partial<Scholarship>[] }>("/api/scholarships/ai-search", { method: "POST", body: JSON.stringify(params) }) };
export const plannerApi = { list: () => request<PlannerTask[]>("/api/planner"), create: (body: { title: string; category?: string; durationMinutes?: number; dueDate?: string }) => request<PlannerTask>("/api/planner", { method: "POST", body: JSON.stringify(body) }), toggle: (id: string) => request<PlannerTask>("/api/planner", { method: "PATCH", body: JSON.stringify({ id }) }), remove: (id: string) => request<void>(`/api/planner/${id}`, { method: "DELETE" }) };
export const resourcesApi = { list: () => request<ResourceItem[]>("/api/resources"), create: (body: Partial<ResourceItem>) => request<ResourceItem>("/api/resources", { method: "POST", body: JSON.stringify(body) }) };
export const flashcardsApi = { list: () => request<Flashcard[]>("/api/flashcards"), toggleMastered: (id: string) => request<Flashcard>("/api/flashcards", { method: "PATCH", body: JSON.stringify({ id })) };
export const technicalApi = { getProgress: () => request<TechnicalProgressNode[]>("/api/technical/progress"), toggleNode: (trackId: string, nodeId: string) => request<{ trackId: string; nodeId: string; status: string }>("/api/technical/toggle", { method: "POST", body: JSON.stringify({ trackId, nodeId }) }) };

export const aiApi = {
  ask: (prompt: string, mode: AIMode = "general", provider: AIProvider = "auto", history: AIHistoryMessage[] = []) => request<AIResponse>("/api/ai/ask", { method: "POST", body: JSON.stringify({ prompt, mode, provider, history }) }),
};
export const geminiApi = { ask: (prompt: string, mode?: AIMode, history?: AIHistoryMessage[]) => aiApi.ask(prompt, mode, "auto", history) };
export const chatMessagesApi = { list: () => request<{ id: string; mode: string; sender: string; text: string; created_at: string }[]>("/api/chat-messages"), create: (body: { mode?: string; sender: string; text: string; provider?: string }) => request<{ id: string; mode: string; sender: string; text: string; created_at: string }>("/api/chat-messages", { method: "POST", body: JSON.stringify(body) }), clear: (mode?: string) => request<void>("/api/chat-messages", { method: "DELETE", body: JSON.stringify({ mode: mode || "english_coach" }) }) };
