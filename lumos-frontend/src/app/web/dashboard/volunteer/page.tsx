'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTimebank } from '@/contexts/TimebankContext';
import VolunteerSidebar from '@/components/VolunteerSidebar';
import { 
  Heart,
  Users, 
  Clock, 
  Star, 
  Bell,
  Calendar,
  BookOpen,
  Award,
  TrendingUp,
  UserCheck,
  MessageSquare,
  Target,
  CheckCircle,
  AlertCircle,
  Plus,
  Settings,
  BarChart3,
  Gift,
  ArrowLeft,
  Coins
} from 'lucide-react';

interface HelpRequest {
  id: string;
  studentName: string;
  subject: string;
  topic: string;
  urgency: 'low' | 'medium' | 'high';
  estimatedTime: number; // minutes
  timeRequested: string;
  studentLevel: string;
  description: string;
}

interface VolunteerStats {
  studentsHelped: number;
  hoursVolunteered: number;
  averageRating: number;
  subjectsExpertise: string[];
  totalSessions: number;
  thisWeekHours: number;
}

export default function VolunteerDashboard() {
  const { creditBalance, sessionHistory, tutorSkills } = useTimebank();
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'schedule' | 'impact'>('overview');
  const [availability, setAvailability] = useState({
    monday: { available: true, hours: '9:00-17:00' },
    tuesday: { available: true, hours: '9:00-17:00' },
    wednesday: { available: false, hours: '' },
    thursday: { available: true, hours: '9:00-17:00' },
    friday: { available: true, hours: '9:00-17:00' },
    saturday: { available: true, hours: '10:00-15:00' },
    sunday: { available: false, hours: '' }
  });

  // Mock data for volunteer dashboard
  const volunteerStats: VolunteerStats = {
    studentsHelped: 47,
    hoursVolunteered: 89,
    averageRating: 4.8,
    subjectsExpertise: tutorSkills || ['Mathematics', 'Physics'],
    totalSessions: sessionHistory?.length || 12,
    thisWeekHours: 8.5
  };

  const helpRequests: HelpRequest[] = [
    {
      id: '1',
      studentName: 'Sarah M.',
      subject: 'Mathematics',
      topic: 'Calculus Integration',
      urgency: 'high',
      estimatedTime: 45,
      timeRequested: '2 hours ago',
      studentLevel: 'University Year 2',
      description: 'Struggling with integration by parts and substitution methods. Have exam tomorrow!'
    },
    {
      id: '2',
      studentName: 'Ahmad R.',
      subject: 'Physics',
      topic: 'Quantum Mechanics',
      urgency: 'medium',
      estimatedTime: 60,
      timeRequested: '4 hours ago',
      studentLevel: 'University Year 3',
      description: 'Need help understanding wave functions and probability amplitudes'
    },
    {
      id: '3',
      studentName: 'Priya P.',
      subject: 'Chemistry',
      topic: 'Organic Reactions',
      urgency: 'low',
      estimatedTime: 30,
      timeRequested: '1 day ago',
      studentLevel: 'University Year 1',
      description: 'Basic organic chemistry reactions and naming conventions'
    }
  ];

  const recentActivity = [
    {
      id: '1',
      type: 'session_completed',
      student: 'Emma Chen',
      subject: 'Mathematics',
      duration: 45,
      rating: 5,
      date: '2 hours ago'
    },
    {
      id: '2',
      type: 'request_accepted',
      student: 'Jake Smith',
      subject: 'Physics',
      date: '5 hours ago'
    },
    {
      id: '3',
      type: 'achievement_earned',
      achievement: '50 Students Helped',
      date: '1 day ago'
    }
  ];

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleAcceptRequest = (requestId: string) => {
    // Mock function - would integrate with timebank context
    console.log('Accepting help request:', requestId);
  };

  const handleDeclineRequest = (requestId: string) => {
    // Mock function - would integrate with timebank context
    console.log('Declining help request:', requestId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Volunteer Sidebar */}
      <VolunteerSidebar />

      {/* Main Content with left margin for sidebar */}
      <main className="ml-64">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-purple-200/50">
          <div className="max-w-7xl mx-auto px-6 py-6">
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
              <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl text-white shadow-lg">
                <Heart className="w-8 h-8" />
              </div>
              Volunteer Dashboard
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Help fellow students succeed while making a positive impact in your community!
            </p>
          </div>

          {/* Impact Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white mx-auto mb-3">
                <Users className="w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-purple-900 mb-1">{volunteerStats.studentsHelped}</div>
              <div className="text-sm text-purple-700">Students Helped</div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white mx-auto mb-3">
                <Clock className="w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-blue-900 mb-1">{volunteerStats.hoursVolunteered}</div>
              <div className="text-sm text-blue-700">Hours Volunteered</div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-xl flex items-center justify-center text-white mx-auto mb-3">
                <Star className="w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-yellow-900 mb-1">{volunteerStats.averageRating}</div>
              <div className="text-sm text-yellow-700">Avg Rating</div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center text-white mx-auto mb-3">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div className="text-3xl font-bold text-green-900 mb-1">{volunteerStats.thisWeekHours}</div>
              <div className="text-sm text-green-700">Hours This Week</div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex justify-center">
            <div className="flex bg-white/70 backdrop-blur-sm rounded-2xl p-2 border border-orange-200">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'requests', label: 'Help Requests', icon: Bell },
                { id: 'schedule', label: 'Schedule', icon: Calendar },
                { id: 'impact', label: 'Impact', icon: Award }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <button 
                onClick={() => setActiveTab('requests')}
                className="group bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 rounded-3xl p-6 hover:shadow-xl transition-all hover:scale-[1.02] text-left"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-gradient-to-br from-red-500 to-orange-500 rounded-2xl text-white relative">
                    <Bell className="w-6 h-6" />
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-600 rounded-full flex items-center justify-center text-xs text-white font-bold">
                      {helpRequests.length}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                      Pending Requests
                    </h3>
                    <p className="text-sm text-gray-600">Students need help</p>
                  </div>
                </div>
                <div className="text-xs text-red-700 font-medium">
                  📢 {helpRequests.filter(r => r.urgency === 'high').length} urgent requests
                </div>
              </button>

              <button 
                onClick={() => setActiveTab('schedule')}
                className="group bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-3xl p-6 hover:shadow-xl transition-all hover:scale-[1.02] text-left"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl text-white">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      Manage Schedule
                    </h3>
                    <p className="text-sm text-gray-600">Set availability</p>
                  </div>
                </div>
                <div className="text-xs text-blue-700 font-medium">
                  🗓️ Available 5 days this week
                </div>
              </button>

              <button 
                onClick={() => setActiveTab('impact')}
                className="group bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-3xl p-6 hover:shadow-xl transition-all hover:scale-[1.02] text-left"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl text-white">
                    <Award className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                      View Impact
                    </h3>
                    <p className="text-sm text-gray-600">Your achievements</p>
                  </div>
                </div>
                <div className="text-xs text-green-700 font-medium">
                  🏆 3 new badges earned
                </div>
              </button>

              <Link 
                href="/web/timebank"
                className="group bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-3xl p-6 hover:shadow-xl transition-all hover:scale-[1.02] text-left"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl text-white">
                    <Coins className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                      Peer Timebank
                    </h3>
                    <p className="text-sm text-gray-600">Help students & earn credits</p>
                  </div>
                </div>
                <div className="text-xs text-purple-700 font-medium">
                  💰 {creditBalance} credits available
                </div>
              </Link>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-orange-200/50 p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <MessageSquare className="w-6 h-6 text-purple-500" />
                Recent Activity
              </h2>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50 to-purple-50/50 rounded-xl">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white">
                      {activity.type === 'session_completed' && <CheckCircle className="w-5 h-5" />}
                      {activity.type === 'request_accepted' && <UserCheck className="w-5 h-5" />}
                      {activity.type === 'achievement_earned' && <Award className="w-5 h-5" />}
                    </div>
                    <div className="flex-1">
                      {activity.type === 'session_completed' && (
                        <div>
                          <p className="font-medium text-gray-900">Completed session with {activity.student}</p>
                          <p className="text-sm text-gray-600">{activity.subject} • {activity.duration} min • {activity.rating}⭐ rating</p>
                        </div>
                      )}
                      {activity.type === 'request_accepted' && (
                        <div>
                          <p className="font-medium text-gray-900">Accepted help request from {activity.student}</p>
                          <p className="text-sm text-gray-600">{activity.subject} tutoring session</p>
                        </div>
                      )}
                      {activity.type === 'achievement_earned' && (
                        <div>
                          <p className="font-medium text-gray-900">Achievement unlocked: {activity.achievement}</p>
                          <p className="text-sm text-gray-600">Keep up the great volunteer work!</p>
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">{activity.date}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Help Requests</h2>
              <p className="text-lg text-gray-600">Students who need your expertise!</p>
            </div>

            <div className="space-y-6">
              {helpRequests.map((request) => (
                <div key={request.id} className="bg-white/80 backdrop-blur-sm rounded-3xl border border-orange-200/50 p-6 shadow-lg">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{request.studentName}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(request.urgency)}`}>
                          {request.urgency.toUpperCase()} PRIORITY
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Subject & Topic</p>
                          <p className="font-medium text-gray-900">{request.subject} - {request.topic}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Student Level</p>
                          <p className="font-medium text-gray-900">{request.studentLevel}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Estimated Time</p>
                          <p className="font-medium text-gray-900">{request.estimatedTime} minutes</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Requested</p>
                          <p className="font-medium text-gray-900">{request.timeRequested}</p>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-1">Description</p>
                        <p className="text-gray-700">{request.description}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAcceptRequest(request.id)}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-xl transition-all hover:scale-[1.02]"
                    >
                      Accept & Help
                    </button>
                    <button
                      onClick={() => handleDeclineRequest(request.id)}
                      className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
                    >
                      Decline
                    </button>
                    <button className="px-6 py-3 bg-blue-100 hover:bg-blue-200 text-blue-700 font-medium rounded-xl transition-colors">
                      Message Student
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Manage Your Availability</h2>
              <p className="text-lg text-gray-600">Set when you're available to help students</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-orange-200/50 p-8 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Weekly Schedule</h3>
              
              <div className="space-y-4">
                {Object.entries(availability).map(([day, schedule]) => (
                  <div key={day} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                    <div className="w-24">
                      <span className="font-medium text-gray-900 capitalize">{day}</span>
                    </div>
                    
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={schedule.available}
                        onChange={(e) => setAvailability(prev => ({
                          ...prev,
                          [day]: { ...prev[day as keyof typeof prev], available: e.target.checked }
                        }))}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm text-gray-600">Available</span>
                    </label>
                    
                    {schedule.available && (
                      <input
                        type="text"
                        placeholder="9:00-17:00"
                        value={schedule.hours}
                        onChange={(e) => setAvailability(prev => ({
                          ...prev,
                          [day]: { ...prev[day as keyof typeof prev], hours: e.target.value }
                        }))}
                        className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-300"
                      />
                    )}
                    
                    {!schedule.available && (
                      <span className="flex-1 text-gray-400 italic">Not available</span>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 flex justify-end">
                <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-xl transition-all hover:scale-[1.02]">
                  Save Schedule
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'impact' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Volunteer Impact</h2>
              <p className="text-lg text-gray-600">See the difference you're making in students' lives!</p>
            </div>

            {/* Achievement Badges */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-orange-200/50 p-8 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Achievement Badges</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl border border-yellow-200">
                  <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-full flex items-center justify-center text-white mx-auto mb-4">
                    <Award className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">50 Students Helped</h4>
                  <p className="text-sm text-gray-600">You've made a difference in 50 students' academic journey!</p>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white mx-auto mb-4">
                    <Heart className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Community Hero</h4>
                  <p className="text-sm text-gray-600">Top 10% of volunteers this semester</p>
                </div>

                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border border-blue-200">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center text-white mx-auto mb-4">
                    <Target className="w-8 h-8" />
                  </div>
                  <h4 className="font-bold text-gray-900 mb-2">Math Master</h4>
                  <p className="text-sm text-gray-600">Helped 25+ students with mathematics</p>
                </div>
              </div>
            </div>

            {/* Success Stories */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-orange-200/50 p-8 shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Student Success Stories</h3>
              
              <div className="space-y-6">
                <div className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
                      S
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-2">Sarah improved from D to A in Calculus!</h4>
                      <p className="text-gray-700 mb-3">"Thanks to your patient explanations, I finally understand integration. You saved my GPA!"</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>⭐⭐⭐⭐⭐ 5.0 rating</span>
                        <span>📈 Grade improved by 3 levels</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border border-blue-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                      A
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 mb-2">Ahmad passed his Physics final exam!</h4>
                      <p className="text-gray-700 mb-3">"Your quantum mechanics explanations were so clear. I actually enjoyed studying physics for the first time!"</p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span>⭐⭐⭐⭐⭐ 5.0 rating</span>
                        <span>🎯 Passed with 85%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        </div>
      </main>
    </div>
  );
}
