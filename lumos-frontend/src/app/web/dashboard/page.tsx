'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardRouter() {
  const { user, userRole, loading, determineUserRole } = useAuth();
  const router = useRouter();
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    if (loading) return; // Wait for auth to load

    if (!user) {
      // Not logged in, redirect to signin
      router.push('/web/login');
      return;
    }

    // Check if we already have the user role
    if (userRole) {
      console.log('User role already known:', userRole, 'redirecting...');
      setRoleLoading(false);
      switch (userRole) {
        case 'student':
          router.push('/web/dashboard/student');
          break;
        case 'volunteer':
          router.push('/web/dashboard/volunteer');
          break;
        case 'teacher':
          router.push('/web/dashboard/teacher');
          break;
        default:
          console.error('Unknown role:', userRole);
          router.push('/web/signup');
      }
      return;
    }

    // User is logged in but no role, detect their role
    const detectUserRole = async () => {
      try {
        setRoleLoading(true);
        
        // Use AuthContext's role detection
        const role = await determineUserRole();
        
        if (!role) {
          // No role assigned, redirect to signup to choose role
          console.log('No role found, redirecting to signup');
          router.push('/web/signup');
          return;
        }

        // Redirect based on role
        console.log('Role detected:', role, 'redirecting...');
        switch (role) {
          case 'student':
            router.push('/web/dashboard/student');
            break;
          case 'volunteer':
            router.push('/web/dashboard/volunteer');
            break;
          case 'teacher':
            router.push('/web/dashboard/teacher');
            break;
          default:
            console.error('Unknown role:', role);
            router.push('/web/signup');
        }
      } catch (error) {
        console.error('Error in role detection:', error);
        router.push('/web/signup');
      } finally {
        setRoleLoading(false);
      }
    };

    detectUserRole();
  }, [user, userRole, loading, router, determineUserRole]);

  // Show loading state while detecting role
  if (loading || roleLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-400 mx-auto mb-4"></div>
          <p className="text-xl">Detecting your role...</p>
        </div>
      </div>
    );
  }

  // This should never render as we redirect above
  return null;
}

