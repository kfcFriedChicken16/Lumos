'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [showPw, setShowPw] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { signIn, user } = useAuth();
  const router = useRouter();

  // Note: Auto-redirect removed to prevent auto-login behavior
  // Users must manually log in each time

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const result = await signIn(email, password);

      if (result.success) {
        setSuccess('Signed in successfully!');
        
        // Force redirect after a short delay to ensure auth state is updated
        setTimeout(() => {
          router.push('/web/dashboard');
        }, 1000);
        
      } else {
        setError(result.error || 'Sign in failed');
        setIsLoading(false);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 relative overflow-hidden">
      {/* Fun background elements */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-20 left-10 h-32 w-32 rounded-full bg-orange-200/30 blur-2xl animate-pulse" />
        <div className="absolute bottom-20 right-10 h-40 w-40 rounded-full bg-pink-200/30 blur-2xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/3 h-24 w-24 rounded-full bg-yellow-200/30 blur-xl animate-pulse delay-500" />
        <div className="absolute top-1/3 right-1/4 h-20 w-20 rounded-full bg-purple-200/30 blur-xl animate-pulse delay-1500" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-6">
        {/* Left side - Illustration */}
        <div className="hidden lg:flex lg:w-1/2 lg:items-center lg:justify-center">
          <div className="relative max-w-lg">
            <Image
              src="/undraw_having-fun.svg"
              alt="Students having fun while learning"
              width={500}
              height={500}
              className="w-full h-auto"
              priority
            />
            <div className="mt-8 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Learning Should Be Fun!</h2>
              <p className="text-gray-600">Join thousands of students who are already enjoying their educational journey with Lumos.</p>
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full lg:w-1/2 lg:pl-12">
          <div className="mx-auto max-w-md">

            {/* Card */}
            <div className="rounded-3xl border border-orange-200/50 bg-white/80 backdrop-blur-sm p-8 shadow-xl shadow-orange-100/50">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome back! 🎉</h2>
                <p className="text-gray-600">Ready to continue your amazing learning adventure?</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email */}
                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-semibold text-gray-700">
                    Email address
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Mail className="h-5 w-5" />
                    </span>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border-2 border-orange-200 bg-white/50 px-12 py-3.5 text-gray-900 outline-none transition-all focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-semibold text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <Lock className="h-5 w-5" />
                    </span>
                    <input
                      id="password"
                      name="password"
                      type={showPw ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full rounded-xl border-2 border-orange-200 bg-white/50 px-12 py-3.5 text-gray-900 outline-none transition-all focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-500 hover:bg-orange-100 transition-colors"
                      aria-label={showPw ? 'Hide password' : 'Show password'}
                    >
                      {showPw ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <div className="mt-3 text-right">
                    <Link href="/web/forgot" className="text-sm text-orange-600 hover:text-orange-700 font-medium">
                      Forgot password?
                    </Link>
                  </div>
                </div>

                {/* Error/Success Messages */}
                {error && (
                  <div className="text-red-600 text-sm bg-red-50 border-2 border-red-200 rounded-xl p-4">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="text-emerald-600 text-sm bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4">
                    {success}
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 px-6 py-4 font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-orange-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </div>
                  ) : (
                    <>
                      Let's Go! 🚀
                      <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-orange-200" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-white px-4 text-sm text-gray-500 font-medium">or continue with</span>
                  </div>
                </div>

                {/* Socials */}
                <div className="grid grid-cols-2 gap-4">
                  <button type="button" className="rounded-xl border-2 border-orange-200 bg-white/50 py-3.5 text-sm font-semibold text-gray-700 hover:bg-white hover:border-orange-300 transition-all">
                    Google
                  </button>
                  <button type="button" className="rounded-xl border-2 border-orange-200 bg-white/50 py-3.5 text-sm font-semibold text-gray-700 hover:bg-white hover:border-orange-300 transition-all">
                    Apple
                  </button>
                </div>
              </form>

              <p className="mt-8 text-center text-sm text-gray-600">
                Don't have an account?{' '}
                <Link href="/web/signup" className="font-bold text-orange-600 hover:text-orange-700">
                  Join the fun! 🎈
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
