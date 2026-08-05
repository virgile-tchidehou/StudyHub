export type Lang = "fr" | "en";

export const defaultLang: Lang = "fr";

export type Dict = {
  appName: string;
  loginTitle: string;
  loginSubtitle: string;
  name: string;
  namePlaceholder: string;
  email: string;
  emailPlaceholder: string;
  password: string;
  passwordPlaceholder: string;
  signIn: string;
  signUp: string;
  pleaseWait: string;
  needAccount: string;
  haveAccount: string;
  authFailed: string;
  dashboard: string;
  welcomeBack: string;
  pickModule: string;
  goalTracker: string;
  goalTrackerDesc: string;
  universities: string;
  universitiesDesc: string;
  documents: string;
  documentsDesc: string;
  goals: string;
  universitiesTitle: string;
  documentsTitle: string;
  goalsIntro: string;
  universitiesIntro: string;
  documentsIntro: string;
  goalTitlePlaceholder: string;
  description: string;
  descriptionPlaceholder: string;
  addGoal: string;
  loading: string;
  noGoals: string;
  completed: string;
  inProgress: string;
  progress: string;
  reopen: string;
  complete: string;
  delete: string;
  deleteConfirm: string;
  universityNamePlaceholder: string;
  countryPlaceholder: string;
  rankingPlaceholder: string;
  add: string;
  noUniversities: string;
  documentTitlePlaceholder: string;
  noDocuments: string;
  signOut: string;
  language: string;
  total: string;
  draft: string;
  pending: string;
  approved: string;
  allStatus: string;
  allTypes: string;
  searchPlaceholder: string;
  addDocument: string;
  visitWebsite: string;
  edit: string;
  viewDetails: string;
  cancel: string;
  save: string;

  // New Modules
  englishCoach: string;
  englishCoachDesc: string;
  aiMentor: string;
  aiMentorDesc: string;
  technicalLearning: string;
  technicalLearningDesc: string;
  scholarships: string;
  scholarshipsDesc: string;
  planner: string;
  plannerDesc: string;
  resources: string;
  resourcesDesc: string;
  analytics: string;
  analyticsDesc: string;
};

const fr: Dict = {
  appName: "StudyHub",
  loginTitle: "Bon retour",
  loginSubtitle: "Connectez-vous pour accéder à votre espace StudyHub.",
  name: "Nom",
  namePlaceholder: "Jean Dupont",
  email: "E-mail",
  emailPlaceholder: "vous@exemple.com",
  password: "Mot de passe",
  passwordPlaceholder: "••••••••",
  signIn: "Se connecter",
  signUp: "S'inscrire",
  pleaseWait: "Veuillez patienter…",
  needAccount: "Besoin d'un compte ? S'inscrire",
  haveAccount: "Déjà un compte ? Se connecter",
  authFailed: "Échec de l'authentification",
  dashboard: "Tableau de bord",
  welcomeBack: "Votre espace centralisé d'accompagnement aux études internationales.",
  pickModule: "Choisissez un module ci-dessous ou utilisez la navigation.",
  goalTracker: "Objectifs",
  goalTrackerDesc: "Suivez vos objectifs, leur avancement et vos étapes clés.",
  universities: "Universités",
  universitiesDesc: "Gérez vos universités cibles et leurs exigences.",
  documents: "Documents",
  documentsDesc: "Téléversez, versionnez et surveillez vos documents administratifs.",
  goals: "Objectifs",
  universitiesTitle: "Universités Cibles",
  documentsTitle: "Gestionnaire de Documents",
  goalsIntro: "Définissez vos objectifs d'études et suivez votre avancement.",
  universitiesIntro: "Consultez et ajoutez vos universités de destination.",
  documentsIntro: "Organisez vos passeports, diplômes et lettres de motivation.",
  goalTitlePlaceholder: "Titre de l'objectif (ex. Master 2027)",
  description: "Description",
  descriptionPlaceholder: "Description",
  addGoal: "Ajouter un objectif",
  loading: "Chargement…",
  noGoals: "Aucun objectif pour l'instant. Créez le premier.",
  completed: "Terminé",
  inProgress: "En cours",
  progress: "Avancement",
  reopen: "Rouvrir",
  complete: "Terminer",
  delete: "Supprimer",
  deleteConfirm: "Êtes-vous sûr de vouloir supprimer ?",
  universityNamePlaceholder: "Nom de l'université",
  countryPlaceholder: "Pays",
  rankingPlaceholder: "Classement (ex. 150)",
  add: "Ajouter",
  noUniversities: "Aucune université suivie pour l'instant.",
  documentTitlePlaceholder: "Titre du document (ex. Relevé L3, SOP)",
  noDocuments: "Aucun document pour l'instant.",
  signOut: "Déconnexion",
  language: "Langue",
  total: "Total",
  draft: "Brouillon",
  pending: "En attente",
  approved: "Approuvé",
  allStatus: "Tous les statuts",
  allTypes: "Tous les types",
  searchPlaceholder: "Rechercher un document…",
  addDocument: "Ajouter un document",
  visitWebsite: "Visiter le site",
  edit: "Modifier",
  viewDetails: "Détails",
  cancel: "Annuler",
  save: "Enregistrer",

  englishCoach: "Coach Anglais IA",
  englishCoachDesc: "Améliorez votre expression orale, grammaire et vocabulaire IELTS/TOEFL.",
  aiMentor: "Mentor IA",
  aiMentorDesc: "Simulation d'entretiens Campus France / DAAD et révision de SOP.",
  technicalLearning: "Roadmaps Techniques",
  technicalLearningDesc: "Parcours d'apprentissage en Systèmes Embarqués, IA et Génie Logiciel.",
  scholarships: "Bourses & Financement",
  scholarshipsDesc: "Découvrez et suivez les bourses d'études internationales (Eiffel, DAAD, etc.).",
  planner: "Planning Intelligent",
  plannerDesc: "Schedules quotidiens, révisions et rappels automatiques de dates limites.",
  resources: "Bibliothèque",
  resourcesDesc: "Guides officiels, modèles de SOP, MOOCs et ressources recommandées.",
  analytics: "Statistiques Globales",
  analyticsDesc: "Vue synthétique de votre progression académique et linguistique.",
};

const en: Dict = {
  appName: "StudyHub",
  loginTitle: "Welcome back",
  loginSubtitle: "Sign in to access your StudyHub workspace.",
  name: "Name",
  namePlaceholder: "Jane Doe",
  email: "Email",
  emailPlaceholder: "you@example.com",
  password: "Password",
  passwordPlaceholder: "••••••••",
  signIn: "Sign in",
  signUp: "Sign up",
  pleaseWait: "Please wait…",
  needAccount: "Need an account? Sign up",
  haveAccount: "Already have an account? Sign in",
  authFailed: "Authentication failed",
  dashboard: "Dashboard",
  welcomeBack: "Your centralized workspace for international study preparation.",
  pickModule: "Pick a module below or use the sidebar navigation.",
  goalTracker: "Goal Tracker",
  goalTrackerDesc: "Track objectives, progress and milestones.",
  universities: "Universities",
  universitiesDesc: "Manage target universities and requirements.",
  documents: "Documents",
  documentsDesc: "Upload, version and monitor administrative documents.",
  goals: "Goals",
  universitiesTitle: "Target Universities",
  documentsTitle: "Document Manager",
  goalsIntro: "Define your study objectives and track progress.",
  universitiesIntro: "Manage target universities and check application deadlines.",
  documentsIntro: "Keep your application documents organized and versioned.",
  goalTitlePlaceholder: "Goal title (e.g. Master 2027)",
  description: "Description",
  descriptionPlaceholder: "Description",
  addGoal: "Add goal",
  loading: "Loading…",
  noGoals: "No goals yet. Create your first one.",
  completed: "Completed",
  inProgress: "In progress",
  progress: "Progress",
  reopen: "Reopen",
  complete: "Complete",
  delete: "Delete",
  deleteConfirm: "Are you sure you want to delete?",
  universityNamePlaceholder: "University name",
  countryPlaceholder: "Country",
  rankingPlaceholder: "World ranking (e.g. 150)",
  add: "Add",
  noUniversities: "No universities tracked yet.",
  documentTitlePlaceholder: "Document title (e.g. Transcript, SOP)",
  noDocuments: "No documents yet.",
  signOut: "Sign out",
  language: "Language",
  total: "Total",
  draft: "Draft",
  pending: "Pending",
  approved: "Approved",
  allStatus: "All statuses",
  allTypes: "All types",
  searchPlaceholder: "Search documents…",
  addDocument: "Add document",
  visitWebsite: "Visit website",
  edit: "Edit",
  viewDetails: "Details",
  cancel: "Cancel",
  save: "Save",

  englishCoach: "AI English Coach",
  englishCoachDesc: "Practice IELTS/TOEFL speaking, grammar, and vocabulary.",
  aiMentor: "AI Mentor",
  aiMentorDesc: "Simulate Campus France / DAAD interviews and review SOPs.",
  technicalLearning: "Technical Roadmaps",
  technicalLearningDesc: "Structured learning paths for Embedded Systems, AI & Software.",
  scholarships: "Scholarships",
  scholarshipsDesc: "Discover and track international study scholarships.",
  planner: "Smart Planner",
  plannerDesc: "Daily schedules, study sessions and automated deadline reminders.",
  resources: "Library & Resources",
  resourcesDesc: "Official guides, SOP templates, MOOCs and study materials.",
  analytics: "Global Analytics",
  analyticsDesc: "Synthesized view of your academic and language readiness.",
};


export const dictionaries: Record<Lang, Dict> = { fr, en };

export function getDictionary(lang: Lang): Dict {
  return dictionaries[lang] ?? dictionaries[defaultLang];
}
