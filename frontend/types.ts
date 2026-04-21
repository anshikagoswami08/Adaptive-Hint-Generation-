export interface UserStats {
  totalProblems: number;
  avgHints: number;
  accuracy: number;
  difficultyLevel: string;
  progressData: { date: string; solved: number }[];
  mastery: {
    topic: string;
    score: number;
  }[];
}

export interface UserProfile {
  name: string;
  email: string;
  joinedDate: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

export interface HintResponse {
  level: number;
  text: string;
  isFullSolution: boolean;
}

export interface PracticeProblem {
  id: string;
  title: string;
  content: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export type ViewMode =
  | "dashboard"
  | "screen"
  | "chat"
  | "pdf"
  | "practice"
  | "progress"
  | "settings";
