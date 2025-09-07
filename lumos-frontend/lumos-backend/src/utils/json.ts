/**
 * Bulletproof JSON extraction from LLM responses
 * Handles code fences, prose wrapping, and malformed JSON
 */

export function extractJSON(text: string): any | null {
  if (!text || typeof text !== 'string') {
    return null;
  }

  // Try to find JSON in code fences first
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  
  // If found in fences, use that; otherwise look for JSON-like structure
  const candidate = fenced ? fenced[1] : (
    text.match(/\{[\s\S]*\}$/)?.[0] || 
    text.match(/\{[\s\S]*\}/)?.[0] || 
    text
  );

  try {
    return JSON.parse(candidate.trim());
  } catch (error) {
    // Try to clean up common issues
    try {
      // Remove trailing commas
      const cleaned = candidate
        .replace(/,(\s*[}\]])/g, '$1')
        .replace(/([{,]\s*)(\w+):/g, '$1"$2":') // Quote unquoted keys
        .trim();
      
      return JSON.parse(cleaned);
    } catch (secondError) {
      console.warn('Failed to parse JSON from LLM response:', {
        originalError: error instanceof Error ? error.message : String(error),
        cleanupError: secondError instanceof Error ? secondError.message : String(secondError),
        candidateLength: candidate.length
      });
      return null;
    }
  }
}

/**
 * Validate and provide defaults for resource analysis response
 */
export function validateResourceAnalysis(parsed: any): {
  credibility: 'high' | 'medium' | 'low';
  reasoning: string;
  key_points: string[];
  potential_issues: string[];
  suggestions: string[];
} {
  return {
    credibility: (['high', 'medium', 'low'].includes(parsed?.credibility)) 
      ? parsed.credibility : 'medium',
    reasoning: typeof parsed?.reasoning === 'string' 
      ? parsed.reasoning : 'Analysis completed',
    key_points: Array.isArray(parsed?.key_points) 
      ? parsed.key_points.filter((p: any) => typeof p === 'string') : [],
    potential_issues: Array.isArray(parsed?.potential_issues) 
      ? parsed.potential_issues.filter((p: any) => typeof p === 'string') : [],
    suggestions: Array.isArray(parsed?.suggestions) 
      ? parsed.suggestions.filter((p: any) => typeof p === 'string') : []
  };
}

/**
 * Validate and provide defaults for learning analysis response
 */
export function validateLearningAnalysis(parsed: any): {
  knowledge_gaps: string[];
  suggested_resources: Array<{
    title: string;
    url?: string;
    type: 'video' | 'article' | 'book' | 'course';
    difficulty: 'beginner' | 'intermediate' | 'advanced';
  }>;
  study_plan_suggestions: string[];
  estimated_time: string;
} {
  const validTypes = ['video', 'article', 'book', 'course'];
  const validDifficulties = ['beginner', 'intermediate', 'advanced'];

  return {
    knowledge_gaps: Array.isArray(parsed?.knowledge_gaps) 
      ? parsed.knowledge_gaps.filter((g: any) => typeof g === 'string') : [],
    suggested_resources: Array.isArray(parsed?.suggested_resources) 
      ? parsed.suggested_resources
          .filter((r: any) => r && typeof r.title === 'string')
          .map((r: any) => ({
            title: r.title,
            url: typeof r.url === 'string' ? r.url : undefined,
            type: validTypes.includes(r.type) ? r.type : 'article',
            difficulty: validDifficulties.includes(r.difficulty) ? r.difficulty : 'intermediate'
          })) : [],
    study_plan_suggestions: Array.isArray(parsed?.study_plan_suggestions) 
      ? parsed.study_plan_suggestions.filter((s: any) => typeof s === 'string') : [],
    estimated_time: typeof parsed?.estimated_time === 'string' 
      ? parsed.estimated_time : '1-2 hours per day'
  };
}

/**
 * Validate and provide defaults for study plan response
 */
export function validateStudyPlan(parsed: any): {
  daily_tasks: Array<{
    date: string;
    task: string;
    duration: number;
    priority: 'high' | 'medium' | 'low';
  }>;
  milestones: string[];
  tips: string[];
} {
  const validPriorities = ['high', 'medium', 'low'];

  return {
    daily_tasks: Array.isArray(parsed?.daily_tasks) 
      ? parsed.daily_tasks
          .filter((t: any) => t && typeof t.task === 'string')
          .map((t: any) => ({
            date: typeof t.date === 'string' ? t.date : new Date().toISOString().split('T')[0],
            task: t.task,
            duration: typeof t.duration === 'number' && t.duration > 0 ? t.duration : 60,
            priority: validPriorities.includes(t.priority) ? t.priority : 'medium'
          })) : [],
    milestones: Array.isArray(parsed?.milestones) 
      ? parsed.milestones.filter((m: any) => typeof m === 'string') : [],
    tips: Array.isArray(parsed?.tips) 
      ? parsed.tips.filter((t: any) => typeof t === 'string') : []
  };
}
