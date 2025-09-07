"use client";

import { useState, useMemo } from "react";
import { useCredits } from "@/contexts/CreditContext";
import RequirePrefs from "@/components/RequirePrefs";
import {
  Users,
  Lightbulb,
  ChevronRight,
  Calculator,
  TestTube,
  BookOpen,
  GraduationCap,
  Lightbulb as SkillsIcon,
  FileText,
  Zap,
  ArrowLeft,
  CheckCircle2,
  X,
  Loader2,
  Bot,
  AlertCircle,
} from "lucide-react";

/**
 * Seek Help — Simplified Two‑Column Layout
 * ---------------------------------------
 * • Left: subject cards (click to select)
 * • Right (sticky): topic picker for selected subject + Start chat CTA
 * • Cleaner than per‑card dropdowns; mobile‑first responsive
 * • Pure layout; no external contexts required
 */

interface ServiceCard {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string; // tailwind gradient e.g. "from-blue-500 to-cyan-500"
  topics: string[];
}

type GoalKey =
  | "solve"
  | "homework"
  | "testprep"
  | "check"
  | "deepen"
  | "explore"
  | "other";

type LevelKey = "none" | "little" | "medium" | "well" | "perfect";

type MoodKey = "angry" | "sad" | "neutral" | "happy" | "confident";

// ---------- Config ---------- //
const CREDIT_MIN = 3; // minimum hold to discourage spam (≈6 minutes)
const MINUTES_PER_CREDIT = 2; // 1 credit ≈ 2 minutes

// Base credits by goal (before level adders)
const GOAL_BASE: Record<GoalKey, number> = {
  solve: 4, // ~8m
  homework: 6, // ~12m
  testprep: 6, // ~12m
  check: 3, // ~6m
  deepen: 5, // ~10m
  explore: 3, // ~6m
  other: 3,
};

// Adders by understanding level
const LEVEL_ADD: Record<LevelKey, number> = {
  none: 4,
  little: 2,
  medium: 1,
  well: 0,
  perfect: 0,
};

const GOAL_LABEL: Record<GoalKey, string> = {
  solve: "Solve a specific question",
  homework: "Complete a homework assignment",
  testprep: "Prepare for a quiz/test",
  check: "Check my answers",
  deepen: "Deepen my understanding",
  explore: "I'm curious and want to learn",
  other: "Other",
};

const LEVEL_LABEL: Record<LevelKey, string> = {
  none: "Not at all",
  little: "A little",
  medium: "A medium amount",
  well: "Really well",
  perfect: "Almost perfectly",
};

const MOOD_LABEL: Record<MoodKey, string> = {
  angry: "Frustrated",
  sad: "Not confident",
  neutral: "Okay",
  happy: "Good",
  confident: "Confident",
};

function estimateCredits(goal: GoalKey, level: LevelKey) {
  const base = GOAL_BASE[goal];
  const add = LEVEL_ADD[level];
  const raw = base + add;
  return Math.max(CREDIT_MIN, raw);
}

function toMinutes(credits: number) {
  return credits * MINUTES_PER_CREDIT;
}

// ---------- Data ---------- //
const SERVICES: ServiceCard[] = [
  {
    id: "math",
    title: "Mathematics",
    description: "Algebra, calculus, statistics, and more.",
    icon: <Calculator className="h-6 w-6" />,
    color: "from-pink-500 to-rose-500",
    topics: ["Algebra", "Calculus", "Statistics", "Geometry", "Trigonometry"],
  },
  {
    id: "science",
    title: "Sciences",
    description: "Physics, chemistry, biology.",
    icon: <TestTube className="h-6 w-6" />,
    color: "from-purple-500 to-violet-500",
    topics: ["Physics", "Chemistry", "Biology", "General Science"],
  },
  {
    id: "languages",
    title: "Languages",
    description: "English, BM, Mandarin, essays.",
    icon: <BookOpen className="h-6 w-6" />,
    color: "from-blue-500 to-cyan-500",
    topics: ["English", "Bahasa Malaysia", "Mandarin", "Essay Writing"],
  },
  {
    id: "exams",
    title: "Standardized Tests",
    description: "SPM, STPM, MUET, university.",
    icon: <GraduationCap className="h-6 w-6" />,
    color: "from-yellow-500 to-amber-500",
    topics: ["SPM", "STPM", "MUET", "University Entrance"],
  },
  {
    id: "study-skills",
    title: "Study Skills",
    description: "Time management, notes, memory.",
    icon: <SkillsIcon className="h-6 w-6" />,
    color: "from-emerald-500 to-teal-500",
    topics: ["Time Management", "Note Taking", "Research Methods", "Memory Techniques"],
  },
  {
    id: "essay-writing",
    title: "Essay Writing",
    description: "Academic/creative writing, citations.",
    icon: <FileText className="h-6 w-6" />,
    color: "from-indigo-500 to-purple-500",
    topics: ["Academic Writing", "Research Papers", "Creative Writing", "Citations"],
  },
];

export default function SeekHelpTwoColumn() {
  const [activeService, setActiveService] = useState<ServiceCard | null>(SERVICES[0]);
  const [activeTopic, setActiveTopic] = useState<string | null>(null);
  const [showStepper, setShowStepper] = useState(false);
  const [showMatching, setShowMatching] = useState(false);
  const [matchingState, setMatchingState] = useState<'matching' | 'no-tutor' | 'matched'>('matching');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [nextWillSucceed, setNextWillSucceed] = useState(true); // Start with success
  const { creditBalance, deductCredits } = useCredits();

  const topics = useMemo(() => activeService?.topics ?? [], [activeService]);

  function onOpenStepper() {
    if (!activeService || !activeTopic) return;
    setShowStepper(true);
  }

  function onConfirmStart(payload: {
    goal: GoalKey;
    level: LevelKey;
    mood: MoodKey;
    holdCredits: number;
    minutes: number;
    autoExtend: boolean;
  }) {
    // Check if user has enough credits
    if (creditBalance < payload.holdCredits) {
      alert(`You need ${payload.holdCredits} credits but only have ${creditBalance}. Please top up your credits first.`);
      return;
    }
    
    // Deduct credits (demo - in real app this would be a hold)
    deductCredits(payload.holdCredits);
    setShowStepper(false);
    
    // Start matching process
    setShowMatching(true);
    setMatchingState('matching');
    setTimeElapsed(0);
    
    // Simulate matching process with realistic probability
    const matchingInterval = setInterval(() => {
      setTimeElapsed(prev => {
        const newTime = prev + 1;
        // After 3 seconds (representing 3 minutes), decide outcome
        if (newTime >= 3) {
          // Alternate between success and failure for demo
          const tutorFound = nextWillSucceed;
          setMatchingState(tutorFound ? 'matched' : 'no-tutor');
          // Toggle for next time
          setNextWillSucceed(!nextWillSucceed);
          clearInterval(matchingInterval);
        }
        return newTime;
      });
    }, 1000);
  }

  function startSession() {
    const subject = encodeURIComponent(activeTopic || "");
    const service = encodeURIComponent(activeService?.id || "");
    const q = new URLSearchParams({
      subject,
      service,
      goal: "solve", // Default values for demo
      level: "little",
      mood: "neutral",
      hold: "6",
      min: "12",
      auto: "0",
    }).toString();
    window.location.href = `/web/session?${q}`;
  }

  function acceptAITutor() {
    setShowMatching(false);
    // Redirect to AI chat
    window.location.href = '/app/chat';
  }

  return (
    <RequirePrefs>
      <main className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 relative">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-20 left-10 h-32 w-32 rounded-full bg-orange-200/30 blur-2xl" />
        <div className="absolute bottom-20 right-10 h-40 w-40 rounded-full bg-pink-200/30 blur-2xl" />
        <div className="absolute top-1/2 left-1/3 h-24 w-24 rounded-full bg-yellow-200/30 blur-xl" />
        <div className="absolute top-1/3 right-1/4 h-20 w-20 rounded-full bg-purple-200/30 blur-xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 py-8">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => (window.location.href = "/web/dashboard/student")}
              className="flex items-center gap-2 rounded-full border border-orange-100 bg-white px-3 py-2 text-sm font-medium text-orange-700 shadow-sm hover:bg-orange-50"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Dashboard
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-100 bg-white shadow-sm">
              <Users className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="text-lg font-semibold tracking-wide text-orange-700">Seek Help</div>
              <div className="text-xs text-slate-500">Pick a subject → choose topic → Start chat</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-full border border-orange-100 bg-white/80 px-3 py-1.5 text-xs shadow-sm flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" /> Coaches available now
            </div>
            <div className="rounded-full border border-orange-100 bg-white/80 px-3 py-1.5 text-xs shadow-sm flex items-center gap-2">
              <span className="text-orange-600 font-medium">{creditBalance}</span>
              <span className="text-slate-500">credits</span>
            </div>
          </div>
        </div>

        {/* How‑to strip */}
        <div className="mb-6 rounded-2xl border border-orange-200/50 bg-gradient-to-br from-orange-50/90 via-yellow-50/90 to-pink-50/90 p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Step n={1} text={<><b>Choose a subject</b> you need help with</>} />
            <ChevronRight className="hidden h-4 w-4 text-orange-400 sm:block" />
            <Step n={2} text={<><b>Select a topic</b> (e.g., Algebra, Physics)</>} />
            <ChevronRight className="hidden h-4 w-4 text-orange-400 sm:block" />
            <Step n={3} text={<><b>Start chat</b> — we'll match a volunteer</>} />
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left — subjects */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {SERVICES.map((svc) => {
                const active = activeService?.id === svc.id;
                return (
                  <button
                    key={svc.id}
                    onClick={() => {
                      setActiveService(svc);
                      setActiveTopic(null);
                    }}
                    className={`relative overflow-hidden rounded-2xl border p-4 text-left transition-all shadow-sm ${
                      active ? "border-orange-300 bg-white" : "border-orange-200/50 bg-white/70 hover:bg-white"
                    }`}
                  >
                    {/* gradient chip */}
                    <div className={`mb-3 inline-flex items-center gap-2 rounded-xl bg-gradient-to-br ${svc.color} px-3 py-2 text-white shadow` }>
                      {svc.icon}
                      <span className="text-sm font-semibold">{svc.title}</span>
                    </div>
                    <div className="text-sm text-slate-700">{svc.description}</div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {svc.topics.slice(0, 4).map((t) => (
                        <span key={t} className="rounded-full border border-orange-200 bg-white px-2 py-0.5 text-[11px] text-slate-700">{t}</span>
                      ))}
                      {svc.topics.length > 4 && (
                        <span className="rounded-full border border-orange-200 bg-white px-2 py-0.5 text-[11px] text-slate-500">+{svc.topics.length - 4} more</span>
                      )}
                    </div>
                    {active && (
                      <span className="absolute right-4 top-4 inline-flex items-center gap-1 text-xs font-medium text-emerald-700"><CheckCircle2 className="h-4 w-4"/> Selected</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right — topic panel + CTA */}
          <aside className="lg:sticky lg:top-6 h-max rounded-2xl border border-orange-200/60 bg-white p-4 shadow-sm">
            <div className="mb-2 text-sm font-semibold text-orange-700">Selected subject</div>
            <div className="rounded-xl border border-orange-100 bg-gradient-to-br from-white to-orange-50 p-3">
              <div className="text-base font-semibold text-slate-800">{activeService?.title}</div>
              <div className="text-xs text-slate-500">{activeService?.description}</div>
            </div>

            <div className="mt-3 text-sm font-semibold text-orange-700">Choose a topic</div>
            {topics.length === 0 ? (
              <div className="text-sm text-slate-500">Pick a subject on the left to see topics.</div>
            ) : (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {topics.map((t) => (
                  <button
                    key={t}
                    onClick={() => setActiveTopic(t)}
                    className={`rounded-xl border px-3 py-2 text-sm transition ${
                      activeTopic === t ? "border-orange-300 bg-orange-50" : "border-orange-100 bg-white hover:bg-orange-50"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={onOpenStepper}
              disabled={!activeService || !activeTopic}
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-orange-500 via-pink-500 to-purple-500 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Zap className="mr-2 inline h-5 w-5" /> Start a chat
            </button>
            <p className="mt-2 text-[11px] text-slate-500">We'll ask 3 quick questions to match you, then recommend a time & credit hold.</p>
          </aside>
        </div>
      </div>

      {showStepper && (
        <IntakeStepper
          subject={activeService?.title || ""}
          topic={activeTopic || ""}
          creditBalance={creditBalance}
          onClose={() => setShowStepper(false)}
          onConfirm={onConfirmStart}
        />
      )}

      {showMatching && (
        <MatchingScreen
          subject={activeService?.title || ""}
          topic={activeTopic || ""}
          matchingState={matchingState}
          timeElapsed={timeElapsed}
          onStartSession={startSession}
          onAcceptAI={acceptAITutor}
          onClose={() => setShowMatching(false)}
        />
      )}
      </main>
    </RequirePrefs>
  );
}

function Step({ n, text }: { n: number; text: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100"><span className="text-orange-700 text-sm font-bold">{n}</span></div>
      <div className="text-sm text-slate-700">{text}</div>
    </div>
  );
}

// ---------- Intake Stepper Modal ---------- //
function IntakeStepper({
  subject,
  topic,
  creditBalance,
  onClose,
  onConfirm,
}: {
  subject: string;
  topic: string;
  creditBalance: number;
  onClose: () => void;
  onConfirm: (p: {
    goal: GoalKey;
    level: LevelKey;
    mood: MoodKey;
    holdCredits: number;
    minutes: number;
    autoExtend: boolean;
  }) => void;
}) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [goal, setGoal] = useState<GoalKey>("solve");
  const [level, setLevel] = useState<LevelKey>("little");
  const [mood, setMood] = useState<MoodKey>("neutral");
  const [autoExtend, setAutoExtend] = useState(false);

  const holdCredits = useMemo(() => estimateCredits(goal, level), [goal, level]);
  const minutes = useMemo(() => toMinutes(holdCredits), [holdCredits]);

  const canNext = step === 1 ? !!goal : step === 2 ? !!level : step === 3 ? !!mood : true;

  function next() {
    if (!canNext) return;
    if (step < 4) setStep((s) => (s + 1) as typeof step);
  }

  function back() {
    if (step > 1) setStep((s) => (s - 1) as typeof step);
  }

  function confirm() {
    onConfirm({ goal, level, mood, holdCredits, minutes, autoExtend });
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-orange-100 bg-white p-5 shadow-xl">
        <div className="mb-2 flex items-center justify-between">
          <div>
            <div className="text-base font-semibold text-slate-800">Tell us about your request</div>
            <div className="text-[12px] text-slate-500">This helps your coach prepare.</div>
          </div>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-slate-100"><X className="h-5 w-5 text-slate-500"/></button>
        </div>

        {/* Progress dots */}
        <div className="mb-3 flex items-center gap-2">
          {[1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className={`h-2.5 w-2.5 rounded-full ${i <= step ? "bg-emerald-500" : "bg-slate-200"}`}
            />
          ))}
          <span className="ml-auto text-[12px] text-slate-500">{subject} • {topic}</span>
        </div>

        {/* Step content */}
        {step === 1 && (
          <div>
            <div className="mb-2 text-sm font-semibold text-slate-800">What is your primary goal for today's session?</div>
            <div className="space-y-2">
              {(
                [
                  { k: "solve", l: GOAL_LABEL.solve },
                  { k: "homework", l: GOAL_LABEL.homework },
                  { k: "testprep", l: GOAL_LABEL.testprep },
                  { k: "check", l: GOAL_LABEL.check },
                  { k: "deepen", l: GOAL_LABEL.deepen },
                  { k: "explore", l: GOAL_LABEL.explore },
                  { k: "other", l: GOAL_LABEL.other },
                ] as { k: GoalKey; l: string }[]
              ).map((g) => (
                <label key={g.k} className={`flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2 ${goal === g.k ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}>
                  <span className="text-sm text-slate-700">{g.l}</span>
                  <input type="radio" name="goal" checked={goal === g.k} onChange={() => setGoal(g.k)} />
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="mb-2 text-sm font-semibold text-slate-800">How well do you understand the topic?</div>
            <div className="space-y-2">
              {(
                [
                  { k: "none", l: LEVEL_LABEL.none },
                  { k: "little", l: LEVEL_LABEL.little },
                  { k: "medium", l: LEVEL_LABEL.medium },
                  { k: "well", l: LEVEL_LABEL.well },
                  { k: "perfect", l: LEVEL_LABEL.perfect },
                ] as { k: LevelKey; l: string }[]
              ).map((opt) => (
                <label key={opt.k} className={`flex cursor-pointer items-center justify-between rounded-xl border px-3 py-2 ${level === opt.k ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}>
                  <span className="text-sm text-slate-700">{opt.l}</span>
                  <input type="radio" name="level" checked={level === opt.k} onChange={() => setLevel(opt.k)} />
                </label>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="mb-2 text-sm font-semibold text-slate-800">Overall, how do you feel about this subject?</div>
            <div className="flex items-center justify-between gap-2">
              {(
                [
                  { k: "angry", l: "😣" },
                  { k: "sad", l: "☹️" },
                  { k: "neutral", l: "😐" },
                  { k: "happy", l: "🙂" },
                  { k: "confident", l: "😄" },
                ] as { k: MoodKey; l: string }[]
              ).map((m) => (
                <button
                  key={m.k}
                  onClick={() => setMood(m.k)}
                  className={`flex h-12 w-12 items-center justify-center rounded-xl border text-2xl ${mood === m.k ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
                >
                  <span aria-hidden>{m.l}</span>
                </button>
              ))}
            </div>
            <div className="mt-2 text-[12px] text-slate-500">Mood adjusts tutor tone, not pricing.</div>
          </div>
        )}

        {step === 4 && (
          <div>
            <div className="mb-2 text-sm font-semibold text-slate-800">Recommended time & credit hold</div>
            <ul className="text-sm text-slate-700">
              <li className="flex items-center justify-between"><span>Goal</span><span className="font-medium">{GOAL_LABEL[goal]}</span></li>
              <li className="flex items-center justify-between"><span>Understanding</span><span className="font-medium">{LEVEL_LABEL[level]}</span></li>
              <li className="flex items-center justify-between"><span>Mood</span><span className="font-medium">{MOOD_LABEL[mood]}</span></li>
              <li className="mt-2 flex items-center justify-between text-slate-600"><span>Hold credits (refundable)</span><span className="font-semibold">{holdCredits} cr</span></li>
              <li className="flex items-center justify-between text-slate-600"><span>Estimated time</span><span className="font-semibold">{minutes} min</span></li>
            </ul>
            
            {/* Credit balance check */}
            <div className={`mt-3 rounded-lg p-3 border ${
              creditBalance >= holdCredits 
                ? "bg-emerald-50 border-emerald-200" 
                : "bg-red-50 border-red-200"
            }`}>
              <div className="flex items-center justify-between text-sm">
                <span className={creditBalance >= holdCredits ? "text-emerald-700" : "text-red-700"}>
                  Your balance: <span className="font-medium">{creditBalance} credits</span>
                </span>
                <span className={creditBalance >= holdCredits ? "text-emerald-700" : "text-red-700"}>
                  {creditBalance >= holdCredits ? "✓ Sufficient" : "✗ Insufficient"}
                </span>
              </div>
              {creditBalance < holdCredits && (
                <div className="mt-1 text-xs text-red-600">
                  You need {holdCredits - creditBalance} more credits. <button className="underline hover:no-underline">Top up now</button>
                </div>
              )}
            </div>
            
            <label className="mt-3 inline-flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={autoExtend} onChange={(e) => setAutoExtend(e.target.checked)} />
              Allow auto‑extend up to 30 minutes (we'll ask before adding credits)
            </label>
            <div className="mt-2 rounded-lg bg-orange-50 p-2 text-[12px] text-orange-800 border border-orange-100">Unused minutes are automatically refunded at the end of the session.</div>
          </div>
        )}

        {/* Footer buttons */}
        <div className="mt-4 flex items-center justify-between">
          <button onClick={back} disabled={step === 1} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 disabled:opacity-50">Back</button>
          {step < 4 ? (
            <button onClick={next} disabled={!canNext} className="rounded-full border border-emerald-200 bg-emerald-500 px-4 py-2 text-sm font-medium text-white disabled:opacity-50">Next →</button>
          ) : (
            <button onClick={confirm} className="rounded-full border border-indigo-200 bg-indigo-600 px-4 py-2 text-sm font-medium text-white">Start a chat →</button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---------- Matching Screen Component ---------- //
function MatchingScreen({
  subject,
  topic,
  matchingState,
  timeElapsed,
  onStartSession,
  onAcceptAI,
  onClose,
}: {
  subject: string;
  topic: string;
  matchingState: 'matching' | 'no-tutor' | 'matched';
  timeElapsed: number;
  onStartSession: () => void;
  onAcceptAI: () => void;
  onClose: () => void;
}) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-lg rounded-2xl border border-orange-100 bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-slate-800">Finding Your Tutor</div>
            <div className="text-sm text-slate-500">{subject} • {topic}</div>
          </div>
          <button onClick={onClose} className="rounded-full p-1 hover:bg-slate-100">
            <X className="h-5 w-5 text-slate-500"/>
          </button>
        </div>

        {matchingState === 'matching' && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Searching for Available Tutors...
            </h3>
            <p className="text-gray-600 mb-6">
              We're finding the best tutor for your {topic} session
            </p>
            <div className="flex justify-center items-center space-x-4 mb-6">
              <div className="flex space-x-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"
                    style={{ animationDelay: `${i * 0.2}s` }}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {formatTime(timeElapsed)}
              </span>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-700">
                <strong>Searching criteria:</strong> {topic}, Available now, Qualified tutors
              </p>
            </div>
          </div>
        )}

        {matchingState === 'no-tutor' && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              No Tutors Available Right Now
            </h3>
            <p className="text-gray-600 mb-8">
              All our tutors are currently busy. Would you like to chat with our AI tutor instead?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all"
              >
                Try Again Later
              </button>
              <button
                onClick={onAcceptAI}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all flex items-center space-x-2"
              >
                <Bot className="w-5 h-5" />
                <span>Chat with AI Tutor</span>
              </button>
            </div>
          </div>
        )}

        {matchingState === 'matched' && (
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Tutor Found!
            </h3>
            <p className="text-gray-600 mb-6">
              Dr. Sarah Chen is ready to help you with {topic}
            </p>
            <div className="bg-green-50 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-green-800">Dr. Sarah Chen</p>
                  <p className="text-sm text-green-600">{topic} Expert • 4.9★ Rating</p>
                </div>
              </div>
            </div>
            <button
              onClick={onStartSession}
              className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-green-500/25 transition-all duration-300 flex items-center space-x-2 mx-auto"
            >
              <span>Enter Session</span>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
