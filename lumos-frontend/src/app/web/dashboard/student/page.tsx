"use client";

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from '@/contexts/AuthContext';
import { useCredits } from '@/contexts/CreditContext';
import RequirePrefs from '@/components/RequirePrefs';
import { 
  Sparkles,
  Bell,
  Languages,
  Bot,
  Users,
  LibraryBig,
  ShoppingBag,
  Coins,
  CalendarClock,
  Target,
  PlayCircle,
  ChevronRight,
  Star,
  ExternalLink,
  ShieldCheck,
  CreditCard,
  Wallet,
} from "lucide-react";

/**
 * Lumos Student Dashboard — Student‑Only (No Timebank)
 * ----------------------------------------------------
 * • Credits wallet + Top Up modal
 * • Ask Lumos (bot) → CTA
 * • Start Live Help: choose Subject + Topic → Start Chat (volunteer matching)
 * • Continue Session (whiteboard) if active
 * • Quick access: Resources Hub, Marketplace, Community Q&A
 * • Featured resources/notes + Community feed
 * • SPM countdown + daily goal hint
 * • Pastel, undraw‑style look; pure client preview
 */

// ---- Language typing helpers ----
const LANG_OPTIONS = ["EN", "BM", "中文"] as const;
type Lang = typeof LANG_OPTIONS[number];
const isLang = (v: string): v is Lang => (LANG_OPTIONS as readonly string[]).includes(v);

// ---- Seed data (light) ----
const SUBJECTS: Record<string, string[]> = {
  Mathematics: ["Algebra", "Calculus", "Geometry"],
  Science: ["Physics", "Chemistry"],
  English: ["Grammar"],
  Sejarah: ["Bab 3", "Bab 4"],
  "Computer Science": ["Programming", "Data Basics"],
};

const FEATURED_RESOURCES = [
  { id: "fr1", title: "Algebra Basics — Math Antics (12m)", url: "https://www.youtube.com/watch?v=NybHckSEQBI" },
  { id: "fr2", title: "Derivatives — Khan Academy (9m)", url: "https://www.youtube.com/watch?v=ANyVpMS3HL4" },
  { id: "fr3", title: "Pythagorean Theorem — Numberphile (11m)", url: "https://www.youtube.com/watch?v=YompsDlEdtc" },
];

const MARKET_NOTES = [
  { id: "mk1", title: "Add Maths: Differentiation Crash Notes", price: 18, rating: 4.8 },
  { id: "mk2", title: "Physics: Forces & Motion Cheatsheet", price: 15, rating: 4.6 },
  { id: "mk3", title: "Sejarah SPM: Bab 2–4 High‑Yield Notes", price: 10, rating: 4.3 },
];

const COMMUNITY_FEED = [
  { id: "q1", who: "Aina", text: "How to factorise 2x^2 − 7x − 4?", when: "2h" },
  { id: "q2", who: "Rahman", text: "Newton's 3rd law example for exam?", when: "Yesterday" },
  { id: "q3", who: "Zhi Wei", text: "Sejarah Bab 3 timeline mnemonic?", when: "2d" },
];

export default function LumosStudentDashboardFinal() {
  const { user, profile } = useAuth();
  const { creditBalance: credits, deductCredits } = useCredits();
  // ---- UI state ----
  const [lang, setLang] = useState<Lang>("EN");
  const [topUpOpen, setTopUpOpen] = useState(false);
  const [hasActiveSession, setHasActiveSession] = useState(false);

  // Live help picker
  const subjectKeys = Object.keys(SUBJECTS);
  const [subject, setSubject] = useState<string>(subjectKeys[0]);
  const [topic, setTopic] = useState<string>(SUBJECTS[subjectKeys[0]][0]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  // Exam countdown (example: 90 days from now)
  const [examDate, setExamDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 90);
    return d.toISOString().slice(0, 10);
  });
  const examCountdown = useMemo(() => {
    const target = new Date(examDate).getTime();
    const days = Math.max(0, Math.ceil((target - Date.now()) / (1000 * 60 * 60 * 24)));
    return days;
  }, [examDate]);

  // ---- Actions (stubs) ----
  function goAskLumos() {
    window.location.href = "/app/chat";
  }
  function goResources() {
    window.location.href = "/web/resources";
  }
  function goMarketplace() {
    window.location.href = "/web/resources";
  }
  function goCommunity() {
    // Keep as alert for now as requested
    alert("Navigate to: /app/community");
  }
  function startLiveChat() {
    if (credits < 10) {
      setTopUpOpen(true);
      return;
    }
    deductCredits(10); // demo: connect fee
    setHasActiveSession(true);
    alert(`Starting live help for ${subject} → ${topic}. Opening whiteboard + chat…`);
  }
  function resumeWhiteboard() {
    alert("Navigate to: /app/whiteboard/session/123");
  }

  return (
    <RequirePrefs>
      <div className="min-h-[100dvh] w-full bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 text-slate-700">
                 {/* Welcome Banner */}
      <div className="mx-auto max-w-6xl px-4 py-8">
           <div className="rounded-3xl border border-orange-200/50 bg-gradient-to-br from-orange-50/90 via-yellow-50/90 to-pink-50/90 backdrop-blur-sm p-8 shadow-xl shadow-orange-100/50 relative overflow-hidden">
             {/* Decorative pattern */}
             <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-200/20 to-pink-200/20 rounded-full blur-2xl"></div>
             <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-yellow-200/20 to-orange-200/20 rounded-full blur-xl"></div>
             
             <div className="relative z-10 flex items-center justify-between">
               <div>
                 <div className="mb-2">
                   <h1 className="text-3xl font-bold text-gray-900">
                     Welcome back, <span className="bg-gradient-to-r from-pink-400 via-yellow-400 to-cyan-400 bg-clip-text text-transparent">{profile?.name || user?.email?.split('@')[0] || 'Student'}</span>! ✨
                   </h1>
                 </div>
                 <p className="text-xl text-gray-700">Ready to continue your amazing learning adventure?</p>
               </div>
               <div className="text-right">
                 <div className="flex items-center space-x-2 mb-2">
                   <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                   <span className="text-sm font-medium text-emerald-700">Coaches available now</span>
                 </div>
                 <p className="text-xs text-gray-600">Peak hours: 2pm - 10pm MYT</p>
                 
                 {/* Credit Balance Display */}
                 <div className="mt-3 flex items-center justify-end gap-2">
                   <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl">
                     <Coins className="w-4 h-4 text-yellow-600" />
                     <span className="text-sm font-medium text-yellow-800">
                    {credits} credits
                     </span>
                   </div>
                <button 
                  onClick={() => window.location.href = "/web/student/credits"}
                     className="px-3 py-2 bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm font-medium rounded-xl hover:shadow-lg transition-all hover:scale-105"
                   >
                     Top Up
                </button>
                 </div>
               </div>
             </div>
           </div>
         </div>



      {/* Quick Actions */}
      <div className="mx-auto max-w-6xl px-4 mt-4">
        <div className="rounded-2xl border border-orange-100 bg-white/70 p-4 shadow-sm backdrop-blur">
          <div className="mb-2 text-sm font-semibold text-orange-700">Quick actions</div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <QuickAction icon={Bot} label="Ask Lumos (AI)" onClick={goAskLumos} />
            <QuickAction icon={Users} label="Start Live Help" onClick={() => document.getElementById("live-help")?.scrollIntoView({ behavior: "smooth" })} />
            <QuickAction icon={LibraryBig} label="Resources Hub" onClick={goResources} />
            <QuickAction icon={ShoppingBag} label="Marketplace" onClick={goMarketplace} />
            <QuickAction icon={Wallet} label="Wallet / Top Up" onClick={() => window.location.href = "/web/student/credits"} />
              </div>
             </div>
           </div>
           
      {/* Two-column main */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-4 md:grid-cols-3">
        {/* Left: Live Help + Continue Session */}
        <div className="md:col-span-2 flex flex-col gap-4">


          {/* Start Live Help */}
          <motion.div id="live-help" layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
            <div className="text-center">
              <div className="mb-4">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
               </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Need Live Help?</h3>
                <p className="text-gray-600">Connect with volunteer tutors for personalized assistance</p>
              </div>
              
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-emerald-700">Volunteers are online now!</span>
             </div>
                <p className="text-xs text-gray-600">Peak hours: 2pm - 10pm MYT</p>
           </div>
           
              <div className="space-y-3 text-sm text-gray-700">
                <p>✨ <strong>How to get started:</strong></p>
                <ol className="text-left space-y-2 ml-4">
                  <li>1. Click <strong>"Seek Help"</strong> in the sidebar</li>
                  <li>2. Choose your <strong>subject</strong> and <strong>topic</strong></li>
                  <li>3. Start your live whiteboard session!</li>
                </ol>
               </div>
              
              <div className="mt-4 pt-4 border-t border-orange-100">
                <p className="text-xs text-gray-500 mb-2">10 credits to connect • Whiteboard + chat • Real-time help</p>
                <button 
                  onClick={() => window.location.href = "/web/seek-help"}
                  className="inline-flex items-center gap-1 rounded-xl bg-gradient-to-r from-orange-500 to-pink-500 px-6 py-3 text-white font-medium hover:shadow-lg transition-all hover:scale-105"
                >
                  <Users className="w-4 h-4" />
                  Go to Seek Help
                </button>
              </div>
             </div>
          </motion.div>


           </div>
           
        {/* Right rail: Resources + Marketplace + Community */}
        <div className="flex flex-col gap-4">
          {/* Official Resources */}
          <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-semibold text-orange-700">Official free resources</div>
              <button onClick={goResources} className="text-xs text-orange-700 hover:underline flex items-center gap-1">
                Browse all <ChevronRight className="h-3 w-3" />
              </button>
               </div>
            <div className="space-y-2">
              {FEATURED_RESOURCES.map((r) => (
                <div key={r.id} className="rounded-xl border border-orange-100 bg-orange-50/50 p-3">
                  <div className="text-sm font-medium text-slate-800 mb-1">{r.title}</div>
                  <a href={r.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-orange-700 hover:underline">
                    <ExternalLink className="h-3.5 w-3.5" /> Open resource
                  </a>
              </div>
              ))}
             </div>
          </motion.div>

          {/* Marketplace */}
          <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-sm font-semibold text-orange-700">Marketplace picks</div>
              <button onClick={goMarketplace} className="text-xs text-orange-700 hover:underline flex items-center gap-1">
                See all <ChevronRight className="h-3 w-3" />
              </button>
                 </div>
            <ul className="space-y-2 text-sm">
              {MARKET_NOTES.map((m) => (
                <li key={m.id} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-800">{m.title}</div>
                    <div className="text-[11px] text-slate-500">
                      Rating {m.rating.toFixed(1)} <Star className="inline h-3 w-3 text-amber-400 fill-amber-400" />
                 </div>
               </div>
                    <button
                    onClick={() => (credits < m.price ? setTopUpOpen(true) : alert("Purchased (demo)"))}
                    className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs text-orange-700"
                    >
                    {m.price} cr
                    </button>
                </li>
              ))}
            </ul>
          </motion.div>

                                       
                 </div>
               </div>

      {/* Community Q&A - Full Width */}
      <div className="mx-auto max-w-6xl px-4 py-4">
        <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-orange-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-lg font-semibold text-orange-700">Community Q&A</div>
            <button onClick={goCommunity} className="text-sm text-orange-700 hover:underline flex items-center gap-1">
              Ask a question <ChevronRight className="h-4 w-4" />
               </button>
               </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {COMMUNITY_FEED.map((q) => (
              <div key={q.id} className="rounded-xl border border-orange-100 bg-orange-50/50 p-4">
                <div className="font-medium text-slate-800 mb-2">{q.text}</div>
                <div className="text-xs text-slate-500 mb-3">by {q.who} • {q.when}</div>
                <button className="w-full rounded-lg border border-orange-200 bg-white px-3 py-2 text-xs text-slate-700 hover:bg-orange-50 transition-colors">
                  View
                </button>
             </div>
           ))}
          </div>
        </motion.div>
         </div>

      {/* Top Up Modal */}
      <AnimatePresence>
        {topUpOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4"
          >
            <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 16, opacity: 0 }} className="w-full max-w-md rounded-2xl border border-orange-100 bg-white p-4 shadow-lg">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-orange-700">
                <CreditCard className="h-4 w-4" /> Top up credits
                 </div>
              <div className="text-xs text-slate-600">Choose an amount (demo):</div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[20, 50, 100].map((amt) => (
                  <button key={amt} onClick={() => { deductCredits(amt); setTopUpOpen(false); }} className="rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-medium text-orange-700">
                    +{amt} cr
                </button>
                ))}
                  </div>
              <div className="mt-3 flex items-center justify-end gap-2">
                <button onClick={() => setTopUpOpen(false)} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700">Close</button>
                  </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer tip */}
      <div className="mx-auto max-w-6xl px-4 pb-8">
        <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm text-sm text-slate-700">
          <span className="font-semibold text-orange-700">Tip:</span> Try a 2–5 minute hint with Lumos first. If you still need help, start a live session and we'll match a volunteer tutor.
        </div>
      </div>
      </div>
    </RequirePrefs>
  );
}

// ---- Small UI components ----
function MetricCard({
  icon: Icon,
  label,
  value,
  sub,
  action,
  extra,
}: {
  icon: any;
  label: string;
  value: string;
  sub?: string;
  action?: { text: string; onClick: () => void };
  extra?: React.ReactNode;
}) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-orange-700 border border-orange-100">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <div className="text-xs text-slate-500">{label}</div>
          <div className="text-lg font-semibold text-slate-800">{value}</div>
          {sub && <div className="text-[11px] text-slate-500">{sub}</div>}
          {extra}
                   </div>
        {action && (
          <button onClick={action.onClick} className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700">
            {action.text}
          </button>
        )}
       </div>
    </motion.div>
  );
}

function QuickAction({ icon: Icon, label, onClick }: { icon: any; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="group flex items-center gap-2 rounded-2xl border border-orange-100 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm hover:bg-orange-50">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-50 text-orange-700 border border-orange-100 group-hover:bg-orange-100">
        <Icon className="h-5 w-5" />
      </div>
      <span className="font-medium">{label}</span>
             </button>
   );
 }
