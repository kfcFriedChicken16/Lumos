import { createClient } from '@supabase/supabase-js';

// Environment variable guards to avoid silent undefineds
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) throw new Error('Missing Supabase env vars');
export const supabase = createClient(url, key, {
  auth: {
    storage: typeof window !== 'undefined' ? {
      getItem: (key: string) => {
        try {
          return sessionStorage.getItem(key);
        } catch (error) {
          console.error('Error getting item from sessionStorage:', error);
          return null;
        }
      },
      setItem: (key: string, value: string) => {
        try {
          sessionStorage.setItem(key, value);
        } catch (error) {
          console.error('Error setting item in sessionStorage:', error);
        }
      },
      removeItem: (key: string) => {
        try {
          sessionStorage.removeItem(key);
        } catch (error) {
          console.error('Error removing item from sessionStorage:', error);
        }
      }
    } : undefined,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

// Types matching your database schema
export interface Video {
  id: string;
  youtube_id: string;
  title: string;
  description: string;
  duration: number; // in seconds
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  source: string;
  topic_id: string;
  created_at: string;
}

export interface Topic {
  id: string;
  subject_id: string;
  name: string;
  description: string;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  created_at: string;
}

export interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  created_at: string;
}

// Input sanitization to prevent SQL injection and handle edge cases
const sanitize = (q: string) => q.replace(/,/g, ' ').replace(/\s+/g, ' ').trim();

// Custom error class for database errors
export class DatabaseError extends Error {
  constructor(message: string, public readonly originalError?: any) {
    super(message);
    this.name = 'DatabaseError';
  }
}

// Database functions to replace JSON-based functions
export async function getAllSubjects(limit = 50): Promise<Subject[]> {
  try {
    // Add timeout to prevent hanging requests
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout')), 5000)
    );
    
    const queryPromise = supabase
      .from('subjects')
      .select('id,name,icon,color,description,created_at')
      .order('name', { ascending: true })
      .limit(limit);
    
    const { data, error } = await Promise.race([queryPromise, timeoutPromise]) as any;

    if (error) {
      console.error('Supabase error in getAllSubjects:', error);
      throw new DatabaseError('Failed to load subjects. Please try again later.', error);
    }
    
    return data ?? [];
  } catch (e) {
    if (e instanceof DatabaseError) {
      throw e;
    }
    console.error('Unexpected error in getAllSubjects:', e);
    throw new DatabaseError('Server error. Please contact support if this persists.');
  }
}

export async function getSubjectById(subjectId: string): Promise<Subject | null> {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('id,name,icon,color,description,created_at')
      .eq('id', subjectId)
      .single();

    if (error) {
      console.error('Supabase error in getSubjectById:', error);
      throw new DatabaseError('Failed to load subject. Please try again later.', error);
    }
    
    return data;
  } catch (e) {
    if (e instanceof DatabaseError) {
      throw e;
    }
    console.error('Unexpected error in getSubjectById:', e);
    throw new DatabaseError('Server error. Please contact support if this persists.');
  }
}

export async function getVideoById(videoId: string): Promise<Video | null> {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('id,youtube_id,title,description,duration,difficulty,source,topic_id,created_at')
      .eq('id', videoId)
      .single();

    if (error) {
      console.error('Supabase error in getVideoById:', error);
      throw new DatabaseError('Failed to load video. Please try again later.', error);
    }
    
    return data;
  } catch (e) {
    if (e instanceof DatabaseError) {
      throw e;
    }
    console.error('Unexpected error in getVideoById:', e);
    throw new DatabaseError('Server error. Please contact support if this persists.');
  }
}

export async function getSubjectTopics(subjectId: string, limit = 50): Promise<Topic[]> {
  try {
    const { data, error } = await supabase
      .from('topics')
      .select('id,subject_id,name,description,difficulty_level,created_at')
      .eq('subject_id', subjectId)
      .order('name', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Supabase error in getSubjectTopics:', error);
      throw new DatabaseError('Failed to load topics. Please try again later.', error);
    }
    
    return data ?? [];
  } catch (e) {
    if (e instanceof DatabaseError) {
      throw e;
    }
    console.error('Unexpected error in getSubjectTopics:', e);
    throw new DatabaseError('Server error. Please contact support if this persists.');
  }
}

export async function getTopicVideos(topicId: string, limit = 50): Promise<Video[]> {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('id,youtube_id,title,description,duration,difficulty,source,topic_id,created_at')
      .eq('topic_id', topicId)
      .order('title', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Supabase error in getTopicVideos:', error);
      throw new DatabaseError('Failed to load videos. Please try again later.', error);
    }
    
    return data ?? [];
  } catch (e) {
    if (e instanceof DatabaseError) {
      throw e;
    }
    console.error('Unexpected error in getTopicVideos:', e);
    throw new DatabaseError('Server error. Please contact support if this persists.');
  }
}

export async function searchSubjects(query: string, limit = 50): Promise<Subject[]> {
  const q = sanitize(query);
  if (!q) return [];
  
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('id,name,icon,color,description,created_at')
      .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
      .order('name', { ascending: true })
      .limit(limit);
    
    if (error) {
      console.error('Supabase error in searchSubjects:', error);
      throw new DatabaseError('Failed to search subjects. Please try again later.', error);
    }
    
    return data ?? [];
  } catch (e) {
    if (e instanceof DatabaseError) {
      throw e;
    }
    console.error('Unexpected error in searchSubjects:', e);
    throw new DatabaseError('Server error. Please contact support if this persists.');
  }
}

export async function searchTopics(query: string, subjectId?: string, limit = 50): Promise<Topic[]> {
  const q = sanitize(query);
  if (!q) return [];
  
  try {
    let queryBuilder = supabase
      .from('topics')
      .select('id,subject_id,name,description,difficulty_level,created_at')
      .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
      .order('name', { ascending: true })
      .limit(limit);

    if (subjectId) {
      queryBuilder = queryBuilder.eq('subject_id', subjectId);
    }

    const { data, error } = await queryBuilder;
    if (error) {
      console.error('Supabase error in searchTopics:', error);
      throw new DatabaseError('Failed to search topics. Please try again later.', error);
    }
    
    return data ?? [];
  } catch (e) {
    if (e instanceof DatabaseError) {
      throw e;
    }
    console.error('Unexpected error in searchTopics:', e);
    throw new DatabaseError('Server error. Please contact support if this persists.');
  }
}

export async function searchVideos(query: string, topicId?: string, limit = 50): Promise<Video[]> {
  const q = sanitize(query);
  if (!q) return [];
  
  try {
    let queryBuilder = supabase
      .from('videos')
      .select('id,youtube_id,title,description,duration,difficulty,source,topic_id,created_at')
      .textSearch('tsv', q, { type: 'websearch', config: 'english' })
      .order('created_at', { ascending: false })
      .limit(limit);

    if (topicId) {
      queryBuilder = queryBuilder.eq('topic_id', topicId);
    }

    const { data, error } = await queryBuilder;
    if (error) {
      console.error('Supabase error in searchVideos:', error);
      throw new DatabaseError('Failed to search videos. Please try again later.', error);
    }
    
    return data ?? [];
  } catch (e) {
    if (e instanceof DatabaseError) {
      throw e;
    }
    console.error('Unexpected error in searchVideos:', e);
    throw new DatabaseError('Server error. Please contact support if this persists.');
  }
}

export async function filterVideosByDifficulty(
  topicId: string, 
  difficulty: 'beginner' | 'intermediate' | 'advanced',
  limit = 50
): Promise<Video[]> {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('id,youtube_id,title,description,duration,difficulty,source,topic_id,created_at')
      .eq('topic_id', topicId)
      .eq('difficulty', difficulty)
      .order('title', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Supabase error in filterVideosByDifficulty:', error);
      throw new DatabaseError('Failed to filter videos. Please try again later.', error);
    }
    
    return data ?? [];
  } catch (e) {
    if (e instanceof DatabaseError) {
      throw e;
    }
    console.error('Unexpected error in filterVideosByDifficulty:', e);
    throw new DatabaseError('Server error. Please contact support if this persists.');
  }
}

// Helper function to format duration from seconds back to MM:SS or HH:MM:SS
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}

// Helper function to get YouTube embed URL
export function getYouTubeEmbedUrl(youtubeId: string): string {
  return `https://www.youtube.com/embed/${youtubeId}`;
}

// Helper function to get YouTube thumbnail URL with fallback
export function getYouTubeThumbnailUrl(youtubeId: string, quality: 'maxres' | 'hq' = 'maxres'): string {
  const baseUrl = `https://img.youtube.com/vi/${youtubeId}`;
  return quality === 'maxres' 
    ? `${baseUrl}/maxresdefault.jpg` 
    : `${baseUrl}/hqdefault.jpg`;
}

// Get subject with topic count
export async function getSubjectWithTopicCount(subjectId: string): Promise<{ subject: Subject; topicCount: number } | null> {
  try {
    const subject = await getSubjectById(subjectId);
    if (!subject) return null;

    const topics = await getSubjectTopics(subjectId);
    return {
      subject,
      topicCount: topics.length
    };
  } catch (e) {
    if (e instanceof DatabaseError) {
      throw e;
    }
    console.error('Unexpected error in getSubjectWithTopicCount:', e);
    throw new DatabaseError('Server error. Please contact support if this persists.');
  }
}

// Get topic with video count
export async function getTopicWithVideoCount(topicId: string): Promise<{ topic: Topic; videoCount: number } | null> {
  try {
    const { data: topic, error: topicError } = await supabase
      .from('topics')
      .select('id,subject_id,name,description,difficulty_level,created_at')
      .eq('id', topicId)
      .single();

    if (topicError) {
      console.error('Supabase error in getTopicWithVideoCount:', topicError);
      throw new DatabaseError('Failed to load topic. Please try again later.', topicError);
    }

    const videos = await getTopicVideos(topicId);
    return {
      topic,
      videoCount: videos.length
    };
  } catch (e) {
    if (e instanceof DatabaseError) {
      throw e;
    }
    console.error('Unexpected error in getTopicWithVideoCount:', e);
    throw new DatabaseError('Server error. Please contact support if this persists.');
  }
}

// Pagination helper for large datasets
export async function getPaginatedVideos(
  topicId: string, 
  page: number = 1, 
  pageSize: number = 20
): Promise<{ videos: Video[]; total: number; hasMore: boolean }> {
  try {
    const offset = (page - 1) * pageSize;
    
    // Get total count
    const { count, error: countError } = await supabase
      .from('videos')
      .select('*', { count: 'exact', head: true })
      .eq('topic_id', topicId);
    
    if (countError) {
      console.error('Supabase error in getPaginatedVideos (count):', countError);
      throw new DatabaseError('Failed to load video count. Please try again later.', countError);
    }
    
    // Get paginated data
    const { data, error } = await supabase
      .from('videos')
      .select('id,youtube_id,title,description,duration,difficulty,source,topic_id,created_at')
      .eq('topic_id', topicId)
      .order('created_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) {
      console.error('Supabase error in getPaginatedVideos (data):', error);
      throw new DatabaseError('Failed to load videos. Please try again later.', error);
    }
    
    return {
      videos: data ?? [],
      total: count ?? 0,
      hasMore: (offset + pageSize) < (count ?? 0)
    };
  } catch (e) {
    if (e instanceof DatabaseError) {
      throw e;
    }
    console.error('Unexpected error in getPaginatedVideos:', e);
    throw new DatabaseError('Server error. Please contact support if this persists.');
  }
}
