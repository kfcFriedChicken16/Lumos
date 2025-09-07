'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, User, Mail, Calendar, MapPin, Heart, Save, CheckCircle } from 'lucide-react';

// Dynamic video background component
function DynamicBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.load();
      video.play().catch(error => {
        console.log('Video autoplay failed:', error);
      });
    }
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ filter: 'brightness(0.5) contrast(1.1)' }}
      >
        <source src="/dynamic_background1.mp4" type="video/mp4" />
      </video>
      
      <div className="absolute inset-0 bg-black/20" />
    </div>
  );
}

export default function SettingsPage() {
  const { user, profile, updateProfile } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    location: '',
    interests: '',
    goals: '',
    mbti: '',
    bio: ''
  });

  // Load current profile data when component mounts
  useEffect(() => {
    if (profile) {
      setFormData({
        name: (profile as any).name || '',
        age: (profile as any).age?.toString() || '',
        location: (profile as any).location || '',
        interests: (profile as any).interests || '',
        goals: (profile as any).goals || '',
        mbti: (profile as any).mbti || '',
        bio: (profile as any).bio || ''
      });
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const profileData: any = {
        name: formData.name,
        age: formData.age ? parseInt(formData.age) : null,
        location: formData.location,
        interests: formData.interests,
        goals: formData.goals,
        mbti: formData.mbti,
        bio: formData.bio
      };
      
      await updateProfile(profileData);
      setIsSaved(true);
      
      // Show success message for 2 seconds
      setTimeout(() => {
        setIsSaved(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile. Please try again.');
    }
    
    setIsLoading(false);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen text-white relative overflow-hidden">
        {/* Dynamic Background */}
        <DynamicBackground />
        {/* Header */}
        <header className="relative z-20 bg-black/20 backdrop-blur-xl border-b border-white/10">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/app/chat')}
                  className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
                >
                  <ArrowLeft size={20} />
                  Back to Chat
                </button>
                <div className="h-6 w-px bg-white/20" />
                <h1 className="text-xl font-semibold text-white flex items-center gap-2">
                  ⚙️ Settings
                </h1>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Profile Card */}
            <div className="lg:col-span-1">
              <div className="rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] p-6 sticky top-8">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-400/90 shadow-[0_0_40px_12px_rgba(0,255,194,0.3)] mb-4">
                    <div className="text-black font-black text-2xl">
                      {formData.name ? formData.name.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                  </div>
                  <h2 className="text-xl font-semibold text-white mb-1">
                    {formData.name || 'Your Name'}
                  </h2>
                  <p className="text-white/60 text-sm mb-4">{user?.email}</p>
                  
                  {/* Quick Info */}
                  <div className="space-y-2 text-sm">
                    {formData.mbti && (
                      <div className="flex items-center justify-center gap-2">
                        <Heart className="h-4 w-4 text-pink-400" />
                        <span className="text-pink-300">{formData.mbti}</span>
                      </div>
                    )}
                    {formData.location && (
                      <div className="flex items-center justify-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-400" />
                        <span className="text-blue-300">{formData.location}</span>
                      </div>
                    )}
                    {formData.age && (
                      <div className="flex items-center justify-center gap-2">
                        <Calendar className="h-4 w-4 text-green-400" />
                        <span className="text-green-300">{formData.age} years old</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Settings Form */}
            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-white/10 bg-black/30 backdrop-blur-xl shadow-[0_0_30px_rgba(0,0,0,0.5)] p-6">
                <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <User className="h-5 w-5 text-emerald-400" />
                  Profile Settings
                </h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-white/90 mb-2 font-medium">Full Name</label>
                      <Input
                        placeholder="Enter your name"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-emerald-400/50 focus:ring-emerald-400/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/90 mb-2 font-medium">Age</label>
                      <Input
                        type="number"
                        placeholder="25"
                        value={formData.age}
                        onChange={(e) => setFormData(prev => ({ ...prev, age: e.target.value }))}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-emerald-400/50 focus:ring-emerald-400/20"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-white/90 mb-2 font-medium">Location</label>
                      <Input
                        placeholder="City, Country"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-emerald-400/50 focus:ring-emerald-400/20"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-white/90 mb-2 font-medium">MBTI Type</label>
                      <Input
                        placeholder="e.g., INFP"
                        value={formData.mbti}
                        onChange={(e) => setFormData(prev => ({ ...prev, mbti: e.target.value.toUpperCase() }))}
                        maxLength={4}
                        className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-emerald-400/50 focus:ring-emerald-400/20"
                      />
                    </div>
                  </div>

                  {/* Bio */}
                  <div>
                    <label className="block text-sm text-white/90 mb-2 font-medium">Bio</label>
                    <Textarea
                      placeholder="Tell us about yourself..."
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      rows={3}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-emerald-400/50 focus:ring-emerald-400/20 resize-none"
                    />
                  </div>

                  {/* Interests */}
                  <div>
                    <label className="block text-sm text-white/90 mb-2 font-medium">Interests</label>
                    <Textarea
                      placeholder="What are you passionate about? (e.g., music, technology, sports)"
                      value={formData.interests}
                      onChange={(e) => setFormData(prev => ({ ...prev, interests: e.target.value }))}
                      rows={2}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-emerald-400/50 focus:ring-emerald-400/20 resize-none"
                    />
                  </div>

                  {/* Goals */}
                  <div>
                    <label className="block text-sm text-white/90 mb-2 font-medium">Goals</label>
                    <Textarea
                      placeholder="What are you working towards?"
                      value={formData.goals}
                      onChange={(e) => setFormData(prev => ({ ...prev, goals: e.target.value }))}
                      rows={2}
                      className="bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:border-emerald-400/50 focus:ring-emerald-400/20 resize-none"
                    />
                  </div>

                  {/* Save Button */}
                  <div className="flex items-center gap-4 pt-4">
                    <Button 
                      type="submit" 
                      disabled={isLoading}
                      className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-[0_0_20px_rgba(0,255,194,0.3)] border-emerald-500/50 px-8"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin h-4 w-4 border-2 border-white/30 border-t-white rounded-full" />
                          Saving...
                        </>
                      ) : isSaved ? (
                        <>
                          <CheckCircle className="h-4 w-4" />
                          Saved!
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          Save Changes
                        </>
                      )}
                    </Button>
                    
                    {isSaved && (
                      <span className="text-green-400 text-sm flex items-center gap-1">
                        <CheckCircle className="h-4 w-4" />
                        Profile updated successfully!
                      </span>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
