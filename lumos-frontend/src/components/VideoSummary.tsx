'use client';

import { useState } from 'react';
import { BookOpen, Target, Clock, Star, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import type { VideoSummary } from '@/lib/youtube-service';

interface VideoSummaryProps {
  summary: VideoSummary | null;
  isLoading?: boolean;
  className?: string;
}

export default function VideoSummary({ summary, isLoading = false, className = '' }: VideoSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (isLoading) {
    return (
      <div className={`bg-white/80 backdrop-blur-sm rounded-3xl border border-orange-200/50 p-6 shadow-lg shadow-orange-100/50 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
            <Loader2 className="w-4 h-4 text-white animate-spin" />
          </div>
          <h3 className="font-semibold text-gray-900">AI Summary</h3>
        </div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className={`bg-white/80 backdrop-blur-sm rounded-3xl border border-orange-200/50 p-6 shadow-lg shadow-orange-100/50 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <AlertCircle className="w-4 h-4 text-gray-500" />
          </div>
          <h3 className="font-semibold text-gray-900">AI Summary</h3>
        </div>
        <p className="text-gray-600">Summary not available for this video.</p>
      </div>
    );
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-green-100 text-green-800';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-3xl border border-orange-200/50 shadow-lg shadow-orange-100/50 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-orange-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900">AI Learning Summary</h3>
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </button>
        </div>
        
        {/* Overview */}
        <div className="mt-4">
          <p className="text-gray-700 leading-relaxed">{summary.summary}</p>
        </div>

        {/* Quick Stats */}
        <div className="mt-4 flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">{summary.estimatedDuration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-gray-500" />
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(summary.difficulty)}`}>
              {summary.difficulty}
            </span>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Learning Objectives */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-orange-500" />
              <h4 className="font-medium text-gray-900">Learning Objectives</h4>
            </div>
            <ul className="space-y-2">
              {summary.learningObjectives.map((objective, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{objective}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Key Points */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BookOpen className="w-5 h-5 text-orange-500" />
              <h4 className="font-medium text-gray-900">Key Concepts</h4>
            </div>
            <ul className="space-y-2">
              {summary.keyPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700">{point}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Prerequisites */}
          {summary.prerequisites.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-blue-500" />
                <h4 className="font-medium text-gray-900">Prerequisites</h4>
              </div>
              <ul className="space-y-2">
                {summary.prerequisites.map((prereq, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700">{prereq}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
