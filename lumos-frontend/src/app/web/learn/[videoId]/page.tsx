'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Clock, Star } from 'lucide-react';
import VideoPlayer from '@/components/VideoPlayer';
import AIChatSidebar from '@/components/AIChatSidebar';
import VideoSummary from '@/components/VideoSummary';
import { getVideoById, formatDuration } from '@/lib/database-resources';
import type { Video } from '@/lib/database-resources';
import { youtubeService } from '@/lib/youtube-service';
import type { VideoSummary as VideoSummaryType } from '@/lib/youtube-service';

export default function VideoLearningPage() {
  const { videoId } = useParams<{ videoId: string }>();
  const [video, setVideo] = useState<Video | null>(null);

  // Helper function to parse duration string to seconds
  const parseDurationToSeconds = (duration: string): number => {
    const parts = duration.split(':').map(Number);
    if (parts.length === 2) {
      return parts[0] * 60 + parts[1];
    } else if (parts.length === 3) {
      return parts[0] * 3600 + parts[1] * 60 + parts[2];
    }
    return 0;
  };
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [videoSummary, setVideoSummary] = useState<VideoSummaryType | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);

  // Load video data
  useEffect(() => {
    async function loadVideo() {
      if (!videoId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Check if this is a YouTube ID (11 characters) or database ID (UUID)
        const isYouTubeId = /^[a-zA-Z0-9_-]{11}$/.test(videoId as string);
        
                            if (isYouTubeId) {
                      // This is a direct YouTube ID from the video learning page
                      // Try to fetch real video data from YouTube
                      try {
                        const videoData = await youtubeService.getVideoData(videoId as string);
                        if (videoData) {
                          setVideo({
                            id: videoId as string,
                            youtube_id: videoId as string,
                            title: videoData.title,
                            description: videoData.description,
                            duration: parseDurationToSeconds(videoData.duration),
                            difficulty: 'beginner',
                            source: 'YouTube',
                            topic_id: 'general',
                            created_at: new Date().toISOString()
                          });
                          
                          // Generate AI summary
                          setSummaryLoading(true);
                          try {
                            const summary = await youtubeService.generateVideoSummary(videoData);
                            setVideoSummary(summary);
                          } catch (summaryError) {
                            console.error('Error generating summary:', summaryError);
                          } finally {
                            setSummaryLoading(false);
                          }
                        } else {
                          // Fallback to mock video object
                          setVideo({
                            id: videoId as string,
                            youtube_id: videoId as string,
                            title: 'YouTube Video',
                            description: 'Learning with AI assistance',
                            duration: 0,
                            difficulty: 'beginner',
                            source: 'YouTube',
                            topic_id: 'general',
                            created_at: new Date().toISOString()
                          });
                        }
                      } catch (youtubeError) {
                        console.error('Error fetching YouTube data:', youtubeError);
                        // Fallback to mock video object
                        setVideo({
                          id: videoId as string,
                          youtube_id: videoId as string,
                          title: 'YouTube Video',
                          description: 'Learning with AI assistance',
                          duration: 0,
                          difficulty: 'beginner',
                          source: 'YouTube',
                          topic_id: 'general',
                          created_at: new Date().toISOString()
                        });
                      }
                    } else {
                      // This is a database ID, try to load from database
                      const videoData = await getVideoById(videoId as string);
                      setVideo(videoData);
                    }
      } catch (error) {
        console.error('Error loading video:', error);
        setError('Failed to load video');
      } finally {
        setLoading(false);
      }
    }
    
    loadVideo();
  }, [videoId]);

  const handleTimeUpdate = (time: number, totalDuration: number) => {
    setCurrentTime(time);
    setDuration(totalDuration);
  };

  const handleSeekTo = (time: number) => {
    // This will be handled by the VideoPlayer component
    console.log('Seeking to:', time);
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <p className="mt-4 text-gray-600">Loading video...</p>
        </div>
      </main>
    );
  }

  if (error || !video) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Video Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The requested video could not be found.'}</p>
          <Link href="/web/resources" className="text-orange-600 hover:text-orange-700">
            Back to Resources Hub
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-orange-200/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/web/video-learning"
                className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Video Learning
              </Link>
              
              <div className="h-6 w-px bg-gray-300"></div>
              
              <div>
                <h1 className="text-xl font-bold text-gray-900">{video.title}</h1>
                <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatDuration(video.duration)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4" />
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      video.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
                      video.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {video.difficulty}
                    </span>
                  </div>
                  <span className="text-blue-600 font-medium">{video.source}</span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              {isSidebarOpen ? 'Hide AI Chat' : 'Show AI Chat'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className={`${isSidebarOpen ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
            <VideoPlayer
              youtubeId={video.youtube_id}
              title={video.title}
              onTimeUpdate={handleTimeUpdate}
              onStateChange={(state) => console.log('Player state:', state)}
              className="w-full"
            />
            
            {/* AI Summary */}
            <VideoSummary 
              summary={videoSummary} 
              isLoading={summaryLoading}
              className="mt-6"
            />
          </div>

          {/* AI Chat Sidebar */}
          {isSidebarOpen && (
            <div className="lg:col-span-1">
              <AIChatSidebar
                videoTitle={video.title}
                currentTime={currentTime}
                duration={duration}
                onSeekTo={handleSeekTo}
                className="h-[calc(100vh-200px)]"
              />
            </div>
          )}
        </div>

        {/* Learning Tips */}
        <div className="mt-12 bg-white/80 backdrop-blur-sm rounded-3xl border border-orange-200/50 p-8 shadow-lg shadow-orange-100/50">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              🎯 Learning Tips
            </h2>
            <p className="text-lg text-gray-600">
              Make the most of your learning experience with these helpful strategies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
              <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white mb-4">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Take Notes</h3>
              <p className="text-sm text-gray-600">
                Pause the video and jot down key concepts. The AI assistant can help clarify any confusing parts.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white mb-4">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Ask Questions</h3>
              <p className="text-sm text-gray-600">
                Use the AI chat to ask questions about specific moments in the video. Get instant clarification!
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-200">
              <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center text-white mb-4">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Review & Reflect</h3>
              <p className="text-sm text-gray-600">
                After watching, ask the AI to summarize key points or explain concepts in your own words.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
