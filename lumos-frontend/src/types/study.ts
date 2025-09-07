// Study Pack Data Models for Adaptive Learning

export type QA = {
  id: string;
  subtopic: string;
  difficulty: 1 | 2 | 3 | 4 | 5 | 6;
  type: "mcq" | "open" | "code";
  prompt: string;
  options?: string[];          // for mcq
  answer?: number | string;    // idx for mcq or text
  solution: string;            // short worked solution
};

export type StudyPack = {
  topic: string;
  subtopics: string[];
  questions: QA[];
};

export type MasteryMap = Record<string, number>; // subtopic -> 0..1

export type StepState = "idle" | "asking" | "answered" | "feedback";

// Utility functions for mastery tracking
export function updateMastery(
  mastery: MasteryMap, 
  subtopic: string, 
  isCorrect: boolean, 
  level: number
): MasteryMap {
  const delta = isCorrect ? (0.04 + level * 0.01) : -0.05;
  const current = mastery[subtopic] ?? 0;
  const newValue = Math.max(0, Math.min(1, current + delta));
  return { ...mastery, [subtopic]: newValue };
}

export function nextQuestion(
  pack: StudyPack, 
  level: number, 
  mastery: MasteryMap
): QA | null {
  const byLevel = pack.questions.filter(q => q.difficulty === level);
  if (!byLevel.length) return null;

  // Find weakest subtopic
  const subs = [...new Set(byLevel.map(q => q.subtopic))];
  subs.sort((a, b) => (mastery[a] ?? 0) - (mastery[b] ?? 0));
  const target = subs[0];

  // Filter by subtopic and sort by type order: MCQ → Short → Deep
  const pool = byLevel.filter(q => q.subtopic === target);
  
  // Sort by question type priority: mcq (0), open (1), code (2)
  const typePriority = { "mcq": 0, "open": 1, "code": 2 };
  pool.sort((a, b) => {
    const aPriority = typePriority[a.type] ?? 3;
    const bPriority = typePriority[b.type] ?? 3;
    return aPriority - bPriority;
  });

  return pool[0] ?? null;
}

export function fuzzyMatch(a: string, b: string): boolean {
  return a.trim().toLowerCase() === (b || "").trim().toLowerCase();
}

// Local storage helpers
export function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function saveToStorage(key: string, value: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
}
