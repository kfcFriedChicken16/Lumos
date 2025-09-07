"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Activity, Brain, Phone, MessageCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { apiClient } from '@/lib/api';

export default function CarePage() {
  const { user } = useAuth();
  const [currentMood, setCurrentMood] = React.useState<string | null>(null);
  const [isBreathing, setIsBreathing] = React.useState(false);
  const [isSavingMood, setIsSavingMood] = React.useState(false);
  const [moodSaved, setMoodSaved] = React.useState(false);

  const moods = [
    { emoji: '😊', label: 'Happy', color: 'bg-green-500' },
    { emoji: '😐', label: 'Neutral', color: 'bg-yellow-500' },
    { emoji: '😔', label: 'Sad', color: 'bg-blue-500' },
    { emoji: '😰', label: 'Anxious', color: 'bg-orange-500' },
    { emoji: '😡', label: 'Angry', color: 'bg-red-500' },
  ];

  const handleMoodSelection = async (mood: string) => {
    setCurrentMood(mood);
    
    if (user) {
      setIsSavingMood(true);
      try {
        const result = await apiClient.saveMoodEntry(user.id, mood);
        if (result.success) {
          setMoodSaved(true);
          setTimeout(() => setMoodSaved(false), 3000); // Hide success message after 3 seconds
        } else {
          console.error('Failed to save mood:', result.error);
        }
      } catch (error) {
        console.error('Error saving mood:', error);
      } finally {
        setIsSavingMood(false);
      }
    }
  };

  const startBreathing = () => {
    setIsBreathing(true);
    // TODO: Implement breathing animation
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
            <Heart className="w-6 h-6 text-pink-400" />
            <h1 className="text-xl font-bold">Mental Health Care</h1>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-6">
        {/* Mood Check-in */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-semibold mb-4">How are you feeling today?</h2>
          
          {moodSaved && (
            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg text-green-400 text-sm">
              ✅ Mood saved! I'll remember how you're feeling today.
            </div>
          )}
          
          <div className="grid grid-cols-5 gap-3">
            {moods.map((mood) => (
              <motion.button
                key={mood.label}
                onClick={() => handleMoodSelection(mood.label)}
                disabled={isSavingMood}
                className={`p-4 rounded-xl border transition-all ${
                  currentMood === mood.label
                    ? 'border-pink-400 bg-pink-400/20'
                    : 'border-white/20 hover:border-white/40'
                } ${isSavingMood ? 'opacity-50 cursor-not-allowed' : ''}`}
                whileHover={{ scale: isSavingMood ? 1 : 1.05 }}
                whileTap={{ scale: isSavingMood ? 1 : 0.95 }}
              >
                <div className="text-2xl mb-2">{mood.emoji}</div>
                <div className="text-xs text-center">{mood.label}</div>
              </motion.button>
            ))}
          </div>
          
          {isSavingMood && (
            <div className="mt-3 text-center text-sm text-gray-400">
              Saving your mood...
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4">
          <motion.button
            onClick={startBreathing}
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Activity className="w-8 h-8 text-emerald-400 mb-3" />
            <h3 className="font-semibold mb-2">Breathing Exercise</h3>
            <p className="text-sm text-white/70">Calm your mind with guided breathing</p>
          </motion.button>

          <motion.button
            className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 hover:bg-white/10 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Brain className="w-8 h-8 text-blue-400 mb-3" />
            <h3 className="font-semibold mb-2">Mindfulness</h3>
            <p className="text-sm text-white/70">Practice present moment awareness</p>
          </motion.button>
        </div>

        {/* Crisis Support */}
        <div className="bg-red-500/10 backdrop-blur-sm rounded-2xl p-6 border border-red-500/20">
          <h2 className="text-lg font-semibold mb-4 text-red-400">Need Immediate Support?</h2>
          <div className="space-y-3">
            <motion.button
              className="w-full bg-red-500 hover:bg-red-600 text-white rounded-xl p-4 flex items-center justify-center space-x-3 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Phone className="w-5 h-5" />
              <span>Call Crisis Hotline</span>
            </motion.button>
            
            <motion.button
              className="w-full bg-white/10 hover:bg-white/20 text-white rounded-xl p-4 flex items-center justify-center space-x-3 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <MessageCircle className="w-5 h-5" />
              <span>Chat with Lumos</span>
            </motion.button>
          </div>
        </div>

        {/* Resources */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-semibold mb-4">Mental Health Resources</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div>
                <p className="font-medium">Campus Counseling</p>
                <p className="text-sm text-white/70">Free sessions available</p>
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
                <p className="font-medium">Support Groups</p>
                <p className="text-sm text-white/70">Connect with peers</p>
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
