"use client"

import React from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireProfile?: boolean
}

export default function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  requireProfile = false 
}: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        // Detect if mobile
        const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
        router.push(isMobile ? '/m/login' : '/web/login')
      } else if (requireProfile && user && !profile) {
        // Only redirect to signup if user has NO profile at all
        // If they have a profile but missing fields, let them access the app
        // Detect if mobile
        const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
        router.push(isMobile ? '/m/signup' : '/web/signup')
      }
    }
  }, [user, profile, loading, requireAuth, requireProfile, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    )
  }

  if (requireAuth && !user) {
    return null // Will redirect to login
  }

  if (requireProfile && user && !profile) {
    return null // Will redirect to profile setup
  }

  return <>{children}</>
}
