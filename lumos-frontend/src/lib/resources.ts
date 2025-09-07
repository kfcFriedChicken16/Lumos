import resourcesData from '@/data/resources.json';

export interface Video {
  title: string;
  url: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  source: string;
  description: string;
}

export interface Topic {
  name: string;
  description: string;
  videos: Video[];
}

export interface Subject {
  name: string;
  icon: string;
  color: string;
  description: string;
  topics: Record<string, Topic>;
}

export interface ResourcesData {
  subjects: Record<string, Subject>;
}

// Type assertion for the imported JSON
const data = resourcesData as ResourcesData;

export function getAllSubjects(): (Subject & { id: string })[] {
  return Object.entries(data.subjects).map(([id, subject]) => ({
    id,
    ...subject
  }));
}

export function getSubjectById(subjectId: string): Subject | null {
  return data.subjects[subjectId] || null;
}

export function getSubjectTopics(subjectId: string): (Topic & { id: string })[] {
  const subject = getSubjectById(subjectId);
  if (!subject) return [];
  
  return Object.entries(subject.topics).map(([id, topic]) => ({
    id,
    ...topic
  }));
}

export function getTopicVideos(subjectId: string, topicId: string): Video[] {
  const subject = getSubjectById(subjectId);
  if (!subject || !subject.topics[topicId]) return [];
  
  return subject.topics[topicId].videos;
}

export function searchSubjects(searchTerm: string): (Subject & { id: string })[] {
  const subjects = getAllSubjects();
  const term = searchTerm.toLowerCase();
  
  return subjects.filter(subject =>
    subject.name.toLowerCase().includes(term) ||
    subject.description.toLowerCase().includes(term)
  );
}

export function searchTopics(subjectId: string, searchTerm: string): (Topic & { id: string })[] {
  const topics = getSubjectTopics(subjectId);
  const term = searchTerm.toLowerCase();
  
  return topics.filter(topic =>
    topic.name.toLowerCase().includes(term) ||
    topic.description.toLowerCase().includes(term)
  );
}

export function filterVideosByDifficulty(videos: Video[], difficulty: string): Video[] {
  if (difficulty === 'all') return videos;
  return videos.filter(video => video.difficulty === difficulty);
}
