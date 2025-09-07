"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { usePreferences } from "@/contexts/PreferencesContext";
import { prefsComplete } from "@/lib/prefs-complete";

const PREFS_PATH = "/web/settings/preferences";

export default function RequirePrefs({ children }: { children: React.ReactNode }) {
  const { prefs, isLoaded } = usePreferences();
  const router = useRouter();
  const path = usePathname();

  useEffect(() => {
    // Don't redirect if already on preferences page to avoid loops
    if (path?.startsWith(PREFS_PATH)) return;
    
    // Only check preferences after they've been loaded
    if (isLoaded && !prefsComplete(prefs)) {
      router.replace(PREFS_PATH);
    }
  }, [prefs, path, router, isLoaded]);

  // Don't render children if preferences are incomplete and not on preferences page
  // But only after preferences have been loaded
  if (isLoaded && !prefsComplete(prefs) && !path?.startsWith(PREFS_PATH)) {
    return null;
  }

  // Show loading state while preferences are being loaded
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading your preferences...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
