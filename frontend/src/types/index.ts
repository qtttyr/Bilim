export interface Concept {
  id: string;
  term: string;
  definition: string;
  formula: string | null;
  hasFormula: boolean;
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  concept_id: string;
  difficulty: 'missed' | 'shaky' | 'known' | null;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct: number; // Index 0-3
  explanation: string;
}

export interface Material {
  id: string;
  title: string;
  summary: string;
  concepts: Concept[];
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  createdAt: number; // Timestamp
  isTruncated?: boolean; // If smart truncated
}

export interface CardState {
  card_id: string;
  material_id: string;
  difficulty: 'missed' | 'shaky' | 'known' | null;
  nextReview: number; // Timestamp
  reviewCount: number;
  intervalDays: number;
}

export interface QuizHistory {
  id: string;
  material_id: string;
  score: number; // 0-5
  date: number; // Timestamp
  weakConcepts: string[]; // Concept IDs missed
}

export interface UserStats {
  streak: number;
  lastStudied: string | null; // 'YYYY-MM-DD'
  totalCardsReviewed: number;
  totalQuizzesTaken: number;
  bossSessionsCompleted: number;
}
