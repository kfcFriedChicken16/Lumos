// Role Selection Page
'use client';

import Link from 'next/link';
import { GraduationCap, Heart, Apple } from 'lucide-react';

const ROLES = [
  { 
    key: 'student', 
    title: 'Student', 
    icon: GraduationCap, 
    color: 'from-emerald-500 to-teal-500',
    description: 'Get personalized tutoring and academic support'
  },
  { 
    key: 'volunteer', 
    title: 'Volunteer', 
    icon: Heart, 
    color: 'from-indigo-500 to-purple-500',
    description: 'Share your knowledge and help students succeed'
  },
  { 
    key: 'teacher', 
    title: 'Teacher', 
    icon: Apple, 
    color: 'from-gray-400 to-gray-500',
    description: 'Coming soon - Under Development'
  },
] as const;

export default function ChooseRole() {
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
        <div className="w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="mb-6 flex items-center justify-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-bold text-lg">
                L
              </div>
              <div>
                <p className="text-xs uppercase tracking-widest text-gray-500">AI Tutoring Platform</p>
                <h1 className="text-2xl font-semibold text-gray-900">Lumos</h1>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Welcome to Lumos! ✨
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join our community and start your educational journey today
            </p>
          </div>

          {/* Role Selection */}
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                I want to sign up as a...
              </h2>
              <p className="text-gray-600">
                Choose your role to get started with the right experience
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-3 mb-12">
              {ROLES.map(({ key, title, icon: Icon, color, description }) => {
                const isDisabled = key === 'teacher';
                return (
                  <div
                    key={key}
                    className={`group rounded-3xl border-2 ${
                      isDisabled 
                        ? 'border-gray-300 bg-gray-100/80 cursor-not-allowed opacity-60' 
                        : 'border-orange-200/50 bg-white/80 hover:shadow-2xl hover:scale-[1.02]'
                    } backdrop-blur-sm p-8 shadow-xl shadow-orange-100/50 transition-all focus:outline-none focus:ring-4 focus:ring-orange-200`}
                  >
                    {!isDisabled ? (
                      <Link href={`/web/signup/${key}`} className="block">
                        <div className={`mb-6 grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg`}>
                          <Icon className="h-10 w-10" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-3">{title}</div>
                        <div className="text-gray-600 mb-4">{description}</div>
                        <div className="text-sm font-semibold text-orange-600 group-hover:text-orange-700 transition-colors">
                          Continue as {title.toLowerCase()} →
                        </div>
                      </Link>
                    ) : (
                      <>
                        <div className={`mb-6 grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br ${color} text-white shadow-lg`}>
                          <Icon className="h-10 w-10" />
                        </div>
                        <div className="text-2xl font-bold text-gray-900 mb-3">{title}</div>
                        <div className="text-gray-600 mb-4">{description}</div>
                        <div className="text-sm font-semibold text-gray-500">
                          Under Development
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <Link href="/web/login" className="font-bold text-orange-600 hover:text-orange-700 transition-colors">
                  Sign in here! ✨
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
