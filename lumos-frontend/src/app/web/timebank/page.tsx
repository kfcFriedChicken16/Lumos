'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTimebank } from '@/contexts/TimebankContext';
import MatchingModal from '@/components/MatchingModal';
import ActiveSession from '@/components/ActiveSession';
import NotificationToast from '@/components/NotificationToast';
import { 
  ArrowLeft, 
  Coins, 
  Clock, 
  Users, 
  Star, 
  BookOpen,
  Plus,
  Minus,
  Gift,
  TrendingUp,
  Calendar,
  Award,
  Target,
  Zap
} from 'lucide-react';

export default function TimebankPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const { 
    creditBalance, 
    transactions, 
    startMatching, 
    addTransaction,
    activeSession,
    tutorSkills 
  } = useTimebank();
  
  // Calculate weekly stats from transactions
  const earnedThisWeek = transactions
    .filter(t => t.type === 'earned' && isThisWeek(t.date))
    .reduce((sum, t) => sum + t.amount, 0);
  
  const spentThisWeek = Math.abs(transactions
    .filter(t => t.type === 'spent' && isThisWeek(t.date))
    .reduce((sum, t) => sum + t.amount, 0));

  function isThisWeek(dateString: string): boolean {
    const transactionDate = new Date(dateString);
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return transactionDate >= weekAgo;
  }
  
  // Use real transactions from context

  const availableActivities = [
    {
      id: 1,
      title: 'Tutor Mathematics',
      description: 'Help students with algebra, calculus, or statistics',
      creditsPerHour: 20,
      icon: '🧮',
      difficulty: 'Medium',
      estimatedTime: '30-60 min'
    },
    {
      id: 2,
      title: 'Lead Study Group',
      description: 'Organize and guide group study sessions',
      creditsPerHour: 15,
      icon: '👥',
      difficulty: 'Easy',
      estimatedTime: '45-90 min'
    },
    {
      id: 3,
      title: 'Essay Review',
      description: 'Provide feedback on academic writing',
      creditsPerHour: 12,
      icon: '📝',
      difficulty: 'Medium',
      estimatedTime: '20-40 min'
    },
    {
      id: 4,
      title: 'Exam Prep Support',
      description: 'Help students prepare for upcoming exams',
      creditsPerHour: 18,
      icon: '📚',
      difficulty: 'Hard',
      estimatedTime: '60-120 min'
    }
  ];

  const vouchers = [
    {
      id: 1,
      title: 'Udemy Course Access',
      description: 'Any course up to $50 value',
      cost: 250,
      icon: '🎓',
      provider: 'Udemy',
      popular: true
    },
    {
      id: 2,
      title: 'Coursera Certificate',
      description: 'Professional certificate course',
      cost: 400,
      icon: '🏆',
      provider: 'Coursera',
      popular: false
    },
    {
      id: 3,
      title: 'Campus Coffee Voucher',
      description: '$10 credit at campus cafés',
      cost: 50,
      icon: '☕',
      provider: 'Campus Dining',
      popular: true
    },
    {
      id: 4,
      title: 'Library Extension',
      description: 'Extra 2 weeks on book loans',
      cost: 30,
      icon: '📖',
      provider: 'University Library',
      popular: false
    }
  ];

  // Show active session if one exists
  if (activeSession) {
    return (
      <>
        <ActiveSession />
        <NotificationToast />
      </>
    );
  }

  return (
    <>
      <main className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-orange-200/50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Link 
                              href="/web/dashboard"
              className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
              <div className="p-3 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-2xl text-white shadow-lg">
                <Coins className="w-8 h-8" />
              </div>
              Peer Timebank
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Help fellow students and earn credits. Use credits to get help or redeem amazing rewards!
            </p>
          </div>

          {/* Credit Balance Card */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-gradient-to-br from-yellow-400 via-amber-400 to-orange-400 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
              
              <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">{creditBalance}</div>
                  <div className="text-yellow-100">Total Credits</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2 text-green-200">+{earnedThisWeek}</div>
                  <div className="text-yellow-100">Earned This Week</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold mb-2 text-red-200">-{spentThisWeek}</div>
                  <div className="text-yellow-100">Spent This Week</div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex justify-center">
            <div className="flex bg-white/70 backdrop-blur-sm rounded-2xl p-2 border border-orange-200">
              {[
                { id: 'overview', label: 'Overview', icon: TrendingUp },
                { id: 'earn', label: 'Earn Credits', icon: Plus },
                { id: 'spend', label: 'Spend Credits', icon: Gift },
                { id: 'history', label: 'History', icon: Clock }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-lg'
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
            {/* Recent Activity */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-orange-200/50 p-8 shadow-lg">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Clock className="w-6 h-6 text-orange-500" />
                Recent Activity
              </h2>
              <div className="space-y-4">
                {transactions.slice(0, 3).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-orange-50/50 rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-lg ${
                        transaction.type === 'earned' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {transaction.type === 'earned' ? <Plus className="w-5 h-5" /> : <Minus className="w-5 h-5" />}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{transaction.activity}</div>
                        <div className="text-sm text-gray-600">with {transaction.student} • {transaction.date}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${
                        transaction.type === 'earned' ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {transaction.type === 'earned' ? '+' : ''}{transaction.amount}
                      </div>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${
                            i < transaction.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`} />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <button 
                onClick={() => setActiveTab('earn')}
                className="group bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-3xl p-6 hover:shadow-xl transition-all hover:scale-[1.02]"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl text-white">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-green-600 transition-colors">
                      Start Earning
                    </h3>
                    <p className="text-sm text-gray-600">Help others</p>
                  </div>
                </div>
                <div className="text-xs text-green-700 font-medium">
                  🎯 15-25 credits per session
                </div>
              </button>

              <button 
                onClick={() => setActiveTab('spend')}
                className="group bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-3xl p-6 hover:shadow-xl transition-all hover:scale-[1.02]"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl text-white">
                    <Gift className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                      Redeem Rewards
                    </h3>
                    <p className="text-sm text-gray-600">Use credits</p>
                  </div>
                </div>
                <div className="text-xs text-purple-700 font-medium">
                  🎁 {vouchers.length} rewards available
                </div>
              </button>

              <Link 
                href="/web/timebank/skills"
                className="group bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-3xl p-6 hover:shadow-xl transition-all hover:scale-[1.02] block"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl text-white">
                    <Target className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                      Manage Skills
                    </h3>
                    <p className="text-sm text-gray-600">Update abilities</p>
                  </div>
                </div>
                <div className="text-xs text-blue-700 font-medium">
                  📚 {tutorSkills?.length || 0} teaching skills
                </div>
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'earn' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Earn Credits by Helping Others</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Choose an activity and get matched with students who need your help. All sessions are verified!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {availableActivities.map((activity) => (
                <div key={activity.id} className="bg-white/80 backdrop-blur-sm rounded-3xl border border-orange-200/50 p-6 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-4xl">{activity.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                        {activity.title}
                      </h3>
                      <p className="text-gray-600">{activity.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-green-600">
                        {activity.creditsPerHour}
                        <span className="text-sm font-normal text-gray-500 ml-1">credits/hour</span>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        activity.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                        activity.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {activity.difficulty}
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600 mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {activity.estimatedTime}
                  </div>

                  <button 
                    onClick={() => startMatching(activity.title)}
                    className="w-full bg-gradient-to-r from-orange-500 to-pink-500 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg transition-all hover:scale-[1.02]"
                  >
                    Get Matched
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'spend' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Redeem Your Credits</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Turn your hard-earned credits into valuable courses, vouchers, and campus perks!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {vouchers.map((voucher) => (
                <div key={voucher.id} className="bg-white/80 backdrop-blur-sm rounded-3xl border border-orange-200/50 p-6 shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] group relative">
                  {voucher.popular && (
                    <div className="absolute -top-2 -right-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      Popular
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-4xl">{voucher.icon}</div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                        {voucher.title}
                      </h3>
                      <p className="text-gray-600">{voucher.description}</p>
                      <p className="text-sm text-gray-500 mt-1">{voucher.provider}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="text-2xl font-bold text-purple-600">
                      {voucher.cost}
                      <span className="text-sm font-normal text-gray-500 ml-1">credits</span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                      creditBalance >= voucher.cost 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {creditBalance >= voucher.cost ? 'Available' : 'Need more credits'}
                    </div>
                  </div>

                  <button 
                    disabled={creditBalance < voucher.cost}
                    onClick={() => {
                      if (creditBalance >= voucher.cost) {
                        addTransaction({
                          type: 'spent',
                          amount: -voucher.cost,
                          activity: `Redeemed ${voucher.title}`,
                          student: voucher.provider,
                          rating: 5,
                          description: voucher.description
                        });
                      }
                    }}
                    className={`w-full font-bold py-3 px-6 rounded-xl transition-all hover:scale-[1.02] ${
                      creditBalance >= voucher.cost
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    {creditBalance >= voucher.cost ? 'Redeem Now' : `Need ${voucher.cost - creditBalance} more credits`}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Transaction History</h2>
              <p className="text-lg text-gray-600">Track all your earning and spending activity</p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-orange-200/50 p-8 shadow-lg">
              <div className="space-y-4">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-6 bg-gradient-to-r from-gray-50 to-orange-50/50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl ${
                        transaction.type === 'earned' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-blue-100 text-blue-600'
                      }`}>
                        {transaction.type === 'earned' ? <Plus className="w-6 h-6" /> : <Minus className="w-6 h-6" />}
                      </div>
                      <div>
                        <div className="font-bold text-gray-900 text-lg">{transaction.activity}</div>
                        <div className="text-gray-600">with {transaction.student}</div>
                        <div className="text-sm text-gray-500">{transaction.date}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-2xl font-bold ${
                        transaction.type === 'earned' ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {transaction.type === 'earned' ? '+' : ''}{transaction.amount} credits
                      </div>
                      <div className="flex items-center gap-1 justify-end mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-4 h-4 ${
                            i < transaction.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`} />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
      </main>
      
      <MatchingModal />
      <NotificationToast />
    </>
  );
}
