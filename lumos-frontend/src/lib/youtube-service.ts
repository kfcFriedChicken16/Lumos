export interface YouTubeVideoData {
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  channelTitle: string;
  publishedAt: string;
  viewCount: string;
  likeCount: string;
}

export interface VideoSummary {
  keyPoints: string[];
  learningObjectives: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: string;
  prerequisites: string[];
  summary: string;
}

class YouTubeService {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY || '';
    if (!this.apiKey) {
      console.warn('YouTube API key not found. Some features may be limited.');
    }
  }

  // Extract YouTube video ID from various URL formats
  extractVideoId(url: string): string | null {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  }

  // Fetch video data from YouTube API
  async getVideoData(videoId: string): Promise<YouTubeVideoData | null> {
    if (!this.apiKey) {
      // Fallback: return basic data without API call
      return {
        id: videoId,
        title: 'YouTube Video',
        description: 'Video description not available',
        duration: '0:00',
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        channelTitle: 'Unknown Channel',
        publishedAt: new Date().toISOString(),
        viewCount: '0',
        likeCount: '0'
      };
    }

    try {
      const response = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails,statistics&key=${this.apiKey}`
      );

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.items || data.items.length === 0) {
        throw new Error('Video not found');
      }

      const video = data.items[0];
      const snippet = video.snippet;
      const contentDetails = video.contentDetails;
      const statistics = video.statistics;

      // Convert ISO 8601 duration to readable format
      const duration = this.parseDuration(contentDetails.duration);

      return {
        id: videoId,
        title: snippet.title,
        description: snippet.description,
        duration,
        thumbnail: snippet.thumbnails?.maxres?.url || snippet.thumbnails?.high?.url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        channelTitle: snippet.channelTitle,
        publishedAt: snippet.publishedAt,
        viewCount: statistics?.viewCount || '0',
        likeCount: statistics?.likeCount || '0'
      };
    } catch (error) {
      console.error('Error fetching YouTube video data:', error);
      return null;
    }
  }

  // Parse ISO 8601 duration to readable format
  private parseDuration(duration: string): string {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return '0:00';

    const hours = parseInt(match[1] || '0');
    const minutes = parseInt(match[2] || '0');
    const seconds = parseInt(match[3] || '0');

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
  }

  // Generate AI summary using the backend LLM service
  async generateVideoSummary(videoData: YouTubeVideoData): Promise<VideoSummary | null> {
    try {
      const response = await fetch('/api/generate-video-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: videoData.title,
          description: videoData.description,
          duration: videoData.duration,
          channelTitle: videoData.channelTitle
        }),
      });

      if (!response.ok) {
        throw new Error(`Summary generation failed: ${response.status}`);
      }

      const summary = await response.json();
      return summary;
    } catch (error) {
      console.error('Error generating video summary:', error);
      return null;
    }
  }

  // Get video data and generate summary in one call
  async getVideoWithSummary(youtubeUrl: string): Promise<{
    videoData: YouTubeVideoData | null;
    summary: VideoSummary | null;
  }> {
    const videoId = this.extractVideoId(youtubeUrl);
    if (!videoId) {
      throw new Error('Invalid YouTube URL');
    }

    const videoData = await this.getVideoData(videoId);
    if (!videoData) {
      throw new Error('Failed to fetch video data');
    }

    const summary = await this.generateVideoSummary(videoData);

    return { videoData, summary };
  }
}

export const youtubeService = new YouTubeService();
