"use client";

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  Heart,
  Bell,
  Calendar,
  Award,
  Settings,
  LogOut,
  User,
  BarChart3,
  Users,
  MessageSquare,
  Target
} from 'lucide-react';

export default function VolunteerSidebar() {
  const { user, profile, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [shouldRender, setShouldRender] = useState(false);
  
  useEffect(() => {
    // Only show sidebar on volunteer dashboard pages
    const isVolunteerPage = pathname.startsWith('/web/dashboard/volunteer');
    setShouldRender(isVolunteerPage);
  }, [pathname]);
  
  if (!shouldRender) {
    return null;
  }

  const navigationItems = [
    {
      name: 'Overview',
      href: '/web/dashboard/volunteer',
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      name: 'Help Requests',
      href: '/web/volunteer/requests',
      icon: <Bell className="w-5 h-5" />,
      badge: '3',
    },
    {
      name: 'My Schedule',
      href: '/web/volunteer/schedule',
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      name: 'Impact & Stats',
      href: '/web/volunteer/impact',
      icon: <Award className="w-5 h-5" />,
    },
    {
      name: 'Students',
      href: '/web/volunteer/students',
      icon: <Users className="w-5 h-5" />,
    },
    {
      name: 'Messages',
      href: '/web/volunteer/messages',
      icon: <MessageSquare className="w-5 h-5" />,
    },
    {
      name: 'Goals',
      href: '/web/volunteer/goals',
      icon: <Target className="w-5 h-5" />,
    },
    {
      name: 'Settings',
      href: '/web/volunteer/settings',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/web/login');
    } catch (error) {
      console.error('Error signing out:', error);
      window.location.href = '/web/login';
    }
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 shadow-lg border-r border-purple-200/50 z-50">
      {/* Logo */}
      <div className="p-6 border-b border-purple-200/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">L</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Lumos</h1>
            <p className="text-sm text-purple-600">Volunteer Portal</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-purple-200/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
            <Heart className="w-5 h-5 text-purple-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {profile?.name || user?.email?.split('@')[0] || 'Volunteer'}
            </p>
            <p className="text-xs text-purple-600 truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Volunteer Stats */}
      <div className="p-4 border-b border-purple-200/50">
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-3 bg-white/70 rounded-xl border border-purple-200/50">
            <div className="text-lg font-bold text-purple-600">47</div>
            <div className="text-xs text-gray-600">Students Helped</div>
          </div>
          <div className="text-center p-3 bg-white/70 rounded-xl border border-purple-200/50">
            <div className="text-lg font-bold text-pink-600">4.8★</div>
            <div className="text-xs text-gray-600">Rating</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative ${
                    isActive
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
                  }`}
                >
                  <span className={`${isActive ? 'text-purple-600' : 'text-gray-400'}`}>
                    {item.icon}
                  </span>
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Quick Actions */}
      <div className="p-4 border-t border-purple-200/50">
        <div className="space-y-2">
          <button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm">
            <Bell className="w-4 h-4" />
            View Requests
          </button>
          <button className="w-full flex items-center justify-center gap-2 bg-white/70 hover:bg-white border border-purple-200 text-purple-700 font-medium py-2 px-4 rounded-lg transition-colors text-sm">
            <Calendar className="w-4 h-4" />
            Set Availability
          </button>
        </div>
      </div>

      {/* Sign Out */}
      <div className="p-4 border-t border-purple-200/50">
        <button
          onClick={handleSignOut}
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-purple-50 hover:text-purple-600 w-full transition-colors"
        >
          <LogOut className="w-5 h-5 text-gray-400" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
