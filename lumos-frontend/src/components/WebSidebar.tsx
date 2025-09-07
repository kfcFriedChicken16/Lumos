"use client";

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { 
  MessageSquare, 
  BookOpen, 
  Settings, 
  Home,
  LogOut,
  User,
  Library,
  Play,
  Coins,
  HelpCircle,
  Users
} from 'lucide-react';

export default function WebSidebar() {
  const { user, profile, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [shouldRender, setShouldRender] = useState(false);
  
  useEffect(() => {
    // Only show sidebar on dashboard pages - handle on client side to avoid hydration issues
    const isDashboardPage = pathname.startsWith('/web/dashboard');
    setShouldRender(isDashboardPage);
  }, [pathname]);
  
  if (!shouldRender) {
    return null;
  }

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/web/dashboard',
      icon: <Home className="w-5 h-5" />,
    },
            {
          name: 'Seek Help',
          href: '/web/seek-help',
          icon: <HelpCircle className="w-5 h-5" />,
        },
        {
          name: 'Community',
          href: '/web/community',
          icon: <Users className="w-5 h-5" />,
        },
    {
      name: 'Study Resources',
      href: '/web/resources',
      icon: <Library className="w-5 h-5" />,
    },
    {
      name: 'Video Learning',
      href: '/web/video-learning',
      icon: <Play className="w-5 h-5" />,
    },
    {
      name: 'Chat',
      href: '/app/chat',
      icon: <MessageSquare className="w-5 h-5" />,
    },
    {
      name: 'Academic',
      href: '/app/academic',
      icon: <BookOpen className="w-5 h-5" />,
    },
    {
      name: 'Settings',
      href: '/web/settings',
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      // Use Next.js router for proper navigation
      router.push('/web/login');
    } catch (error) {
      console.error('Error signing out:', error);
      // Fallback to window.location if router fails
      window.location.href = '/web/login';
    }
  };

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 shadow-lg border-r border-orange-200/50 z-50">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">L</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Lumos</h1>
            <p className="text-sm text-gray-500">AI Tutoring</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {profile?.name || user?.email?.split('@')[0] || 'Student'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email}
            </p>
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
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <span className={`${
                    isActive
                      ? 'text-emerald-600'
                      : 'text-gray-400'
                  }`}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Sign Out */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleSignOut}
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 w-full transition-colors"
        >
          <LogOut className="w-5 h-5 text-gray-400" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
}
