/**
 * Deterministic study plan generation
 * Provides reliable baseline even when LLM fails
 */

interface StudyTask {
  date: string;
  task: string;
  duration: number;
  priority: 'high' | 'medium' | 'low';
}

interface StudyPlan {
  daily_tasks: StudyTask[];
  milestones: string[];
  tips: string[];
}

/**
 * Build a deterministic study plan based on project parameters
 */
export function buildDeterministicPlan(
  projectTitle: string,
  dueDateISO: string,
  estimatedHours: number
): StudyPlan {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const due = new Date(dueDateISO);
  due.setHours(0, 0, 0, 0);
  
  const days = Math.max(1, Math.ceil((+due - +today) / (1000 * 60 * 60 * 24)));
  
  // Academic project phases with realistic weights
  const phases = [
    { name: 'Planning & outline', weight: 0.12 },
    { name: 'Research & literature review', weight: 0.28 },
    { name: 'Method development', weight: 0.18 },
    { name: 'Implementation & analysis', weight: 0.28 },
    { name: 'Writing & revision', weight: 0.12 },
    { name: 'Final review & buffer', weight: 0.02 }
  ];

  const daily_tasks: StudyTask[] = [];
  let remainingMinutes = estimatedHours * 60;
  
  // Distribute work across available days
  const workDaysPerWeek = Math.min(6, days); // Max 6 work days per week
  const totalWorkDays = Math.ceil((days / 7) * workDaysPerWeek);
  
  for (let i = 0; i < days; i++) {
    const currentDate = new Date(+today + i * 86400000);
    const dateStr = currentDate.toISOString().split('T')[0];
    
    // Skip Sundays for lighter schedule
    if (currentDate.getDay() === 0 && days > 7) {
      continue;
    }
    
    // Determine current phase
    const progress = i / days;
    const phaseIndex = Math.min(
      Math.floor(progress * phases.length),
      phases.length - 1
    );
    const currentPhase = phases[phaseIndex];
    
    // Calculate session duration
    const baseMinutes = Math.floor((estimatedHours * 60) / totalWorkDays);
    const phaseMultiplier = currentPhase.weight * phases.length;
    let sessionMinutes = Math.floor(baseMinutes * phaseMultiplier);
    
    // Adjust for urgency (last 3 days get more time)
    if (days - i <= 3) {
      sessionMinutes = Math.floor(sessionMinutes * 1.3);
    }
    
    // Ensure reasonable session lengths
    sessionMinutes = Math.max(30, Math.min(sessionMinutes, remainingMinutes, 180));
    remainingMinutes -= sessionMinutes;
    
    // Determine priority based on phase and timeline
    let priority: 'high' | 'medium' | 'low' = 'medium';
    if (days - i <= 3 || phaseIndex >= 4) {
      priority = 'high';
    } else if (phaseIndex <= 1) {
      priority = 'low';
    }
    
    daily_tasks.push({
      date: dateStr,
      task: `${currentPhase.name}: ${projectTitle}`,
      duration: sessionMinutes,
      priority
    });
    
    if (remainingMinutes <= 0) break;
  }
  
  // Generate milestones based on phases
  const milestones = [
    'Project scope and outline completed',
    'Literature review and sources gathered',
    'Methodology/approach finalized',
    'Core implementation/analysis finished',
    'First complete draft written',
    'Final review and submission ready'
  ];
  
  // Generate contextual tips
  const tips = [
    'Block dedicated time slots in your calendar for deep work',
    'Use a reference manager (Zotero, Mendeley) to organize sources',
    'Write rough drafts first, perfect later - momentum beats perfection',
    'Back up your work to cloud storage regularly',
    'Take breaks every 45-90 minutes to maintain focus',
    'Start each session by reviewing what you accomplished last time'
  ];
  
  // Add project-specific tips based on estimated hours
  if (estimatedHours > 20) {
    tips.push('Break large tasks into smaller 2-3 hour chunks');
    tips.push('Consider working with a study partner or accountability buddy');
  }
  
  if (days <= 7) {
    tips.push('This is a tight timeline - focus on core requirements first');
    tips.push('Prepare an outline before diving into detailed work');
  }
  
  return {
    daily_tasks,
    milestones: milestones.slice(0, Math.min(6, Math.ceil(phases.length * (days / 14)))),
    tips: tips.slice(0, 6) // Keep tips manageable
  };
}

/**
 * Validate that a study plan has reasonable structure
 */
export function validateStudyPlanStructure(plan: StudyPlan): boolean {
  return (
    Array.isArray(plan.daily_tasks) &&
    plan.daily_tasks.length > 0 &&
    Array.isArray(plan.milestones) &&
    Array.isArray(plan.tips) &&
    plan.daily_tasks.every(task => 
      task.date && task.task && 
      typeof task.duration === 'number' && task.duration > 0 &&
      ['high', 'medium', 'low'].includes(task.priority)
    )
  );
}
