export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  created_at: string;
}

export interface Goal {
  id: string;
  title: string;
  description: string | null;
  target_date: string | null;
  progress: number;
  completed: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface University {
  id: string;
  name: string;
  country: string | null;
  description: string | null;
  website: string | null;
  ranking: number | null;
  requirements: string | null;
  deadlines: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  type: string | null;
  status: string;
  content: string | null;
  file_path: string | null;
  expires_at: string | null;
  user_id: string;
  university_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Scholarship {
  id: string;
  name: string;
  organization: string;
  amount: string;
  deadline: string;
  coverage: string; // e.g. "Full tuition + Monthly stipend ($1200)"
  country: string;
  status: "eligible" | "saved" | "applied" | "awarded";
  link: string;
}

export interface PlannerTask {
  id: string;
  title: string;
  category: "english" | "technical" | "document" | "university";
  durationMinutes: number;
  dueDate: string;
  completed: boolean;
  user_id: string;
}

export interface ResourceItem {
  id: string;
  title: string;
  category: "MOOC" | "Book" | "Guide" | "YouTube" | "PDF" | "Template";
  url: string;
  description: string;
  tags: string[];
}

export interface Flashcard {
  id: string;
  word: string;
  phonetic: string;
  definition: string;
  example: string;
  category: "IELTS Academic" | "GRE/GMAT" | "TOEFL" | "Technical English";
  mastered: boolean;
}

const defaultUserId = "usr_demo_123";

// Initial in-memory data store seeded with sample records
const usersStore = new Map<string, User>([
  [
    "demo@studyhub.edu",
    {
      id: defaultUserId,
      name: "Etudiant StudyHub",
      email: "demo@studyhub.edu",
      created_at: new Date().toISOString(),
    },
  ],
]);

const sessionsStore = new Map<string, string>([
  ["demo-session-token", defaultUserId],
]);

const scholarshipsStore: Scholarship[] = [
  {
    id: "s-1",
    name: "Bourse Excellence Eiffel",
    organization: "Ministère de l'Europe et des Affaires Étrangères",
    amount: "1,181 € / mois",
    deadline: "2027-01-10",
    coverage: "Allocations mensuelles, transport international, assurance santé",
    country: "France",
    status: "saved",
    link: "https://www.campusfrance.org/fr/le-programme-de-bourses-d-excellence-eiffel",
  },
  {
    id: "s-2",
    name: "DAAD Master Scholarships for All Academic Disciplines",
    organization: "German Academic Exchange Service",
    amount: "934 € / mois",
    deadline: "2026-11-30",
    coverage: "Frais de scolarité, billet d'avion, assurance, cours d'allemand",
    country: "Allemagne",
    status: "eligible",
    link: "https://www.daad.de",
  },
  {
    id: "s-3",
    name: "Bourses d'Excellence de Polytechnique Montréal",
    organization: "Fondation Polytechnique",
    amount: "10,000 $ CAD / an",
    deadline: "2026-12-01",
    coverage: "Exemption partielle des droits de scolarité majorés",
    country: "Canada",
    status: "applied",
    link: "https://www.polymtl.ca/aide-financiere/bourses",
  },
];

const plannerStore: PlannerTask[] = [
  {
    id: "p-1",
    title: "Session 30 min Anglais IELTS Speaking - Modèle Part 2",
    category: "english",
    durationMinutes: 30,
    dueDate: new Date().toISOString().split("T")[0],
    completed: false,
    user_id: defaultUserId,
  },
  {
    id: "p-2",
    title: "Révision C++20 & RTOS Concept de Semaphores",
    category: "technical",
    durationMinutes: 60,
    dueDate: new Date().toISOString().split("T")[0],
    completed: true,
    user_id: defaultUserId,
  },
  {
    id: "p-3",
    title: "Vérification date expiration passeport & traduction d'acte de naissance",
    category: "document",
    durationMinutes: 20,
    dueDate: new Date(Date.now() + 86400000).toISOString().split("T")[0],
    completed: false,
    user_id: defaultUserId,
  },
];

const resourcesStore: ResourceItem[] = [
  {
    id: "r-1",
    title: "Guide officiel Campus France — Procédure Études en France 2026-2027",
    category: "Guide",
    url: "https://www.campusfrance.org",
    description: "Guide étape par étape pour la soumission du dossier, les entretiens et les visas d'études.",
    tags: ["Campus France", "Visa", "France"],
  },
  {
    id: "r-2",
    title: "SOP & Motivation Letter Template for Graduate Studies",
    category: "Template",
    url: "#",
    description: "Structure recommandée en 5 paragraphes : Introduction, Parcours académique, Projets de recherche, Pourquoi cette université, Vision professionnelle.",
    tags: ["SOP", "Motivation Letter", "Master"],
  },
  {
    id: "r-3",
    title: "IELTS Advantage Speaking & Writing Masterclass",
    category: "YouTube",
    url: "https://www.youtube.com/@IELTSAdvantage",
    description: "Explications détaillées pour obtenir Band 7.5+ avec exercices pratiques et vocabulaire académique.",
    tags: ["IELTS", "English", "Speaking"],
  },
  {
    id: "r-4",
    title: "Modern Embedded Systems Programming by Miro Samek",
    category: "MOOC",
    url: "https://www.youtube.com/playlist?list=PLPW8O6W-1chwyTzI3bhwBLbGQoPFxPAPM",
    description: "Cours vidéo complet sur le langage C, la mémoire microcontrôleur, ARM Cortex-M et les State Machines.",
    tags: ["C", "Embedded Systems", "Hardware"],
  },
];

const flashcardsStore: Flashcard[] = [
  {
    id: "f-1",
    word: "Paradigm",
    phonetic: "/ˈpær.ə.daɪm/",
    definition: "A typical example or pattern of something; a model.",
    example: "The study represents a new paradigm in computer vision research.",
    category: "IELTS Academic",
    mastered: false,
  },
  {
    id: "f-2",
    word: "Substantiate",
    phonetic: "/səbˈstæn.ʃi.eɪt/",
    definition: "Provide evidence to support or prove the truth of.",
    example: "You must substantiate your claims in the Statement of Purpose with research project references.",
    category: "TOEFL",
    mastered: true,
  },
  {
    id: "f-3",
    word: "Deterministic",
    phonetic: "/dɪˌtɜː.mɪˈnɪs.tɪk/",
    definition: "In computer science, describing an algorithm whose output is completely determined by its initial state.",
    example: "Real-time operating systems require deterministic task scheduling.",
    category: "Technical English",
    mastered: false,
  },
];

const goalsStore: Goal[] = [
  {
    id: "g-1",
    title: "Obtenir mon test de langue (IELTS 7.5+ / TOEFL 100+)",
    description: "Réviser la section Speaking et Writing chaque semaine",
    target_date: "2026-11-15",
    progress: 75,
    completed: false,
    user_id: defaultUserId,
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "g-2",
    title: "Rédiger la lettre de motivation (SOP)",
    description: "Personnaliser selon le programme Master à Polytechnique Montréal",
    target_date: "2026-10-30",
    progress: 100,
    completed: true,
    user_id: defaultUserId,
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

const universitiesStore: University[] = [
  {
    id: "u-1",
    name: "Polytechnique Montréal",
    country: "Canada",
    description: "Génie Informatique & Intelligence Artificielle",
    website: "https://www.polymtl.ca",
    ranking: 150,
    requirements: "Relevés de notes, 2 lettres de recommandation, SOP",
    deadlines: "15 Janvier 2027",
    user_id: defaultUserId,
    created_at: new Date(Date.now() - 86400000 * 8).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
  {
    id: "u-2",
    name: "Université Paris-Saclay",
    country: "France",
    description: "Master Informatique - Data Science",
    website: "https://www.universite-paris-saclay.fr",
    ranking: 60,
    requirements: "Procédure Campus France / Etudes en France",
    deadlines: "31 Mars 2027",
    user_id: defaultUserId,
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 6).toISOString(),
  },
];

const documentsStore: DocumentItem[] = [
  {
    id: "d-1",
    title: "Relevé de notes Licence 3",
    type: "pdf",
    status: "approved",
    content: "Official Academic Transcript - L3 Computer Science",
    file_path: null,
    expires_at: null,
    user_id: defaultUserId,
    university_id: "u-1",
    created_at: new Date(Date.now() - 86400000 * 4).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: "d-2",
    title: "Attestation de réussite TOEFL iBT",
    type: "pdf",
    status: "pending",
    content: "TOEFL score report 105/120",
    file_path: null,
    expires_at: null,
    user_id: defaultUserId,
    university_id: "u-1",
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export function findUserByEmail(email: string): User | undefined {
  return usersStore.get(email.toLowerCase());
}

export function createUser(name: string, email: string): User {
  const user: User = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
    name,
    email: email.toLowerCase(),
    created_at: new Date().toISOString(),
  };
  usersStore.set(email.toLowerCase(), user);
  return user;
}

export function createSession(userId: string): string {
  const token = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
  sessionsStore.set(token, userId);
  return token;
}

export function getUserIdFromSession(token: string | undefined): string {
  if (!token) return defaultUserId;
  return sessionsStore.get(token) || defaultUserId;
}

export function getGoals(userId: string): Goal[] {
  return goalsStore.filter((g) => g.user_id === userId || userId === defaultUserId);
}

export function createGoal(
  userId: string,
  data: { title: string; description?: string; targetDate?: string }
): Goal {
  const goal: Goal = {
    id: `g_${Date.now()}`,
    title: data.title,
    description: data.description || null,
    target_date: data.targetDate || null,
    progress: 0,
    completed: false,
    user_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  goalsStore.unshift(goal);
  return goal;
}

export function updateGoal(
  userId: string,
  id: string,
  data: Partial<Goal>
): Goal | null {
  const idx = goalsStore.findIndex((g) => g.id === id);
  if (idx === -1) return null;
  const existing = goalsStore[idx];
  const updated: Goal = {
    ...existing,
    ...data,
    updated_at: new Date().toISOString(),
  };
  goalsStore[idx] = updated;
  return updated;
}

export function deleteGoal(userId: string, id: string): boolean {
  const idx = goalsStore.findIndex((g) => g.id === id);
  if (idx === -1) return false;
  goalsStore.splice(idx, 1);
  return true;
}

export function getUniversities(userId: string): University[] {
  return universitiesStore.filter((u) => u.user_id === userId || userId === defaultUserId);
}

export function createUniversity(
  userId: string,
  data: { name: string; country?: string; ranking?: number; requirements?: string; deadlines?: string; website?: string; description?: string }
): University {
  const uni: University = {
    id: `u_${Date.now()}`,
    name: data.name,
    country: data.country || null,
    description: data.description || null,
    website: data.website || null,
    ranking: data.ranking ?? null,
    requirements: data.requirements || null,
    deadlines: data.deadlines || null,
    user_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  universitiesStore.unshift(uni);
  return uni;
}

export function getDocuments(userId: string): DocumentItem[] {
  return documentsStore.filter((d) => d.user_id === userId || userId === defaultUserId);
}

export function createDocument(
  userId: string,
  data: { title: string; type?: string; status?: string; content?: string; universityId?: string }
): DocumentItem {
  const doc: DocumentItem = {
    id: `d_${Date.now()}`,
    title: data.title,
    type: data.type || "pdf",
    status: data.status || "draft",
    content: data.content || null,
    file_path: null,
    expires_at: null,
    user_id: userId,
    university_id: data.universityId || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  documentsStore.unshift(doc);
  return doc;
}

export function getScholarships(): Scholarship[] {
  return scholarshipsStore;
}

export function createScholarship(data: Omit<Scholarship, "id">): Scholarship {
  const item: Scholarship = { ...data, id: `s_${Date.now()}` };
  scholarshipsStore.unshift(item);
  return item;
}

export function getPlannerTasks(userId: string): PlannerTask[] {
  return plannerStore.filter((p) => p.user_id === userId || userId === defaultUserId);
}

export function createPlannerTask(
  userId: string,
  data: { title: string; category: PlannerTask["category"]; durationMinutes: number; dueDate: string }
): PlannerTask {
  const task: PlannerTask = {
    id: `p_${Date.now()}`,
    title: data.title,
    category: data.category,
    durationMinutes: data.durationMinutes,
    dueDate: data.dueDate,
    completed: false,
    user_id: userId,
  };
  plannerStore.unshift(task);
  return task;
}

export function togglePlannerTask(id: string): PlannerTask | null {
  const task = plannerStore.find((t) => t.id === id);
  if (!task) return null;
  task.completed = !task.completed;
  return task;
}

export function getResources(): ResourceItem[] {
  return resourcesStore;
}

export function getFlashcards(): Flashcard[] {
  return flashcardsStore;
}

export function toggleFlashcardMastered(id: string): Flashcard | null {
  const card = flashcardsStore.find((f) => f.id === id);
  if (!card) return null;
  card.mastered = !card.mastered;
  return card;
}

