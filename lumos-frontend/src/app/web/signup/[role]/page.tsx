// Student Signup Page
'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Mail, Lock, Eye, EyeOff, User, GraduationCap, Calendar, MapPin, BookOpen, ArrowRight, CheckCircle, Heart, Phone, ChevronDown } from 'lucide-react';
import { signUpStudentAndCreateProfile } from '@/lib/student-profile';
import { signUpVolunteerAndCreateProfile } from '@/lib/volunteer-profile';

const EDUCATION_LEVELS = [
  'Primary School (Standard 1-6)',
  'Secondary School (Form 1-3)',
  'Secondary School (Form 4-5)',
  'Pre-University (Form 6)',
  'University/College',
  'Adult Learner'
];

const SUBJECTS_OF_INTEREST = [
  'Mathematics',
  'Science (Physics, Chemistry, Biology)',
  'English Language',
  'Bahasa Malaysia',
  'History',
  'Geography',
  'Economics',
  'Accounting',
  'Computer Science',
  'Literature',
  'Art & Design',
  'Physical Education'
];

const VOLUNTEER_SKILLS = [
  'Mathematics',
  'Science (Physics, Chemistry, Biology)',
  'English Language',
  'Bahasa Malaysia',
  'History',
  'Geography',
  'Economics',
  'Accounting',
  'Computer Science',
  'Literature',
  'Art & Design',
  'Physical Education',
  'Programming',
  'Music',
  'Sports',
  'Languages',
  'Test Preparation',
  'Study Skills',
  'Career Guidance'
];

const COUNTRY_CODES = [
  { code: '+60', country: 'MY', name: 'Malaysia' },
  { code: '+1', country: 'US', name: 'United States' },
  { code: '+44', country: 'GB', name: 'United Kingdom' },
  { code: '+61', country: 'AU', name: 'Australia' },
  { code: '+65', country: 'SG', name: 'Singapore' },
  { code: '+66', country: 'TH', name: 'Thailand' },
  { code: '+62', country: 'ID', name: 'Indonesia' },
  { code: '+84', country: 'VN', name: 'Vietnam' },
  { code: '+63', country: 'PH', name: 'Philippines' },
  { code: '+91', country: 'IN', name: 'India' },
  { code: '+86', country: 'CN', name: 'China' },
  { code: '+81', country: 'JP', name: 'Japan' },
  { code: '+82', country: 'KR', name: 'South Korea' },
  { code: '+971', country: 'AE', name: 'UAE' },
  { code: '+966', country: 'SA', name: 'Saudi Arabia' },
];

export default function RoleSignup() {
  const { role } = useParams<{ role: string }>();
  const router = useRouter();

  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phoneNumber: '',
    educationLevel: '',
    subjects: [] as string[],
    location: '',
    goals: '',
    skills: [] as string[],
    experience: '',
    availability: {}
  });
  
  const [phoneCountryCode, setPhoneCountryCode] = useState('+60');
  const [phoneLocal, setPhoneLocal] = useState('');
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (field: string, value: string | string[]) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubjectToggle = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const handleSkillToggle = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter(s => s !== skill)
        : [...prev.skills, skill]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    if (!formData.educationLevel) {
      setError('Please select your education level');
      setIsLoading(false);
      return;
    }

    try {
      let result;
      
      if (role === 'student') {
        result = await signUpStudentAndCreateProfile({
          email: formData.email,
          password: formData.password,
          fullName: formData.name,
          phone: phoneCountryCode + phoneLocal,
          school: formData.educationLevel,
          subjects: formData.subjects,
          goals: formData.goals
        });
      } else if (role === 'volunteer') {
        result = await signUpVolunteerAndCreateProfile({
          email: formData.email,
          password: formData.password,
          fullName: formData.name,
          phone: phoneCountryCode + phoneLocal,
          skills: formData.skills,
          availability: formData.availability,
          experience: formData.experience
        });
      } else {
        setError('Invalid role selected');
        setIsLoading(false);
        return;
      }

      if (result.needsEmailConfirm) {
        setSuccess('Account created successfully! Please check your email to confirm your account.');
        setIsLoading(false);
        
        // Redirect to login page after signup
        setTimeout(() => {
          router.push('/web/login');
        }, 3000);
      } else {
        setSuccess('Account created successfully! Redirecting to dashboard...');
        setIsLoading(false);
        
        // Profile was created immediately, redirect to dashboard
        setTimeout(() => {
          router.push('/web/dashboard');
        }, 2000);
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
      setIsLoading(false);
    }
  };

  // Phone Number Field Component
  const PhoneNumberField = () => (
    <div>
      <label htmlFor="phoneNumber" className="mb-2 block text-sm font-semibold text-gray-700">
        Phone Number
      </label>
      <div className="flex gap-2">
        <select
          name="countryCode"
          value={phoneCountryCode}
          onChange={(e) => setPhoneCountryCode(e.target.value)}
          className="h-12 rounded-xl border-2 border-orange-200 bg-white/50 px-3 text-sm focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100 outline-none"
        >
          <option value="+60">🇲🇾 +60 (MY)</option>
          <option value="+65">🇸🇬 +65 (SG)</option>
        </select>

        <input
          name="localPhone"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="123 456 789"
          value={phoneLocal}
          onChange={(e) => setPhoneLocal(e.target.value.replace(/\D/g, ''))}
          className="h-12 flex-1 rounded-xl border-2 border-orange-200 bg-white/50 px-4 text-base focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100 outline-none"
        />
      </div>
      <p className="text-xs text-gray-500 mt-1">We'll use this to notify you about important updates and support requests.</p>
    </div>
  );

  // Show different content based on role
  if (role === 'student') {
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
          {/* Left side - Student Signup Form */}
          <div className="w-full lg:w-1/2 lg:pr-12">
            <div className="mx-auto max-w-md">
              {/* Back Button */}
              <Link 
                href="/web/signup"
                className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to role selection
              </Link>

              {/* Card */}
              <div className="rounded-3xl border border-orange-200/50 bg-white/80 backdrop-blur-sm p-8 shadow-xl shadow-orange-100/50">
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl text-white shadow-lg">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">Student Signup! 🎓</h2>
                      <p className="text-gray-600">Let's get you started on your learning adventure</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="mb-2 block text-sm font-semibold text-gray-700">
                      Full Name
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <User className="h-5 w-5" />
                      </span>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full rounded-xl border-2 border-orange-200 bg-white/50 px-12 py-3.5 text-gray-900 outline-none transition-all focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>

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
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full rounded-xl border-2 border-orange-200 bg-white/50 px-12 py-3.5 text-gray-900 outline-none transition-all focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <PhoneNumberField />

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
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="w-full rounded-xl border-2 border-orange-200 bg-white/50 px-12 py-3.5 text-gray-900 outline-none transition-all focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-500 hover:bg-orange-100 transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-gray-700">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <Lock className="h-5 w-5" />
                      </span>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className="w-full rounded-xl border-2 border-orange-200 bg-white/50 px-12 py-3.5 text-gray-900 outline-none transition-all focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-500 hover:bg-orange-100 transition-colors"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Education Level */}
                  <div>
                    <label htmlFor="educationLevel" className="mb-2 block text-sm font-semibold text-gray-700">
                      Education Level
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <GraduationCap className="h-5 w-5" />
                      </span>
                      <select
                        id="educationLevel"
                        name="educationLevel"
                        required
                        value={formData.educationLevel}
                        onChange={(e) => handleInputChange('educationLevel', e.target.value)}
                        className="w-full rounded-xl border-2 border-orange-200 bg-white/50 px-12 py-3.5 text-gray-900 outline-none transition-all focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                      >
                        <option value="">Select your education level</option>
                        {EDUCATION_LEVELS.map((level) => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label htmlFor="location" className="mb-2 block text-sm font-semibold text-gray-700">
                      Location (Optional)
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <MapPin className="h-5 w-5" />
                      </span>
                      <input
                        id="location"
                        name="location"
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="w-full rounded-xl border-2 border-orange-200 bg-white/50 px-12 py-3.5 text-gray-900 outline-none transition-all focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                        placeholder="e.g., Kuala Lumpur, Malaysia"
                      />
                    </div>
                  </div>

                  {/* Error/Success Messages */}
                  {error && (
                    <div className="text-red-600 text-sm bg-red-50 border-2 border-red-200 rounded-xl p-4">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="text-emerald-600 text-sm bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      {success}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4 font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-emerald-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Creating your account...
                      </div>
                    ) : (
                      <>
                        Start Learning! 🚀
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/web/login" className="font-bold text-orange-600 hover:text-orange-700">
                    Sign in here! ✨
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Illustration */}
          <div className="hidden lg:flex lg:w-1/2 lg:items-center lg:justify-center">
            <div className="relative max-w-lg">
              <Image
                src="/undraw_sign-in.svg"
                alt="Sign in illustration"
                width={500}
                height={500}
                className="w-full h-auto"
                priority
              />
              <div className="mt-8 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Join Our Community!</h2>
                <p className="text-gray-600">Start your educational journey with thousands of students who trust Lumos.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (role === 'volunteer') {
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
          {/* Left side - Volunteer Signup Form */}
          <div className="w-full lg:w-1/2 lg:pr-12">
            <div className="mx-auto max-w-md">
              {/* Back Button */}
              <Link 
                href="/web/signup"
                className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium mb-6 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to role selection
              </Link>

              {/* Card */}
              <div className="rounded-3xl border border-orange-200/50 bg-white/80 backdrop-blur-sm p-8 shadow-xl shadow-orange-100/50">
                <div className="mb-8">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl text-white shadow-lg">
                      <Heart className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">Volunteer Signup! ❤️</h2>
                      <p className="text-gray-600">Join us in making education accessible to everyone</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="mb-2 block text-sm font-semibold text-gray-700">
                      Full Name
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <User className="h-5 w-5" />
                      </span>
                      <input
                        id="name"
                        name="name"
                        type="text"
                        autoComplete="name"
                        required
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full rounded-xl border-2 border-orange-200 bg-white/50 px-12 py-3.5 text-gray-900 outline-none transition-all focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                        placeholder="Your full name"
                      />
                    </div>
                  </div>

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
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full rounded-xl border-2 border-orange-200 bg-white/50 px-12 py-3.5 text-gray-900 outline-none transition-all focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  {/* Phone Number */}
                  <PhoneNumberField />

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
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        className="w-full rounded-xl border-2 border-orange-200 bg-white/50 px-12 py-3.5 text-gray-900 outline-none transition-all focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-500 hover:bg-orange-100 transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="mb-2 block text-sm font-semibold text-gray-700">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <Lock className="h-5 w-5" />
                      </span>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        className="w-full rounded-xl border-2 border-orange-200 bg-white/50 px-12 py-3.5 text-gray-900 outline-none transition-all focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-gray-500 hover:bg-orange-100 transition-colors"
                        aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Education Level */}
                  <div>
                    <label htmlFor="educationLevel" className="mb-2 block text-sm font-semibold text-gray-700">
                      Education Level
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <GraduationCap className="h-5 w-5" />
                      </span>
                      <select
                        id="educationLevel"
                        name="educationLevel"
                        required
                        value={formData.educationLevel}
                        onChange={(e) => handleInputChange('educationLevel', e.target.value)}
                        className="w-full rounded-xl border-2 border-orange-200 bg-white/50 px-12 py-3.5 text-gray-900 outline-none transition-all focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                      >
                        <option value="">Select your education level</option>
                        {EDUCATION_LEVELS.map((level) => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label htmlFor="location" className="mb-2 block text-sm font-semibold text-gray-700">
                      Location (Optional)
                    </label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <MapPin className="h-5 w-5" />
                      </span>
                      <input
                        id="location"
                        name="location"
                        type="text"
                        value={formData.location}
                        onChange={(e) => handleInputChange('location', e.target.value)}
                        className="w-full rounded-xl border-2 border-orange-200 bg-white/50 px-12 py-3.5 text-gray-900 outline-none transition-all focus:border-orange-400 focus:bg-white focus:ring-4 focus:ring-orange-100"
                        placeholder="e.g., Kuala Lumpur, Malaysia"
                      />
                    </div>
                  </div>

                  {/* Error/Success Messages */}
                  {error && (
                    <div className="text-red-600 text-sm bg-red-50 border-2 border-red-200 rounded-xl p-4">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="text-emerald-600 text-sm bg-emerald-50 border-2 border-emerald-200 rounded-xl p-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      {success}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="group inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-6 py-4 font-bold text-white shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-indigo-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-3">
                        <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        Creating your account...
                      </div>
                    ) : (
                      <>
                        Start Volunteering! ❤️
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </form>

                <p className="mt-8 text-center text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link href="/web/login" className="font-bold text-orange-600 hover:text-orange-700">
                    Sign in here! ✨
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Right side - Illustration */}
          <div className="hidden lg:flex lg:w-1/2 lg:items-center lg:justify-center">
            <div className="relative max-w-lg">
              <Image
                src="/undraw_sign-in.svg"
                alt="Sign in illustration"
                width={500}
                height={500}
                className="w-full h-auto"
                priority
              />
              <div className="mt-8 text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Make a Difference!</h2>
                <p className="text-gray-600">Join our community of volunteers helping students succeed.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // For other roles, show placeholder
  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-6">
        <div className="rounded-3xl border border-orange-200/50 bg-white/80 backdrop-blur-sm p-8 shadow-xl shadow-orange-100/50">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Sign up as {role}
          </h1>
          <p className="text-gray-600 mb-6">
            This is a placeholder page for {role} signup. 
            The actual form will be implemented later.
          </p>
          <Link 
            href="/web/signup" 
            className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to role selection
          </Link>
        </div>
      </div>
    </main>
  );
}
