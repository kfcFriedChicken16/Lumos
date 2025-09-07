'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Play, Link as LinkIcon, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { youtubeService } from '@/lib/youtube-service';

export default function VideoLearningPage() {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [videoData, setVideoData] = useState<any>(null);
  const [summary, setSummary] = useState<any>(null);
  const router = useRouter();

  // Validate YouTube URL and fetch video data with summary
  const validateAndFetchVideo = async (url: string) => {
    try {
      const { videoData, summary } = await youtubeService.getVideoWithSummary(url);
      
      if (!videoData) {
        throw new Error('Failed to fetch video data. Please check your link.');
      }

      return { videoData, summary };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to validate YouTube URL');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl.trim()) {
      setError('Please enter a YouTube URL');
      return;
    }

    setIsValidating(true);
    setError(null);
    setIsValid(false);
    setVideoData(null);
    setSummary(null);

    try {
      const { videoData, summary } = await validateAndFetchVideo(youtubeUrl.trim());
      
      setVideoData(videoData);
      setSummary(summary);
      setIsValid(true);
      
      // Redirect to the video learning interface
      router.push(`/web/learn/${videoData.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate YouTube URL');
    } finally {
      setIsValidating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setYoutubeUrl(e.target.value);
    setError(null);
    setIsValid(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-orange-200/50">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Link 
                              href="/web/dashboard"
              className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-lg">
              <Play className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Video Learning</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Paste any YouTube video link and learn with AI assistance. Get instant explanations, 
              ask questions, and dive deeper into any topic.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-orange-200/50 p-8 shadow-lg shadow-orange-100/50">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* URL Input */}
            <div>
              <label htmlFor="youtube-url" className="block text-lg font-semibold text-gray-900 mb-3">
                YouTube Video URL
              </label>
              <div className="relative">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="youtube-url"
                  type="url"
                  value={youtubeUrl}
                  onChange={handleInputChange}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full pl-12 pr-4 py-4 text-lg border-2 border-orange-200 rounded-xl bg-white/50 focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100 outline-none transition-all"
                  disabled={isValidating}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {isValid && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <p className="text-green-800 font-medium">Video Ready!</p>
                </div>
                <p className="text-green-700 text-sm mb-3">Redirecting to learning interface...</p>
                
                {videoData && (
                  <div className="bg-white rounded-lg p-3 border border-green-200">
                    <h4 className="font-medium text-gray-900 text-sm mb-1">{videoData.title}</h4>
                    <p className="text-xs text-gray-600 mb-1">Channel: {videoData.channelTitle}</p>
                    <p className="text-xs text-gray-600">Duration: {videoData.duration}</p>
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isValidating || !youtubeUrl.trim()}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 px-8 rounded-xl font-semibold text-lg hover:from-orange-600 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  Start Learning with AI
                </>
              )}
            </button>
          </form>

          {/* Examples */}
          <div className="mt-8 pt-8 border-t border-orange-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Example URLs:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600 font-mono">youtube.com/watch?v=dQw4w9WgXcQ</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-600 font-mono">youtu.be/dQw4w9WgXcQ</p>
              </div>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-orange-200/50 p-6 shadow-lg shadow-orange-100/50">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center text-white mb-4">
              <Play className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Any YouTube Video</h3>
            <p className="text-gray-600">Paste any YouTube link - educational, tutorial, lecture, or entertainment. Our AI adapts to any content.</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-orange-200/50 p-6 shadow-lg shadow-orange-100/50">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white mb-4">
              <LinkIcon className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Instant AI Chat</h3>
            <p className="text-gray-600">Ask questions about specific moments, get explanations, or request summaries - all in real-time.</p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-orange-200/50 p-6 shadow-lg shadow-orange-100/50">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center text-white mb-4">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Smart Validation</h3>
            <p className="text-gray-600">Our AI validates your YouTube links to ensure they're legitimate before starting your learning session.</p>
          </div>
        </div>
      </div>
    </main>
  );
}
