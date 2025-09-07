// Subject Page
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Play, ExternalLink, Clock, Star, BookOpen, Search, Filter, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
// import { getSubjectById, getSubjectTopics, searchTopics, filterVideosByDifficulty, formatDuration, getYouTubeThumbnailUrl, DatabaseError } from '@/lib/database-resources';
// import type { Subject, Topic, Video } from '@/lib/database-resources';
import resourcesData from '@/data/resources.json';

// Define types based on the JSON structure
interface Video {
  title: string;
  url: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  source: string;
  description: string;
}

interface Topic {
  id: string;
  name: string;
  description: string;
  videos: Video[];
}

interface Subject {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
  topics: { [key: string]: Topic };
}

// Helper function to format duration
function formatDuration(duration: string): string {
  return duration;
}

export default function SubjectPage() {
  const { subject } = useParams<{ subject: string }>();
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');
  const [subjectData, setSubjectData] = useState<Subject | null>(null);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filteredTopics, setFilteredTopics] = useState<Topic[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false); // Changed to false since we're using local data
  const [error, setError] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);

  // Load subject and topics data from JSON
  useEffect(() => {
    if (!subject) return;
    
    try {
      setError(null);
      const subjectKey = subject as string;
      const subjectInfo = (resourcesData.subjects as any)[subjectKey];
      
      if (!subjectInfo) {
        setError('Subject not found');
        return;
      }
      
      // Transform the data to match our expected format
      const transformedSubject: Subject = {
        id: subjectKey,
        name: subjectInfo.name,
        icon: subjectInfo.icon,
        color: subjectInfo.color,
        description: subjectInfo.description,
        topics: subjectInfo.topics
      };
      
      const transformedTopics: Topic[] = Object.entries(subjectInfo.topics).map(([id, topicData]: [string, any]) => ({
        id,
        name: topicData.name,
        description: topicData.description,
        videos: topicData.videos
      }));
      
      setSubjectData(transformedSubject);
      setTopics(transformedTopics);
      setFilteredTopics(transformedTopics);
    } catch (error) {
      console.error('Error loading subject data:', error);
      setError('An unexpected error occurred. Please contact support.');
    }
  }, [subject]);

  // Filter topics based on search term
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredTopics(topics);
      setSearchError(null);
      return;
    }

    try {
      setSearchError(null);
      const searchResults = topics.filter(topic => 
        topic.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        topic.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTopics(searchResults);
    } catch (error) {
      console.error('Error searching topics:', error);
      setSearchError('Search failed. Please try again.');
      // Fallback to showing all topics if search fails
      setFilteredTopics(topics);
    }
  }, [searchTerm, topics]);

  // Load videos when topic is selected
  useEffect(() => {
    if (!selectedTopic) {
      setVideos([]);
      setVideoError(null);
      return;
    }

    try {
      setVideoError(null);
      const selectedTopicData = topics.find(t => t.id === selectedTopic);
      
      if (!selectedTopicData) {
        setVideos([]);
        return;
      }
      
      let videoResults = selectedTopicData.videos;
      
      // Filter by difficulty if not "all"
      if (selectedDifficulty !== 'all') {
        videoResults = videoResults.filter(video => video.difficulty === selectedDifficulty);
      }
      
      setVideos(videoResults);
    } catch (error) {
      console.error('Error loading videos:', error);
      setVideoError('Failed to load videos. Please try again.');
      setVideos([]);
    }
  }, [selectedTopic, selectedDifficulty, topics]);

  // Retry loading data
  const retryLoadData = () => {
    setError(null);
    window.location.reload();
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          <p className="mt-4 text-gray-600">Loading subject...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-8 max-w-md mx-auto">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-lg font-semibold text-red-800 mb-2">Unable to Load Subject</h1>
            <p className="text-red-600 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={retryLoadData}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <div>
                <Link href="/web/resources" className="text-orange-600 hover:text-orange-700">
                  Back to Resources Hub
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!subjectData) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Subject Not Found</h1>
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
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              href="/web/resources"
              className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Resources Hub
            </Link>
          </div>
          
          <div className="flex items-center gap-4 mb-6">
            <div className={`w-16 h-16 bg-gradient-to-br ${subjectData.color} rounded-2xl flex items-center justify-center text-3xl shadow-lg`}>
              {subjectData.icon}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{subjectData.name}</h1>
              <p className="text-gray-600">{subjectData.description}</p>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search topics..."
                value={searchTerm ?? ''}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border-2 border-orange-200 bg-white/50 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100 outline-none"
              />
            </div>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value as 'all' | 'beginner' | 'intermediate' | 'advanced')}
              className="px-4 py-3 rounded-xl border-2 border-orange-200 bg-white/50 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100 outline-none"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>

          {/* Search Error Message */}
          {searchError && (
            <div className="max-w-2xl mt-4">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-red-800 text-sm font-medium">{searchError}</p>
                  <p className="text-red-600 text-xs mt-1">Showing all topics instead.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Topics and Videos */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Topics Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-orange-200/50 p-6 shadow-lg shadow-orange-100/50">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Topics</h2>
              <div className="space-y-2">
                {filteredTopics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => setSelectedTopic(selectedTopic === topic.id ? null : topic.id)}
                    className={`w-full text-left p-3 rounded-xl transition-all ${
                      selectedTopic === topic.id
                        ? 'bg-orange-100 text-orange-700 border border-orange-200'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{topic.name}</h3>
                        <p className="text-sm text-gray-500">{topic.description}</p>
                      </div>
                      <ChevronRight className={`w-4 h-4 transition-transform ${
                        selectedTopic === topic.id ? 'rotate-90' : ''
                      }`} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Videos Content */}
          <div className="lg:col-span-2">
            {selectedTopic ? (
              <div className="space-y-6">
                {filteredTopics
                  .filter(topic => topic.id === selectedTopic)
                  .map(topic => (
                    <div key={topic.id} className="bg-white/80 backdrop-blur-sm rounded-3xl border border-orange-200/50 p-6 shadow-lg shadow-orange-100/50">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">{topic.name}</h2>
                      <p className="text-gray-600 mb-6">{topic.description}</p>
                      
                      {/* Video Error Message */}
                      {videoError && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 mb-6">
                          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-red-800 text-sm font-medium">{videoError}</p>
                            <p className="text-red-600 text-xs mt-1">No videos available for this topic.</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="space-y-4">
                        {videos.map((video, index) => (
                          <div key={video.title} className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-4 border border-gray-200 hover:shadow-md transition-shadow">
                            <div className="flex items-start gap-4">
                              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                                <Play className="w-6 h-6" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-semibold text-gray-900 mb-2">{video.title}</h3>
                                <p className="text-sm text-gray-600 mb-3">{video.description}</p>
                                
                                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
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
                                
                                <a
                                  href={video.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium text-sm transition-colors"
                                >
                                  Watch Video
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-orange-200/50 p-8 shadow-lg shadow-orange-100/50 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4">
                  <Play className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Select a Topic</h2>
                <p className="text-gray-600">Choose a topic from the sidebar to view curated educational videos</p>
              </div>
            )}
          </div>
        </div>

        {/* How to Find More Resources */}
        <div className="mt-16 bg-white/80 backdrop-blur-sm rounded-3xl border border-orange-200/50 p-8 shadow-lg shadow-orange-100/50">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              🚀 Ready to Explore More?
            </h2>
            <p className="text-lg text-gray-600">
              These are just our curated recommendations. Here's how to find amazing {subjectData.name.toLowerCase()} content on your own:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Search Tips for {subjectData.name}</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• "{subjectData.name} tutorial [topic]"</li>
                <li>• "{subjectData.name} explained simply"</li>
                <li>• "Best {subjectData.name} videos for beginners"</li>
                <li>• "{subjectData.name} crash course"</li>
              </ul>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200">
              <h3 className="text-lg font-bold text-gray-900 mb-3">Recommended Channels</h3>
              <ul className="text-sm text-gray-600 space-y-2">
                <li>• Khan Academy</li>
                <li>• 3Blue1Brown (Math)</li>
                <li>• Crash Course</li>
                <li>• Numberphile (Math)</li>
                <li>• Veritasium (Science)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
