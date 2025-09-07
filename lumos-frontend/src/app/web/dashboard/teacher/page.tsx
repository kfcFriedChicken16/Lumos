'use client';

import React from 'react';

export default function TeacherDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="mb-6">
          <div className="w-24 h-24 bg-gray-600 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 5.477 5.754 5 7.5 5s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.523 18.246 19 16.5 19c-1.746 0-3.332-.477-4.5-1.253" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-400 mb-2">Under Development</h1>
          <p className="text-gray-500 text-lg">
            Teacher features are coming soon! We're working hard to bring you the best teaching experience.
          </p>
        </div>
        
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-gray-300 mb-3">What's Coming</h3>
          <ul className="text-gray-400 space-y-2 text-left">
            <li className="flex items-center">
              <span className="w-2 h-2 bg-gray-500 rounded-full mr-3"></span>
              Advanced class management
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-gray-500 rounded-full mr-3"></span>
              Student progress tracking
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-gray-500 rounded-full mr-3"></span>
              Resource library
            </li>
            <li className="flex items-center">
              <span className="w-2 h-2 bg-gray-500 rounded-full mr-3"></span>
              Assessment tools
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
