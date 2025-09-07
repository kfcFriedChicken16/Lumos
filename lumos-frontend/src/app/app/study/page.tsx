"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Timer, Target, Brain, ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';

export default function StudyPage() {
  const { user } = useAuth();
  const [isTimerRunning, setIsTimerRunning] = React.useState(false);
  const [timeLeft, setTimeLeft] = React.useState(25 * 60); // 25 minutes
  const [selectedSubject, setSelectedSubject] = React.useState<string | null>(null);
  const [sessionStartTime, setSessionStartTime] = React.useState<Date | null>(null);
  const [isSavingSession, setIsSavingSession] = React.useState(false);

  // Timer effect
  React.useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTimerRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Timer completed
            setIsTimerRunning(false);
            if (sessionStartTime && user && selectedSubject) {
              const durationMinutes = Math.round((Date.now() - sessionStartTime.getTime()) / (1000 * 60));
              saveStudySession(durationMinutes, true); // Completed
            }
            setSessionStartTime(null);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, timeLeft, sessionStartTime, user, selectedSubject]);

  const subjects = [
    { name: 'Mathematics', icon: '📐', color: 'bg-blue-500' },
    { name: 'Physics', icon: '⚡', color: 'bg-purple-500' },
    { name: 'Chemistry', icon: '🧪', color: 'bg-green-500' },
    { name: 'Biology', icon: '🧬', color: 'bg-emerald-500' },
    { name: 'Computer Science', icon: '💻', color: 'bg-orange-500' },
    { name: 'Literature', icon: '📚', color: 'bg-pink-500' },
  ];

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const saveStudySession = async (durationMinutes: number, completed: boolean) => {
    if (!user || !selectedSubject) return;

    setIsSavingSession(true);
    try {
      const result = await apiClient.saveStudySession(user.id, {
        subject: selectedSubject,
        duration_minutes: durationMinutes,
        completed,
      });

      if (result.success) {
        console.log('Study session saved successfully');
      } else {
        console.error('Failed to save study session:', result.error);
      }
    } catch (error) {
      console.error('Error saving study session:', error);
    } finally {
      setIsSavingSession(false);
    }
  };

  const toggleTimer = () => {
    if (!isTimerRunning) {
      // Require subject selection before starting
      if (!selectedSubject) {
        alert('Please select a subject before starting the timer');
        return;
      }
      
      // Starting timer
      setIsTimerRunning(true);
      setSessionStartTime(new Date());
    } else {
      // Stopping timer
      setIsTimerRunning(false);
      
      // Calculate session duration and save
      if (sessionStartTime && user) {
        const durationMinutes = Math.round((Date.now() - sessionStartTime.getTime()) / (1000 * 60));
        const completed = timeLeft <= 0; // Session completed if timer reached 0
        saveStudySession(durationMinutes, completed);
      }
      
      setSessionStartTime(null);
    }
  };

  const resetTimer = () => {
    // Save current session if timer was running
    if (isTimerRunning && sessionStartTime && user) {
      const durationMinutes = Math.round((Date.now() - sessionStartTime.getTime()) / (1000 * 60));
      saveStudySession(durationMinutes, false); // Not completed since reset
    }

    setIsTimerRunning(false);
    setTimeLeft(25 * 60);
    setSessionStartTime(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      {/* Header */}
      <header className="p-4 border-b border-white/10">
        <div className="flex items-center space-x-4">
          <Link href="/" className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center space-x-3">
            <BookOpen className="w-6 h-6 text-blue-400" />
            <h1 className="text-xl font-bold">Study Support</h1>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Focus Timer */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <div className="text-center mb-6">
            <h2 className="text-lg font-semibold mb-2">Focus Timer</h2>
            <p className="text-white/70 text-sm">Stay focused with Pomodoro technique</p>
          </div>
          
          <div className="text-center mb-6">
            <div className="text-6xl font-mono font-bold text-emerald-400 mb-4">
              {formatTime(timeLeft)}
            </div>
            
            <div className="flex justify-center space-x-4">
              <motion.button
                onClick={toggleTimer}
                disabled={isSavingSession}
                className={`px-6 py-3 rounded-xl flex items-center space-x-2 transition-colors ${
                  isTimerRunning 
                    ? 'bg-red-500 hover:bg-red-600' 
                    : selectedSubject
                    ? 'bg-emerald-500 hover:bg-emerald-600'
                    : 'bg-gray-500 hover:bg-gray-600'
                } ${isSavingSession ? 'opacity-50 cursor-not-allowed' : ''}`}
                whileHover={{ scale: isSavingSession ? 1 : 1.05 }}
                whileTap={{ scale: isSavingSession ? 1 : 0.95 }}
              >
                {isTimerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                <span>{isTimerRunning ? 'Pause' : 'Start'}</span>
              </motion.button>
              
              <motion.button
                onClick={resetTimer}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl flex items-center space-x-2 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <RotateCcw className="w-5 h-5" />
                <span>Reset</span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Subject Help */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-semibold mb-4">What subject are you studying?</h2>
          
          {isSavingSession && (
            <div className="mb-4 p-3 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-400 text-sm">
              💾 Saving study session...
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-3">
            {subjects.map((subject) => (
              <motion.button
                key={subject.name}
                onClick={() => setSelectedSubject(subject.name)}
                disabled={isTimerRunning}
                className={`p-4 rounded-xl border transition-all ${
                  selectedSubject === subject.name
                    ? 'border-blue-400 bg-blue-400/20'
                    : 'border-white/20 hover:border-white/40'
                } ${isTimerRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
                whileHover={{ scale: isTimerRunning ? 1 : 1.02 }}
                whileTap={{ scale: isTimerRunning ? 1 : 0.98 }}
              >
                <div className="text-2xl mb-2">{subject.icon}</div>
                <div className="text-sm text-center">{subject.name}</div>
              </motion.button>
            ))}
          </div>
          
          {selectedSubject && !isTimerRunning && (
            <div className="mt-4 text-center text-sm text-emerald-400">
              ✅ Selected: {selectedSubject}. Ready to start timer!
            </div>
          )}
        </div>

        {/* Quick Study Actions */}
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Target className="w-8 h-8 text-purple-400 mb-3" />
            <h3 className="font-semibold mb-2">Set Goals</h3>
            <p className="text-sm text-white/70">Define your study objectives</p>
          </motion.button>

          <motion.button
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Brain className="w-8 h-8 text-cyan-400 mb-3" />
            <h3 className="font-semibold mb-2">Memory Techniques</h3>
            <p className="text-sm text-white/70">Learn effective study methods</p>
          </motion.button>
        </div>

        {/* Academic Stress Management */}
        <div className="bg-orange-500/10 backdrop-blur-sm rounded-2xl p-6 border border-orange-500/20">
          <h2 className="text-lg font-semibold mb-4 text-orange-400">Feeling Academic Stress?</h2>
          <div className="space-y-3">
            <motion.button
              className="w-full bg-orange-500 hover:bg-orange-600 text-white rounded-xl p-4 flex items-center justify-center space-x-3 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Brain className="w-5 h-5" />
              <span>Get Study Tips</span>
            </motion.button>
            
            <motion.button
              className="w-full bg-white/10 hover:bg-white/20 text-white rounded-xl p-4 flex items-center justify-center space-x-3 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Timer className="w-5 h-5" />
              <span>Break Timer</span>
            </motion.button>
          </div>
        </div>

        {/* Study Resources */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-semibold mb-4">Study Resources</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <p className="font-medium">Tutoring Center</p>
                <p className="text-sm text-white/70">Free peer tutoring</p>
              </div>
              <motion.button
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-sm transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Book
              </motion.button>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <p className="font-medium">Study Groups</p>
                <p className="text-sm text-white/70">Join group sessions</p>
              </div>
              <motion.button
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Join
              </motion.button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
