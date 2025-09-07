import { Preferences } from '@/contexts/PreferencesContext';

// Preferences completeness rule (keep tiny and opinionated)
export function prefsComplete(p?: Preferences | null): boolean {
  if (!p) return false;
  
  // Must have at least one subject selected
  if (p.subjects.length === 0) return false;
  
  // Must have explanation style selected
  if (!p.explanationStyle) return false;
  
  // Must have difficulty level selected
  if (!p.difficultyStart) return false;
  
  // Must have response style selected
  if (!p.responseStyle) return false;
  
  // Must have language selected
  if (!p.language) return false;
  
  return true;
}

// Get missing required fields for user feedback
export function getMissingPrefsFields(p?: Preferences | null): string[] {
  if (!p) return ['All preferences'];
  
  const missing: string[] = [];
  
  if (p.subjects.length === 0) missing.push('Subjects');
  if (!p.explanationStyle) missing.push('Explanation Style');
  if (!p.difficultyStart) missing.push('Difficulty Level');
  if (!p.responseStyle) missing.push('Response Style');
  if (!p.language) missing.push('Language');
  
  return missing;
}
