"use client";

import { useRouter } from "next/navigation";
import { usePreferences } from "@/contexts/PreferencesContext";
import { prefsComplete } from "@/lib/prefs-complete";
import PreferencesForm from "@/components/PreferencesForm";
import { ArrowLeft, Settings, CheckCircle2 } from "lucide-react";

export default function PreferencesPage() {
  const { prefs, setPrefs } = usePreferences();
  const router = useRouter();

  const handleSave = (newPrefs: any) => {
    setPrefs(newPrefs);
    // Navigate back to previous page or dashboard if preferences are now complete
    if (prefsComplete(newPrefs)) {
      router.back();
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-20 left-10 h-32 w-32 rounded-full bg-orange-200/30 blur-2xl" />
        <div className="absolute bottom-20 right-10 h-40 w-40 rounded-full bg-pink-200/30 blur-2xl" />
        <div className="absolute top-1/2 left-1/3 h-24 w-24 rounded-full bg-yellow-200/30 blur-xl" />
        <div className="absolute top-1/3 right-1/4 h-20 w-20 rounded-full bg-purple-200/30 blur-xl" />
      </div>

      <div className="relative">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-orange-200/50 sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => router.back()}
                  className="flex items-center gap-2 rounded-full border border-orange-100 bg-white px-3 py-2 text-sm font-medium text-orange-700 shadow-sm hover:bg-orange-50 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-100 bg-white shadow-sm">
                  <Settings className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-lg font-semibold tracking-wide text-orange-700">
                    Learning Preferences
                  </div>
                  <div className="text-xs text-slate-500">
                    Personalize your Lumos experience
                  </div>
                </div>
              </div>
              
              {prefsComplete(prefs) && (
                <div className="flex items-center gap-2 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  Preferences Complete
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto px-6 py-8">
          <PreferencesForm
            initial={prefs}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
}
