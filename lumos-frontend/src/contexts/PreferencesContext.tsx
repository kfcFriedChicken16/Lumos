"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// University student preferences interface
export interface Preferences {
  // Academic Level
  year: "Year 1" | "Year 2" | "Year 3" | "Year 4" | "Postgrad";
  major: "Engineering" | "Business" | "Medicine" | "Arts" | "Science" | "Computer Science" | "Other";
  university: "UM" | "USM" | "UTM" | "UPM" | "UUM" | "UTAR" | "Other";
  
  // Study Focus
  studyGoals: "exam_prep" | "assignment_help" | "research" | "career_prep" | "skill_building";
  subjects: string[];
  
  // Learning Style
  explanationStyle: "step-by-step" | "conceptual" | "examples-heavy" | "quick-reference";
  difficultyStart: "beginner" | "intermediate" | "advanced";
  
  // Communication
  responseStyle: "academic" | "casual" | "encouraging" | "direct";
  language: "English" | "Bahasa Malaysia" | "Mixed";
  
  // Study Habits
  studyTime: "morning" | "afternoon" | "evening" | "night";
  sessionLength: "15min" | "30min" | "45min" | "60min";
  
  // Personality & Support
  confidenceLevel: "low" | "medium" | "high";
  needEncouragement: boolean;
  preferStepByStep: boolean;
  likeExamples: boolean;
  
  // Technical Preferences
  voiceEnabled: boolean;
  notifications: boolean;
  darkMode: boolean;
}

interface PreferencesContextType {
  prefs: Preferences | null;
  isLoaded: boolean;
  setPrefs: (prefs: Preferences) => void;
  clearPrefs: () => void;
  buildTutorOptions: (prefs: Preferences) => {
    lang: string;
    style: string;
    difficulty: string;
    subjects: string[];
    responseStyle: string;
    needEncouragement: boolean;
  };
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

// Default preferences for new users
const defaultPreferences: Preferences = {
  year: "Year 1",
  major: "Computer Science",
  university: "UM",
  studyGoals: "exam_prep",
  subjects: [],
  explanationStyle: "step-by-step",
  difficultyStart: "beginner",
  responseStyle: "encouraging",
  language: "English",
  studyTime: "evening",
  sessionLength: "30min",
  confidenceLevel: "medium",
  needEncouragement: true,
  preferStepByStep: true,
  likeExamples: true,
  voiceEnabled: false,
  notifications: true,
  darkMode: false,
};

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefsState] = useState<Preferences | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load preferences from memory on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPrefs = sessionStorage.getItem('lumos-preferences');
      if (savedPrefs) {
        try {
          const parsed = JSON.parse(savedPrefs);
          setPrefsState(parsed);
        } catch (error) {
          console.error('Error parsing saved preferences:', error);
          sessionStorage.removeItem('lumos-preferences');
          setPrefsState(defaultPreferences);
        }
      } else {
        // If no saved preferences, initialize with defaults
        setPrefsState(defaultPreferences);
      }
      setIsLoaded(true);
    }
  }, []);

  // Save preferences to memory whenever they change
  const setPrefs = (newPrefs: Preferences) => {
    setPrefsState(newPrefs);
    sessionStorage.setItem('lumos-preferences', JSON.stringify(newPrefs));
  };

  // Clear preferences
  const clearPrefs = () => {
    setPrefsState(null);
    sessionStorage.removeItem('lumos-preferences');
  };

  // Build tutor options from preferences
  const buildTutorOptions = (prefs: Preferences) => {
    return {
      lang: prefs.language,
      style: prefs.explanationStyle,
      difficulty: prefs.difficultyStart,
      subjects: prefs.subjects,
      responseStyle: prefs.responseStyle,
      needEncouragement: prefs.needEncouragement,
    };
  };

  return (
    <PreferencesContext.Provider value={{
      prefs,
      isLoaded,
      setPrefs,
      clearPrefs,
      buildTutorOptions,
    }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (context === undefined) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}
