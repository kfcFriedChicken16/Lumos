'use client';

import { useState, useEffect } from 'react';
import { useTimebank } from '@/contexts/TimebankContext';
import { Clock, User, BookOpen, Star, MessageSquare, Phone, Video, Mic, MicOff, X } from 'lucide-react';

export default function ActiveSession() {
  const { activeSession, endSession } = useTimebank();
  const [duration, setDuration] = useState(0);
  const [showEndModal, setShowEndModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [isMuted, setIsMuted] = useState(false);

  // Timer for session duration
  useEffect(() => {
    if (!activeSession) return;

    const timer = setInterval(() => {
      const startTime = new Date(activeSession.startTime);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60));
      setDuration(diffMinutes);
    }, 1000);

    return () => clearInterval(timer);
  }, [activeSession]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const handleEndSession = () => {
    endSession(rating, feedback);
    setShowEndModal(false);
    setRating(5);
    setFeedback('');
  };

  if (!activeSession) return null;

  return (
    <>
      {/* Main Session Interface */}
      <div className="fixed inset-0 bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 z-40 overflow-y-auto">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-orange-200/50 p-6">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white">
                <User className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Tutoring {activeSession.studentName}
                </h1>
                <p className="text-gray-600">{activeSession.subject}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-xl">
                <Clock className="w-4 h-4" />
                <span className="font-medium">{formatDuration(duration)}</span>
              </div>
              
              <button
                onClick={() => setShowEndModal(true)}
                className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-xl font-medium transition-colors"
              >
                End Session
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto p-6 min-h-[calc(100vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Video/Audio Interface */}
            <div className="lg:col-span-2">
              <div className="bg-gray-900 rounded-3xl min-h-[400px] flex flex-col relative overflow-hidden">
                {/* Mock video area */}
                <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                  <div className="text-center text-white">
                    <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-12 h-12" />
                    </div>
                    <h3 className="text-xl font-medium mb-2">{activeSession.studentName}</h3>
                    <p className="text-gray-300">Audio/Video Call in Progress</p>
                  </div>
                </div>

                {/* Controls */}
                <div className="p-6 bg-gray-800/50 backdrop-blur-sm">
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className={`p-4 rounded-full transition-colors ${
                        isMuted 
                          ? 'bg-red-500 hover:bg-red-600' 
                          : 'bg-gray-600 hover:bg-gray-700'
                      } text-white`}
                    >
                      {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                    </button>
                    
                    <button className="p-4 bg-gray-600 hover:bg-gray-700 rounded-full text-white transition-colors">
                      <Video className="w-6 h-6" />
                    </button>
                    
                    <button className="p-4 bg-blue-600 hover:bg-blue-700 rounded-full text-white transition-colors">
                      <MessageSquare className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Session Info & Tools */}
            <div className="space-y-6">
              {/* Session Details */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-orange-200/50 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-orange-500" />
                  Session Details
                </h3>
                
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Subject:</span>
                    <p className="font-medium text-gray-900">{activeSession.subject}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-500">Student:</span>
                    <p className="font-medium text-gray-900">{activeSession.studentName}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-500">Duration:</span>
                    <p className="font-medium text-gray-900">{formatDuration(duration)}</p>
                  </div>
                  
                  <div>
                    <span className="text-sm text-gray-500">Estimated Credits:</span>
                    <p className="font-bold text-green-600">{Math.max(1, Math.round(duration * 0.8))}</p>
                  </div>
                </div>
              </div>

              {/* Quick Notes */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-orange-200/50 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Session Notes</h3>
                
                <textarea
                  placeholder="Add notes about what you covered..."
                  className="w-full h-32 p-3 border border-gray-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-orange-300"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
              </div>

              {/* Tips */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl border border-blue-200 p-6">
                <h3 className="text-lg font-bold text-blue-900 mb-4">Tutoring Tips</h3>
                <ul className="text-sm text-blue-700 space-y-2">
                  <li>• Ask questions to check understanding</li>
                  <li>• Break complex topics into smaller parts</li>
                  <li>• Encourage the student to explain back</li>
                  <li>• Be patient and supportive</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* End Session Modal */}
      {showEndModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">End Session</h2>
              <p className="text-gray-600">How was your tutoring session?</p>
            </div>

            {/* Rating */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Rate this session:
              </label>
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => setRating(star)}
                    className="p-1"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Feedback */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session notes (optional):
              </label>
              <textarea
                placeholder="What did you cover? Any highlights?"
                className="w-full p-3 border border-gray-200 rounded-xl resize-none h-24 focus:outline-none focus:ring-2 focus:ring-orange-300"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>

            {/* Session Summary */}
            <div className="bg-green-50 rounded-xl p-4 mb-6 border border-green-200">
              <div className="text-center">
                <p className="text-sm text-green-700">You'll earn approximately:</p>
                <p className="text-2xl font-bold text-green-600">
                  {Math.max(1, Math.round(duration * 0.8))} credits
                </p>
                <p className="text-xs text-green-600">For {formatDuration(duration)} of tutoring</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setShowEndModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors"
              >
                Continue Session
              </button>
              <button
                onClick={handleEndSession}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-medium py-3 px-6 rounded-xl transition-colors"
              >
                End & Rate
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
