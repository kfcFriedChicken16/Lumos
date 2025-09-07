'use client';

import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  BookOpen,
  ShoppingBag,
  Coins,
  Search,
  Filter,
  ExternalLink,
  Star,
  User,
  Plus,
  Tag,
  CheckCircle,
  ChevronDown,
} from "lucide-react";
// Import from existing resources.json file
import resourcesData from '@/data/resources.json';

// ---------------- Types ---------------- //

type Difficulty = "beginner" | "intermediate" | "advanced" | string;
interface VideoItem { title: string; url: string; duration: string; difficulty: Difficulty; source: string; description: string }
interface Topic { name: string; description: string; videos: readonly VideoItem[] }
interface Subject { name: string; icon: string; color: string; description: string; topics: Record<string, Topic> }
interface ResourcesData { subjects: Record<string, Subject> }

// Marketplace types
const LEVELS = ["SPM", "IGCSE", "Form 1", "Form 2", "Form 3", "Form 4", "Form 5", "Uni"] as const;
type Level = typeof LEVELS[number];
const SUBJECTS = [
  "Mathematics",
  "Add Maths",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "BM",
  "Sejarah",
  "Computer Science",
] as const;
type SubjectName = typeof SUBJECTS[number];

type ResourceType = "Video" | "Playlist" | "Article" | "Notes";
interface NoteListing { id: string; title: string; subject: SubjectName; level: Level; priceCredits: number; seller: string; rating: number; downloads: number; tags?: string[] }

const MARKET_SEED: NoteListing[] = [
  { id: "mk1", title: "SPM Add Maths: Differentiation Crash Notes", subject: "Add Maths", level: "Form 4", priceCredits: 18, seller: "Aina K.", rating: 4.8, downloads: 126, tags: ["Calculus", "Examples", "SPM"] },
  { id: "mk2", title: "Physics (IGCSE): Forces & Motion Cheatsheet", subject: "Physics", level: "IGCSE", priceCredits: 15, seller: "Zhi Wei", rating: 4.6, downloads: 92, tags: ["IGCSE", "Formulae"] },
  { id: "mk3", title: "Sejarah SPM: Bab 2–4 High-Yield Notes", subject: "Sejarah", level: "SPM", priceCredits: 10, seller: "Rahman", rating: 4.3, downloads: 210, tags: ["Facts", "Timeline"] },
];

// ---------------- Small UI ---------------- //
function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`rounded-full px-4 py-2 text-sm font-medium transition border ${active ? "bg-orange-500 text-white border-orange-400 shadow" : "bg-white/80 text-slate-700 border-orange-100 hover:bg-white"}`}>{children}</button>
  );
}

function TagPill({ text }: { text: string }) { return <span className="rounded-full border border-orange-100 bg-orange-50 px-2 py-0.5 text-[11px] text-orange-700">#{text}</span>; }

function RatingStars({ value }: { value: number }) { const stars = Array.from({ length: 5 }).map((_, i) => i + 1); return (<div className="flex items-center gap-0.5">{stars.map((n) => (<Star key={n} className={`h-4 w-4 ${value >= n ? "fill-amber-400 text-amber-400" : "text-slate-300"}`} />))}</div>); }

// ---------------- Cards ---------------- //
function VideoCard({ v }: { v: ReturnType<typeof useFlattenedVideos>[number] }) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${v.color} text-white text-lg`}>
            <span className="drop-shadow-sm">{v.icon}</span>
          </div>
          <div>
            <div className="font-semibold text-slate-800">{v.title}</div>
            <div className="text-xs text-slate-500">{v.subjectName} • {v.topicName} • {v.source}</div>
          </div>
        </div>
        <div className="text-right text-xs text-slate-500">
          <span className="rounded-full bg-orange-50 px-2 py-0.5 border border-orange-100 text-orange-700">{v.difficulty}</span>
          <div className="mt-1">{v.duration}</div>
        </div>
      </div>
      <div className="mt-2 text-sm text-slate-600">{v.description}</div>
      <div className="mt-3 flex items-center gap-2">
        <a href={v.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-orange-600">
          <ExternalLink className="h-4 w-4" /> Watch
        </a>
        <span className="text-xs text-slate-500">AI helper stays available while you learn</span>
      </div>
    </motion.div>
  );
}

function NoteCard({ n, onBuy, owned }: { n: NoteListing; onBuy: (n: NoteListing) => void; owned: boolean }) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-orange-600" />
          <div>
            <div className="font-semibold text-slate-800">{n.title}</div>
            <div className="text-xs text-slate-500">{n.subject} • {n.level}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[12px] text-orange-700">
            <Coins className="h-3.5 w-3.5" /> {n.priceCredits}
          </div>
          <div className="mt-1 text-[11px] text-slate-500">{n.downloads.toLocaleString()} downloads</div>
        </div>
      </div>
      {n.tags && n.tags.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <RatingStars value={Math.round(n.rating)} />
          <span className="text-xs text-slate-500">{n.rating.toFixed(1)}</span>
          <span className="text-slate-300">•</span>
          <div className="flex flex-wrap gap-1">{n.tags.map((t) => <TagPill key={t} text={t} />)}</div>
        </div>
      )}
      <div className="mt-3 flex items-center gap-2">
        <button disabled={owned} onClick={() => onBuy(n)} className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition border ${owned ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-orange-500 text-white border-orange-400 hover:bg-orange-600"}`}>
          {owned ? (<><CheckCircle className="h-4 w-4" />Owned</>) : (<><Coins className="h-4 w-4" />Buy</>)}
        </button>
        <div className="flex items-center gap-2 text-xs text-slate-500"><User className="h-4 w-4" /> {n.seller}</div>
      </div>
    </motion.div>
  );
}

// ---------------- Helpers ---------------- //
function useFlattenedVideos(data: ResourcesData) {
  return useMemo(() => {
    const out: Array<{ title: string; url: string; duration: string; difficulty: Difficulty; source: string; description: string; subjectKey: string; subjectName: string; topicKey: string; topicName: string; color: string; icon: string }> = [];
    Object.entries(data.subjects).forEach(([subjectKey, subject]) => {
      Object.entries(subject.topics).forEach(([topicKey, topic]) => {
        topic.videos.forEach((v) => {
          out.push({ ...v, subjectKey, subjectName: subject.name, topicKey, topicName: topic.name, color: subject.color, icon: subject.icon });
        });
      });
    });
    return out;
  }, [data]);
}

// ---------------- Subject Section Component ---------------- //
function SubjectSection({ subjectKey, subject, filteredVideos }: { subjectKey: string; subject: Subject; filteredVideos: ReturnType<typeof useFlattenedVideos> }) {
  const subjectVideos = filteredVideos.filter(v => v.subjectKey === subjectKey);
  
  if (subjectVideos.length === 0) return null;

  return (
    <div className="mb-12">
      {/* Subject Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-3">
          <div className={`w-16 h-16 bg-gradient-to-br ${subject.color} rounded-2xl flex items-center justify-center text-3xl shadow-lg`}>
            {subject.icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{subject.name}</h2>
            <p className="text-gray-600">{subject.description}</p>
          </div>
        </div>
      </div>

      {/* Videos Grid - 3 columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence initial={false}>
          {subjectVideos.map((v) => (
            <VideoCard key={`${v.subjectKey}-${v.topicKey}-${v.url}`} v={v} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ---------------- Main Component ---------------- //
export default function LumosResourcesHubJSON() {
  const [tab, setTab] = useState<"free" | "market" | "sell">("free");
  const [query, setQuery] = useState("");
  const [credits, setCredits] = useState(10);
  const [market, setMarket] = useState<NoteListing[]>(MARKET_SEED);
  const [ownedIds, setOwnedIds] = useState<string[]>([]);
  const [subjectFilter, setSubjectFilter] = useState<string>("all");
  const [topicFilter, setTopicFilter] = useState<string>("all");
  const [difficulty, setDifficulty] = useState<"all" | Difficulty>("all");

  const allVideos = useFlattenedVideos(resourcesData as ResourcesData);

  const subjectOptions = useMemo(() => Object.entries((resourcesData as ResourcesData).subjects).map(([k, s]) => ({ key: k, name: s.name })), []);
  const topicOptions = useMemo(() => {
    if (subjectFilter === "all") return [] as Array<{ key: string; name: string }>;
    const subj = (resourcesData as ResourcesData).subjects[subjectFilter];
    if (!subj) return [];
    return Object.entries(subj.topics).map(([k, t]) => ({ key: k, name: t.name }));
  }, [subjectFilter]);

  const filteredVideos = useMemo(() => {
    const q = query.toLowerCase();
    return allVideos.filter((v) => {
      const matchesText = v.title.toLowerCase().includes(q) || v.description.toLowerCase().includes(q) || v.subjectName.toLowerCase().includes(q) || v.topicName.toLowerCase().includes(q) || v.source.toLowerCase().includes(q);
      const matchesSubject = subjectFilter === "all" || v.subjectKey === subjectFilter;
      const matchesTopic = topicFilter === "all" || v.topicKey === topicFilter;
      const matchesDifficulty = difficulty === "all" || v.difficulty === difficulty;
      return matchesText && matchesSubject && matchesTopic && matchesDifficulty;
    });
  }, [allVideos, query, subjectFilter, topicFilter, difficulty]);

  function handleBuy(n: NoteListing) {
    if (ownedIds.includes(n.id)) return;
    if (credits < n.priceCredits) { alert("Not enough credits — earn via timebank or top up."); return; }
    setCredits((c) => c - n.priceCredits);
    setOwnedIds((ids) => [...ids, n.id]);
    setMarket((items) => items.map((it) => (it.id === n.id ? { ...it, downloads: it.downloads + 1 } : it)));
  }

  function handleListNote(title: string, subject: SubjectName, level: Level, price: number) {
    const newItem: NoteListing = { id: Math.random().toString(36).slice(2, 9), title, subject, level, priceCredits: Math.max(1, Math.round(price)), seller: "You", rating: 5, downloads: 0, tags: ["Student‑made", "Fresh"] };
    setMarket((m) => [newItem, ...m]);
    setTab("market");
  }

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-b from-orange-50 via-yellow-50 to-amber-50 text-slate-700">
      {/* Header */}
      <div className="mx-auto max-w-6xl px-4 py-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-100 bg-white shadow-sm">
              <Sparkles className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <div className="text-lg font-semibold tracking-wide text-orange-700">Lumos Resources Hub</div>
              <div className="text-xs text-slate-500">Official free resources • Student marketplace</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/web/dashboard/student"
              className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs text-orange-700 hover:bg-orange-100 transition-colors"
            >
              ← Back to Dashboard
            </a>

            <div className="flex items-center gap-2 rounded-full border border-orange-100 bg-white/80 px-3 py-1.5 text-xs shadow-sm">
              <Coins className="h-4 w-4 text-orange-500" />
              <span className="font-semibold text-slate-800">{credits}</span>
              <span className="opacity-60">credits</span>
              <button onClick={() => setCredits((c) => c + 20)} className="ml-2 rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-[11px] text-orange-700 hover:bg-orange-100">+20 (demo)</button>
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TabButton active={tab === "free"} onClick={() => setTab("free")}>
              <div className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> Free Resources</div>
            </TabButton>
            <TabButton active={tab === "market"} onClick={() => setTab("market")}>
              <div className="flex items-center gap-2"><ShoppingBag className="h-4 w-4" /> Marketplace</div>
            </TabButton>
            <TabButton active={tab === "sell"} onClick={() => setTab("sell")}>
              <div className="flex items-center gap-2"><Plus className="h-4 w-4" /> List Notes</div>
            </TabButton>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-full border border-orange-100 bg-white/80 px-3 py-1.5 text-sm shadow-sm">
              <Search className="h-4 w-4 text-orange-500" />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search title, description, subject…" className="bg-transparent outline-none placeholder:text-slate-400" />
              <Filter className="h-4 w-4 text-slate-400" />
          </div>
          
            {/* Subject filter */}
            <div className="relative">
              <select value={subjectFilter} onChange={(e) => { setSubjectFilter(e.target.value); setTopicFilter("all"); }} className="rounded-full border border-orange-100 bg-white/80 px-3 py-1.5 text-sm shadow-sm">
                <option value="all">All subjects</option>
                {subjectOptions.map((s) => (<option key={s.key} value={s.key}>{s.name}</option>))}
              </select>
          </div>

            {/* Topic filter (dependent) */}
            <div className="relative">
              <select value={topicFilter} onChange={(e) => setTopicFilter(e.target.value)} disabled={subjectFilter === "all"} className="rounded-full border border-orange-100 bg-white/80 px-3 py-1.5 text-sm shadow-sm disabled:opacity-50">
                <option value="all">All topics</option>
                {topicOptions.map((t) => (<option key={t.key} value={t.key}>{t.name}</option>))}
              </select>
            </div>

            {/* Difficulty */}
            <div className="relative">
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)} className="rounded-full border border-orange-100 bg-white/80 px-3 py-1.5 text-sm shadow-sm">
                <option value="all">All difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
                  </div>
                </div>
                
      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-5">
        {tab === "free" && (
          <motion.div layout>
            <AnimatePresence initial={false}>
              {Object.entries((resourcesData as ResourcesData).subjects).map(([subjectKey, subject]) => (
                <SubjectSection 
                  key={subjectKey} 
                  subjectKey={subjectKey} 
                  subject={subject as Subject} 
                  filteredVideos={filteredVideos} 
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {tab === "market" && (
          <motion.div layout className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence initial={false}>
              {market.map((n) => (<NoteCard key={n.id} n={n} onBuy={handleBuy} owned={ownedIds.includes(n.id)} />))}
            </AnimatePresence>
          </motion.div>
        )}

        {tab === "sell" && <SellForm onCreate={handleListNote} />}
              </div>
            </div>
  );
}

// ---------------- Sell Form ---------------- //
function SellForm({ onCreate }: { onCreate: (title: string, subject: SubjectName, level: Level, price: number) => void }) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState<SubjectName>("Mathematics");
  const [level, setLevel] = useState<Level>("SPM");
  const [price, setPrice] = useState<number>(12);

  return (
    <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
      <div className="mb-3 text-sm font-semibold text-orange-700">Create a listing</div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <div className="text-xs mb-1">Title</div>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., SPM Add Maths: Differentiation Summary" className="w-full rounded-xl border border-orange-100 bg-white/80 px-3 py-2 text-sm outline-none focus:border-orange-300" />
              </div>
        <div>
          <div className="text-xs mb-1">Subject</div>
          <select value={subject} onChange={(e) => setSubject(e.target.value as SubjectName)} className="w-full rounded-xl border border-orange-100 bg-white/80 px-3 py-2 text-sm outline-none focus:border-orange-300">
            {SUBJECTS.map((s) => (<option key={s} value={s}>{s}</option>))}
          </select>
            </div>
        <div>
          <div className="text-xs mb-1">Level</div>
          <select value={level} onChange={(e) => setLevel(e.target.value as Level)} className="w-full rounded-xl border border-orange-100 bg-white/80 px-3 py-2 text-sm outline-none focus:border-orange-300">
            {LEVELS.map((s) => (<option key={s} value={s}>{s}</option>))}
          </select>
              </div>
        <div>
          <div className="text-xs mb-1">Price (credits)</div>
          <input type="number" min={1} value={price} onChange={(e) => setPrice(parseInt(e.target.value || "0", 10))} className="w-full rounded-xl border border-orange-100 bg-white/80 px-3 py-2 text-sm outline-none focus:border-orange-300" />
            </div>
          </div>
      <div className="mt-3 flex items-center gap-2">
        <button onClick={() => title.trim() && onCreate(title.trim(), subject, level, price)} className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-500 px-4 py-2 text-sm font-medium text-white hover:bg-orange-600">
          <Plus className="h-4 w-4" /> List Notes
        </button>
        <span className="text-xs text-slate-500">This is a demo — in production, add moderation and plagiarism checks.</span>
        </div>
      </div>
  );
}
