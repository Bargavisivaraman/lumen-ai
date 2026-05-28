/**
 * Thin typed wrapper around the FastAPI backend. Reads the JWT from localStorage
 * and attaches it to every request. All functions throw on non-2xx so callers
 * can simply try/catch.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const TOKEN_KEY = "ai_tutor_token";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  if (typeof window !== "undefined") localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  if (typeof window !== "undefined") localStorage.removeItem(TOKEN_KEY);
}

type Options = RequestInit & { json?: unknown; form?: Record<string, string>; auth?: boolean };

async function request<T>(path: string, opts: Options = {}): Promise<T> {
  const headers: Record<string, string> = { ...(opts.headers as Record<string, string>) };
  const auth = opts.auth !== false;

  let body: BodyInit | undefined = opts.body as BodyInit | undefined;

  if (opts.json !== undefined) {
    headers["Content-Type"] = "application/json";
    body = JSON.stringify(opts.json);
  } else if (opts.form) {
    headers["Content-Type"] = "application/x-www-form-urlencoded";
    body = new URLSearchParams(opts.form).toString();
  }

  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...opts, headers, body });

  if (!res.ok) {
    let detail: string;
    try {
      const data = await res.json();
      detail = data.detail || JSON.stringify(data);
    } catch {
      detail = await res.text();
    }
    throw new ApiError(res.status, detail);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

// ---------- Types ----------

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: "student" | "admin";
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ChatMessage {
  id: number;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

export interface ChatSession {
  id: number;
  title: string;
  created_at: string;
}

export interface ChatSessionWithMessages extends ChatSession {
  messages: ChatMessage[];
}

export interface ChatReply {
  session: ChatSession;
  user_message: ChatMessage;
  assistant_message: ChatMessage;
}

export interface PlanBlock {
  subject: string;
  topic: string;
  minutes: number;
  notes: string | null;
}

export interface PlanDay {
  date: string;
  blocks: PlanBlock[];
}

export interface StudyPlan {
  id: number;
  title: string;
  payload: { days: PlanDay[] };
  inputs: Record<string, unknown>;
  created_at: string;
}

export interface PlannerInput {
  subjects: string[];
  goals: string;
  exam_date?: string | null;
  weak_topics: string[];
  hours_per_day: number;
  days_to_plan: number;
}

export interface QuizPublic {
  id: number;
  topic: string;
  difficulty: string;
  questions: { id: number; prompt: string; choices: string[] }[];
}

export interface QuizResult {
  quiz_id: number;
  score: number;
  results: { question_id: number; correct: boolean; correct_index: number; explanation: string }[];
}

export interface Note {
  id: number;
  title: string;
  summary: string | null;
  key_points: string[] | null;
  flashcards: { front: string; back: string }[] | null;
  created_at: string;
}

export interface AnalyticsSummary {
  total_study_minutes: number;
  sessions_this_week: number;
  current_streak_days: number;
  average_quiz_score: number;
  quizzes_taken: number;
  weak_topics: string[];
  by_subject_minutes: Record<string, number>;
  daily_minutes_last_14: { date: string; minutes: number }[];
  suggestions: string[];
}

export interface Recommendation {
  kind: "topic" | "practice" | "resource";
  title: string;
  reason: string;
  action_url: string | null;
}

// ---------- Endpoints ----------

export const api = {
  // Auth
  register: (data: { email: string; password: string; full_name: string }) =>
    request<TokenResponse>("/auth/register", { method: "POST", json: data, auth: false }),
  login: (email: string, password: string) =>
    request<TokenResponse>("/auth/login", {
      method: "POST",
      form: { username: email, password },
      auth: false,
    }),
  me: () => request<User>("/auth/me"),
  updateMe: (data: Partial<Pick<User, "full_name" | "bio" | "avatar_url">>) =>
    request<User>("/auth/me", { method: "PATCH", json: data }),

  // Chat
  listSessions: () => request<ChatSession[]>("/chat/sessions"),
  getSession: (id: number) => request<ChatSessionWithMessages>(`/chat/sessions/${id}`),
  sendMessage: (content: string, session_id?: number) =>
    request<ChatReply>("/chat/messages", {
      method: "POST",
      json: { content, session_id: session_id ?? null },
    }),
  deleteSession: (id: number) =>
    request<void>(`/chat/sessions/${id}`, { method: "DELETE" }),

  // Planner
  generatePlan: (data: PlannerInput) =>
    request<StudyPlan>("/planner/generate", { method: "POST", json: data }),
  latestPlan: () => request<StudyPlan | null>("/planner/me"),

  // Quizzes
  generateQuiz: (topic: string, difficulty: string, num_questions: number) =>
    request<QuizPublic>("/quizzes/generate", {
      method: "POST",
      json: { topic, difficulty, num_questions },
    }),
  submitQuiz: (quizId: number, answers: Record<number, number>) =>
    request<QuizResult>(`/quizzes/${quizId}/submit`, { method: "POST", json: { answers } }),
  myQuizzes: () =>
    request<{ id: number; topic: string; difficulty: string; created_at: string; num_questions: number }[]>(
      "/quizzes/",
    ),

  // Notes
  listNotes: () => request<Note[]>("/notes/"),
  getNote: (id: number) => request<Note>(`/notes/${id}`),
  createNoteFromText: (title: string, source_text: string) =>
    request<Note>("/notes/text", { method: "POST", json: { title, source_text } }),
  uploadNote: async (title: string, file: File) => {
    const fd = new FormData();
    fd.append("title", title);
    fd.append("file", file);
    const token = getToken();
    const res = await fetch(`${API_URL}/notes/upload`, {
      method: "POST",
      body: fd,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({ detail: "Upload failed" }));
      throw new ApiError(res.status, data.detail);
    }
    return (await res.json()) as Note;
  },
  deleteNote: (id: number) => request<void>(`/notes/${id}`, { method: "DELETE" }),

  // Analytics
  logStudySession: (subject: string, minutes: number, topic?: string) =>
    request<{ id: number; created_at: string }>("/analytics/sessions", {
      method: "POST",
      json: { subject, topic: topic ?? null, minutes },
    }),
  dashboard: () => request<AnalyticsSummary>("/analytics/dashboard"),

  // Recommendations
  recommendations: () => request<Recommendation[]>("/recommendations/"),

  // Admin
  adminUsers: () => request<User[]>("/admin/users"),
  adminStats: () =>
    request<{
      total_users: number;
      total_chat_messages: number;
      total_quiz_attempts: number;
      total_study_minutes: number;
      average_quiz_score: number;
    }>("/admin/stats"),
};
