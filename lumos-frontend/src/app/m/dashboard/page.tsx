"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Calculator, 
  BookOpen, 
  GraduationCap, 
  TestTube, 
  FileText, 
  Lightbulb,
  ChevronDown,
  Users,
  Clock,
  Star
} from 'lucide-react';

interface ServiceCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  subjects: string[];
  available: boolean;
}

export default function MobileDashboardPage() {
  const { user, profile } = useAuth();
  const [selectedSubjects, setSelectedSubjects] = useState<Record<string, string>>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const services: ServiceCard[] = [
    {
      id: 'math',
      title: 'Mathematics',
      description: 'Algebra, calculus, statistics, and more.',
      icon: <Calculator className="w-5 h-5" />,
      color: 'bg-pink-500',
      subjects: ['Algebra', 'Calculus', 'Statistics', 'Geometry', 'Trigonometry'],
      available: true
    },
    {
      id: 'science',
      title: 'Sciences',
      description: 'Physics, chemistry, biology, and other sciences.',
      icon: <TestTube className="w-5 h-5" />,
      color: 'bg-purple-500',
      subjects: ['Physics', 'Chemistry', 'Biology', 'General Science'],
      available: true
    },
    {
      id: 'languages',
      title: 'Languages',
      description: 'English, Malay, and other language skills.',
      icon: <BookOpen className="w-5 h-5" />,
      color: 'bg-blue-500',
      subjects: ['English', 'Bahasa Malaysia', 'Mandarin', 'Essay Writing'],
      available: true
    },
    {
      id: 'exams',
      title: 'Standardized Tests',
      description: 'SPM, STPM, MUET, and university exams.',
      icon: <GraduationCap className="w-5 h-5" />,
      color: 'bg-yellow-500',
      subjects: ['SPM', 'STPM', 'MUET', 'University Entrance'],
      available: true
    },
    {
      id: 'study-skills',
      title: 'Study Skills',
      description: 'Study techniques and time management.',
      icon: <Lightbulb className="w-5 h-5" />,
      color: 'bg-green-500',
      subjects: ['Time Management', 'Note Taking', 'Research Methods', 'Memory Techniques'],
      available: true
    },
    {
      id: 'essay-writing',
      title: 'Essay Writing',
      description: 'Academic writing and research papers.',
      icon: <FileText className="w-5 h-5" />,
      color: 'bg-indigo-500',
      subjects: ['Academic Writing', 'Research Papers', 'Creative Writing', 'Citations'],
      available: true
    }
  ];

  const handleSubjectSelect = (serviceId: string, subject: string) => {
    setSelectedSubjects(prev => ({
      ...prev,
      [serviceId]: subject
    }));
    setOpenDropdown(null);
  };

  const handleStartChat = (serviceId: string) => {
    const subject = selectedSubjects[serviceId] || services.find(s => s.id === serviceId)?.subjects[0];
    // Navigate to session with selected subject
    window.location.href = `/m/session?subject=${subject}&service=${serviceId}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-500 to-cyan-500 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Welcome back, {profile?.name || user?.email?.split('@')[0] || 'Student'}!</h1>
            <p className="text-emerald-100 text-sm">Ready to continue your learning journey?</p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs">Available now</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-4">
        {/* Stats Section */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-white rounded-lg p-3 shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div className="ml-2">
                <p className="text-xs text-gray-600">Study Time</p>
                <p className="text-sm font-semibold">2.5 hours</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <Users className="w-4 h-4 text-green-600" />
              </div>
              <div className="ml-2">
                <p className="text-xs text-gray-600">Sessions</p>
                <p className="text-sm font-semibold">12</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="w-4 h-4 text-yellow-600" />
              </div>
              <div className="ml-2">
                <p className="text-xs text-gray-600">Credits</p>
                <p className="text-sm font-semibold">45</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-3 shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <BookOpen className="w-4 h-4 text-purple-600" />
              </div>
              <div className="ml-2">
                <p className="text-xs text-gray-600">Subjects</p>
                <p className="text-sm font-semibold">6</p>
              </div>
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="space-y-4">
          {services.map((service) => (
            <div key={service.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              {/* Service Header */}
              <div className="flex items-center mb-3">
                <div className={`${service.color} p-2 rounded-full text-white mr-3`}>
                  {service.icon}
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900">{service.title}</h3>
                  <p className="text-xs text-gray-600">{service.description}</p>
                </div>
              </div>

              {/* Subject Dropdown */}
              <div className="mb-3">
                <div className="relative">
                  <button
                    onClick={() => setOpenDropdown(openDropdown === service.id ? null : service.id)}
                    className="w-full flex items-center justify-between p-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 transition-colors text-sm"
                  >
                    <span className="text-gray-700">
                      {selectedSubjects[service.id] || 'Choose a subject'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${openDropdown === service.id ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {openDropdown === service.id && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                      {service.subjects.map((subject) => (
                        <button
                          key={subject}
                          onClick={() => handleSubjectSelect(service.id, subject)}
                          className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                        >
                          {subject}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Start Button */}
              <button
                onClick={() => handleStartChat(service.id)}
                disabled={!service.available}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors text-sm ${
                  service.available
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-white'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {service.available ? 'Start a chat →' : 'Coming Soon'}
              </button>

              {/* Availability Status */}
              <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                <span className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-1 ${service.available ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  {service.available ? 'Available now' : 'Unavailable'}
                </span>
                <span>5-15 min response</span>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-3">Quick Actions</h3>
          <div className="space-y-3">
            <button className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors w-full">
              <div className="p-2 bg-blue-100 rounded-lg mr-3">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900 text-sm">Continue Last Session</p>
                <p className="text-xs text-gray-600">Resume Math tutoring</p>
              </div>
            </button>
            
            <button className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors w-full">
              <div className="p-2 bg-green-100 rounded-lg mr-3">
                <Star className="w-4 h-4 text-green-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900 text-sm">Earn Credits</p>
                <p className="text-xs text-gray-600">Help other students</p>
              </div>
            </button>
            
            <button className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors w-full">
              <div className="p-2 bg-purple-100 rounded-lg mr-3">
                <BookOpen className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-left">
                <p className="font-medium text-gray-900 text-sm">Study History</p>
                <p className="text-xs text-gray-600">View past sessions</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
