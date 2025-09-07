"use client"

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

// Dynamic video background component with cursor reveal effect
function DynamicBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Ensure video loads and plays
      video.load();
      video.play().catch(error => {
        console.log('Video autoplay failed:', error);
      });
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Original bright video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => console.log('Video error:', e)}
        onLoadStart={() => console.log('Video loading started')}
        onCanPlay={() => console.log('Video can play')}
      >
        <source src="/dynamic_background3.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Darkened video overlay */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ 
          filter: 'brightness(0.1) contrast(1.1)',
          mask: `radial-gradient(circle 300px at ${mousePos.x}px ${mousePos.y}px, transparent 0%, black 70%)`,
          WebkitMask: `radial-gradient(circle 300px at ${mousePos.x}px ${mousePos.y}px, transparent 0%, black 70%)`
        }}
      >
        <source src="/dynamic_background3.mp4" type="video/mp4" />
      </video>
      
      {/* Additional dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/30" />
    </div>
  );
}

// Cursor-following light (pure white)
function CursorLight() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  return (
    <div className="pointer-events-none fixed inset-0 z-10">
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl transition-transform duration-100 ease-out"
        style={{
          left: mousePos.x,
          top: mousePos.y,
          width: 600,
          height: 600,
          background:
            "radial-gradient(circle at center, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.15) 30%, rgba(0,0,0,0) 70%)",
        }}
      />
    </div>
  );
}

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const { signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    try {
      const result = await signUp(email, password)
      if (result.success) {
        // Show success message and ask user to check email
        setError('') // Clear any previous errors
        setSuccess('Success! Please check your email and click the confirmation link, then come back to sign in.')
        // Redirect to login page after 3 seconds
        setTimeout(() => router.push('/m/login'), 3000)
      } else {
        setError(result.error || 'Sign up failed')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic Video Background */}
      <DynamicBackground />
      
      {/* Cursor Light Effect */}
      <CursorLight />
      
      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03] z-[5]"
        style={{
          backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-[5]">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-emerald-400/20 rounded-full animate-pulse"
            style={{
              left: `${8 + i * 10}%`,
              top: `${12 + i * 12}%`,
              animationDelay: `${i * 0.6}s`,
              animationDuration: `${3.5 + i}s`
            }}
          />
        ))}
      </div>

      {/* Main Signup Card */}
      <div className="relative z-20 w-full max-w-md">
        {/* Glowing Border Effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-emerald-400/20 via-cyan-400/20 to-emerald-400/20 blur-xl" />
        
        <div className="relative rounded-3xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-[0_30px_80px_rgba(0,0,0,0.6)]">
          {/* Header with Lumos Branding */}
          <div className="text-center pt-8 pb-6 px-8">
            {/* Lumos Logo/Icon */}
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-emerald-400/90 shadow-[0_0_40px_12px_rgba(0,255,194,0.3)] flex items-center justify-center">
              <div className="text-black font-black text-xl">L</div>
            </div>
            
            <h1 className="text-3xl font-bold text-white mb-2">
              Create Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 to-cyan-300">LUMOS</span> Account
            </h1>
            <p className="text-white/60 text-sm">
              Join the AI journey and start your growth
            </p>
          </div>

          {/* Form */}
          <div className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="relative">
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 bg-white/5 border-white/20 text-white placeholder-white/40 rounded-xl focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20 transition-all"
                  />
                </div>
                
                <div className="relative">
                  <Input
                    type="password"
                    placeholder="Password (min. 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 bg-white/5 border-white/20 text-white placeholder-white/40 rounded-xl focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20 transition-all"
                  />
                </div>
                
                <div className="relative">
                  <Input
                    type="password"
                    placeholder="Confirm password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="h-12 bg-white/5 border-white/20 text-white placeholder-white/40 rounded-xl focus:border-emerald-400/50 focus:ring-2 focus:ring-emerald-400/20 transition-all"
                  />
                </div>
              </div>

              {/* Error/Success Messages */}
              {error && (
                <div className="text-red-400 text-sm text-center bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  {error}
                </div>
              )}

              {success && (
                <div className="text-emerald-400 text-sm text-center bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3">
                  {success}
                </div>
              )}

              {/* Sign Up Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-emerald-400/90 hover:bg-emerald-400 text-black font-semibold rounded-xl shadow-[0_8px_24px_rgba(0,255,194,0.25)] hover:shadow-[0_12px_32px_rgba(0,255,194,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            {/* Sign In Link */}
            <div className="mt-6 text-center">
              <p className="text-white/60 text-sm">
                Already have an account?{' '}
                <Link 
                  href="/m/login" 
                  className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
