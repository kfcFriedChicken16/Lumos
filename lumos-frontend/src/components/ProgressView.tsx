"use client";

import { MasteryMap } from "@/types/study";

interface ProgressViewProps {
  mastery: MasteryMap;
  subtopics: string[];
}

export default function ProgressView({ mastery, subtopics }: ProgressViewProps) {
  const values = subtopics.map(s => mastery[s] ?? 0);
  const average = values.length ? Math.round(100 * values.reduce((a, b) => a + b, 0) / values.length) : 0;

  return (
    <div className="rounded-xl border border-orange-200 bg-white/80 backdrop-blur-sm p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <span className="w-2 h-2 bg-pink-500 rounded-full"></span>
          Progress
        </h3>
        <span className="text-lg font-bold text-orange-600">{average}%</span>
      </div>
      
      <div className="space-y-3">
        {subtopics.map((subtopic) => {
          const progress = Math.round(100 * (mastery[subtopic] ?? 0));
          return (
            <div key={subtopic}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 truncate">
                  {subtopic}
                </span>
                <span className="text-xs text-gray-500 ml-2">
                  {progress}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-2 bg-gradient-to-r from-orange-400 to-pink-500 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      
      {average >= 80 && (
        <div className="mt-3 p-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-700 font-medium text-center">
            🎉 Great progress! Keep it up!
          </p>
        </div>
      )}
    </div>
  );
}
