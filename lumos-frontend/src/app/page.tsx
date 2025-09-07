"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Simple mobile detection
    const isMobile = window.innerWidth <= 768;
    
    if (isMobile) {
      router.push('/m');
    } else {
      router.push('/web');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-white text-center">
        <div className="animate-pulse">
          <h1 className="text-3xl font-bold mb-2">Lumos</h1>
          <p>Redirecting you to the right experience...</p>
        </div>
      </div>
    </div>
  );
}
