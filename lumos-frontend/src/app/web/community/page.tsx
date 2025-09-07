"use client";

import React, { useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  MessageCircle,
  Share2,
  Bookmark,
  BookmarkCheck,
  ArrowBigUp,
  ArrowBigDown,
  Send,
  Image as ImageIcon,
  Flag,
  CheckCircle,
  Tag,
  ArrowLeft,
} from "lucide-react";

/**
 * Lumos Community — Reddit Style (Tabs)
 * ------------------------------------
 * Tab 1: Feed (Reddit-like posts w/ actions, comments)
 * Tab 2: Ask (compose a question, attach images)
 * Pastel, undraw-style. Pure client preview.
 */

// ---------- Types ---------- //
const SUBJECTS: Record<string, string[]> = {
  Mathematics: ["Algebra", "Calculus", "Geometry"],
  Science: ["Physics", "Chemistry"],
  English: ["Grammar"],
  Sejarah: ["Bab 3", "Bab 4"],
  "Computer Science": ["Programming", "Data Basics"],
};

type PostId = string;
interface Answer { id: string; author: string; avatar?: string; text: string; images: string[]; createdAt: number; score: number; isAccepted?: boolean; }
interface Post {
  id: PostId;
  author: string;
  avatar?: string;
  subject: string;
  topic: string;
  title: string;
  body: string;
  images: string[];
  tags: string[];
  createdAt: number;
  score: number;
  saved?: boolean;
  answers: Answer[];
}

// ---------- Utils ---------- //
const now = () => Date.now();
const uid = () => Math.random().toString(36).slice(2, 9);
function timeAgo(ts: number): string {
  const diff = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diff < 60) return `${diff}s ago`;
  const m = Math.floor(diff / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}
async function readFilesAsDataURLs(files: FileList): Promise<string[]> {
  const readers = Array.from(files).map(
    (f) =>
      new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve(String(r.result || ""));
        r.onerror = reject;
        r.readAsDataURL(f);
      })
  );
  return Promise.all(readers);
}

// ---------- Seed ---------- //
const SEED: Post[] = [
  {
    id: uid(),
    author: "Aina",
    avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=Aina",
    subject: "Mathematics",
    topic: "Algebra",
    title: "How to factorise 2x^2 − 7x − 4 fast for exam?",
    body: "I tried splitting the middle term and got stuck. Any quick method?",
    images: [],
    tags: ["SPM", "Add Maths"],
    createdAt: now() - 1000 * 60 * 40,
    score: 27,
    answers: [
      { id: uid(), author: "Rahman", avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=Rahman", text: "Use AC method: 2×(−4)=−8. Pick −8 and +1 → 2x^2 − 8x + x − 4 = (x − 4)(2x + 1).", images: [], createdAt: now() - 1000 * 60 * 20, score: 9, isAccepted: true },
    ],
  },
  {
    id: uid(),
    author: "Zhi Wei",
    avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=Zhi",
    subject: "Science",
    topic: "Physics",
    title: "Newton's 3rd law example?",
    body: "Need an everyday example I can explain in 1 line.",
    images: [],
    tags: ["SPM", "Forces"],
    createdAt: now() - 1000 * 60 * 120,
    score: 11,
    answers: [],
  },
];

// ---------- Small UI primitives ---------- //
function Pill({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-orange-100 bg-orange-50 px-2 py-0.5 text-[11px] text-orange-700">{children}</span>;
}
function ImageThumb({ src, onRemove }: { src: string; onRemove?: () => void }) {
  return (
    <div className="relative h-20 w-28 overflow-hidden rounded-lg border border-orange-100">
      <img src={src} alt="preview" className="h-full w-full object-cover" />
      {onRemove && (
        <button onClick={onRemove} className="absolute right-1 top-1 rounded-full bg-white/90 p-0.5 shadow"><span className="sr-only">Remove</span><svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-rose-600"><path fill="currentColor" d="M18 6L6 18M6 6l12 12"/></svg></button>
      )}
    </div>
  );
}

// ---------- Composer (Ask tab) ---------- //
function AskComposer({ onPost }:{ onPost:(p: Omit<Post,'id'|'score'|'createdAt'|'answers'|'saved'|'author'|'avatar'> & {author:string; avatar?:string})=>void }){
  const subjectKeys = Object.keys(SUBJECTS);
  const [subject, setSubject] = useState(subjectKeys[0]);
  const [topic, setTopic] = useState(SUBJECTS[subjectKeys[0]][0]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [consented, setConsented] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function onFiles(e: React.ChangeEvent<HTMLInputElement>){
    const fl = e.target.files; if(!fl||!fl.length) return; const data = await readFilesAsDataURLs(fl);
    setImages((prev)=>[...data, ...prev].slice(0,6)); if(fileRef.current) fileRef.current.value = "";
  }
  function addTag(){ const t = tagInput.trim(); if(!t) return; if(!tags.includes(t)) setTags([...tags, t]); setTagInput(""); }
  function removeTag(t:string){ setTags(tags.filter(x=>x!==t)); }
  function submit(){ if(!consented){ alert('Please confirm PDPA consent'); return;} if(!title.trim()||!body.trim()) return; onPost({author:'You', avatar:'https://api.dicebear.com/7.x/thumbs/svg?seed=You', subject, topic, title: title.trim(), body: body.trim(), images, tags}); setTitle(""); setBody(""); setImages([]); setTags([]); setTagInput(""); }

  return (
    <div className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
      <div className="mb-3 text-sm font-semibold text-orange-700">Create a post</div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div>
          <div className="text-xs mb-1">Subject</div>
          <select value={subject} onChange={(e)=>{ const s=e.target.value; setSubject(s); setTopic(SUBJECTS[s][0]); }} className="w-full rounded-xl border border-orange-100 bg-white/80 px-3 py-2 text-sm outline-none">
            {subjectKeys.map(s=> <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <div className="text-xs mb-1">Topic</div>
          <select value={topic} onChange={(e)=>setTopic(e.target.value)} className="w-full rounded-xl border border-orange-100 bg-white/80 px-3 py-2 text-sm outline-none">
            {SUBJECTS[subject].map(t=> <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div className="mt-3">
        <div className="text-xs mb-1">Title</div>
        <input value={title} onChange={(e)=>setTitle(e.target.value)} placeholder="e.g., How to factorise 2x^2 − 7x − 4 quickly?" className="w-full rounded-xl border border-orange-100 bg-white/80 px-3 py-2 text-sm outline-none"/>
      </div>
      <div className="mt-3">
        <div className="text-xs mb-1">Body</div>
        <textarea value={body} onChange={(e)=>setBody(e.target.value)} placeholder="Explain what you tried (no personal info)." className="min-h-[120px] w-full rounded-xl border border-orange-100 bg-white/80 px-3 py-2 text-sm outline-none"/>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <div className="text-xs">Tags</div>
        <div className="flex-1 flex items-center gap-2 rounded-full border border-orange-100 bg-white/80 px-3 py-1.5 text-sm shadow-sm">
          <Tag className="h-4 w-4 text-orange-500"/>
          <input value={tagInput} onChange={(e)=>setTagInput(e.target.value)} onKeyDown={(e)=>{ if(e.key==='Enter'){e.preventDefault(); addTag();}}} placeholder="SPM, Form 4, proof…" className="bg-transparent outline-none"/>
        </div>
        <button onClick={addTag} className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-medium text-orange-700">Add</button>
      </div>
      {tags.length>0 && (
        <div className="mt-2 flex flex-wrap gap-2">{tags.map(t=> <Pill key={t}>#{t}</Pill>)}</div>
      )}
      <div className="mt-3">
        <div className="text-xs mb-1">Images (optional)</div>
        <div className="flex items-center gap-2">
          <label className="flex cursor-pointer items-center gap-2 rounded-2xl border border-orange-100 bg-white/80 px-3 py-2 text-slate-600 shadow-sm">
            <ImageIcon className="h-5 w-5 text-slate-500"/>
            <span className="text-xs">Attach</span>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={onFiles}/>
          </label>
          <span className="text-xs text-slate-500">Max 6 images. Mask names/faces.</span>
        </div>
        {images.length>0 && (
          <div className="mt-2 flex flex-wrap gap-2">{images.map((src,i)=> <ImageThumb key={i} src={src} onRemove={()=>setImages(images.filter((_,idx)=>idx!==i))}/>)}</div>
        )}
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <label className="text-xs text-slate-600"><input type="checkbox" checked={consented} onChange={(e)=>setConsented(e.target.checked)} className="mr-2"/>I agree to PDPA policy and will mask personal info</label>
        <button onClick={submit} disabled={!title.trim()||!body.trim()} className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-500 px-4 py-2 text-sm font-medium text-white shadow-sm disabled:opacity-50"><Send className="h-4 w-4"/> Post</button>
      </div>
    </div>
  );
}

// ---------- Post Card (Reddit-like) ---------- //
function PostCard({ post, onVote, onToggleSave, onReport, onAddAnswer, onAccept }:{ post: Post; onVote:(id:PostId,delta:1|-1)=>void; onToggleSave:(id:PostId)=>void; onReport:(id:PostId)=>void; onAddAnswer:(id:PostId,text:string)=>void; onAccept:(id:PostId, answerId:string)=>void; }){
  const [open, setOpen] = useState(false);
  const [ansText, setAnsText] = useState("");
  const isAnswered = post.answers.some(a=>a.isAccepted);

  function submitAns(){ if(!ansText.trim()) return; onAddAnswer(post.id, ansText.trim()); setAnsText(""); setOpen(true); }

  return (
    <motion.div layout initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} className="rounded-2xl border border-orange-100 bg-white p-4 shadow-sm">
      <div className="flex gap-3">
        {/* Vote bar */}
        <div className="flex flex-col items-center gap-1 text-slate-500">
          <button onClick={()=>onVote(post.id, +1 as 1)} className="hover:text-orange-600"><ArrowBigUp className="h-6 w-6"/></button>
          <div className="text-sm font-semibold text-slate-700">{post.score}</div>
          <button onClick={()=>onVote(post.id, -1 as -1)} className="hover:text-rose-600"><ArrowBigDown className="h-6 w-6"/></button>
        </div>

        {/* Main */}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[12px] text-slate-500">
              <Pill>{post.subject}</Pill>
              <span>• {post.topic}</span>
              <span>• posted by <span className="font-medium text-slate-700">{post.author}</span> {timeAgo(post.createdAt)}</span>
              {isAnswered && <span className="inline-flex items-center gap-1 text-emerald-700 ml-1"><CheckCircle className="h-3.5 w-3.5"/>Accepted</span>}
            </div>
            <button onClick={()=>onReport(post.id)} title="Report" className="rounded-full border border-rose-200 bg-rose-50 p-1 text-rose-700"><Flag className="h-4 w-4"/></button>
          </div>

          <div className="mt-1 text-base font-semibold text-slate-800">{post.title}</div>
          <div className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{post.body}</div>

          {post.images.length>0 && (
            <div className="mt-2 grid grid-cols-2 gap-2 md:grid-cols-3">
              {post.images.map((src,i)=> (
                <div key={i} className="overflow-hidden rounded-lg border border-orange-100"><img src={src} alt="attachment" className="h-28 w-full object-cover"/></div>
              ))}
            </div>
          )}

          {post.tags.length>0 && (
            <div className="mt-2 flex flex-wrap gap-2">{post.tags.map(t=> <Pill key={t}>#{t}</Pill>)}</div>
          )}

          {/* Action bar */}
          <div className="mt-3 flex items-center gap-2 text-sm">
            <button onClick={()=>setOpen(o=>!o)} className="inline-flex items-center gap-1 rounded-full border border-orange-100 bg-white px-3 py-1.5 text-slate-700"><MessageCircle className="h-4 w-4"/>{post.answers.length} Comments</button>
            <button onClick={()=>alert('Share link copied (demo)')} className="inline-flex items-center gap-1 rounded-full border border-orange-100 bg-white px-3 py-1.5 text-slate-700"><Share2 className="h-4 w-4"/>Share</button>
            <button onClick={()=>onToggleSave(post.id)} className="inline-flex items-center gap-1 rounded-full border border-orange-100 bg-white px-3 py-1.5 text-slate-700">{post.saved? <><BookmarkCheck className="h-4 w-4"/>Saved</> : <><Bookmark className="h-4 w-4"/>Save</>}</button>
          </div>

          {/* Comments */}
          <AnimatePresence initial={false}>
            {open && (
              <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} exit={{opacity:0,y:6}} className="mt-3 space-y-2">
                {/* Existing answers */}
                {post.answers.map(a=> (
                  <div key={a.id} className={`rounded-xl border ${a.isAccepted? 'border-emerald-200 bg-emerald-50':'border-orange-100 bg-white/70'} p-3`}>
                    <div className="flex items-center justify-between">
                      <div className="text-[12px] text-slate-500">by <span className="font-medium text-slate-700">{a.author}</span> • {timeAgo(a.createdAt)}</div>
                      {a.isAccepted && <span className="inline-flex items-center gap-1 text-emerald-700 text-[12px]"><CheckCircle className="h-4 w-4"/>Accepted</span>}
                    </div>
                    <div className="mt-1 text-sm text-slate-700 whitespace-pre-wrap">{a.text}</div>
                    {a.images.length>0 && (
                      <div className="mt-2 flex flex-wrap gap-2">{a.images.map((src,i)=> <ImageThumb key={i} src={src}/>)}</div>
                    )}
                    {!a.isAccepted && (<button onClick={()=>onAccept(post.id, a.id)} className="mt-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700">Mark accepted (OP only)</button>)}
                  </div>
                ))}

                {/* Answer box */}
                <div className="rounded-xl border border-orange-100 bg-white/70 p-3">
                  <div className="text-xs mb-1">Add a comment / answer</div>
                  <textarea value={ansText} onChange={(e)=>setAnsText(e.target.value)} placeholder="Explain your steps or give a hint (no personal info)." className="min-h-[80px] w-full rounded-xl border border-orange-100 bg-white/80 px-3 py-2 text-sm outline-none"/>
                  <div className="mt-2 flex items-center justify-end">
                    <button onClick={submitAns} className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-500 px-3 py-1.5 text-xs font-medium text-white"><Send className="h-4 w-4"/>Post</button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

// ---------- Main Page ---------- //
export default function LumosCommunityRedditTabs(){
  const [tab, setTab] = useState<'feed'|'ask'|'my-questions'>('feed');
  const [posts, setPosts] = useState<Post[]>(SEED);
  const [subjectFilter, setSubjectFilter] = useState<'all'|keyof typeof SUBJECTS>('all');
  const [topicFilter, setTopicFilter] = useState<'all'|string>('all');
  const [sort, setSort] = useState<'hot'|'new'|'top'>('hot');
  const [query, setQuery] = useState('');

  const subjectKeys = Object.keys(SUBJECTS) as (keyof typeof SUBJECTS)[];
  const topicOptions = useMemo(()=> subjectFilter==='all'? [] : SUBJECTS[subjectFilter], [subjectFilter]);

  // derived feed
  const feed = useMemo(()=>{
    const q = query.toLowerCase();
    let list = posts.filter(p=>{
      const text = (p.title + ' ' + p.body + ' ' + p.tags.join(' ')).toLowerCase();
      const okText = text.includes(q);
      const okSubject = subjectFilter==='all' || p.subject === subjectFilter;
      const okTopic = topicFilter==='all' || p.topic === topicFilter;
      return okText && okSubject && okTopic;
    });
    if(sort==='new') list.sort((a,b)=> b.createdAt - a.createdAt);
    else if(sort==='top') list.sort((a,b)=> b.score - a.score);
    else { // hot: simple score/time hybrid
      list.sort((a,b)=> (b.score/(1+((Date.now()-b.createdAt)/36e5))) - (a.score/(1+((Date.now()-a.createdAt)/36e5))));
    }
    return list;
  }, [posts, subjectFilter, topicFilter, sort, query]);

  // derived my questions
  const myQuestions = useMemo(()=>{
    const q = query.toLowerCase();
    let list = posts.filter(p=>{
      const text = (p.title + ' ' + p.body + ' ' + p.tags.join(' ')).toLowerCase();
      const okText = text.includes(q);
      const okSubject = subjectFilter==='all' || p.subject === subjectFilter;
      const okTopic = topicFilter==='all' || p.topic === topicFilter;
      const isMyPost = p.author === 'You'; // Filter for current user's posts
      return okText && okSubject && okTopic && isMyPost;
    });
    if(sort==='new') list.sort((a,b)=> b.createdAt - a.createdAt);
    else if(sort==='top') list.sort((a,b)=> b.score - a.score);
    else { // hot: simple score/time hybrid
      list.sort((a,b)=> (b.score/(1+((Date.now()-b.createdAt)/36e5))) - (a.score/(1+((Date.now()-a.createdAt)/36e5))));
    }
    return list;
  }, [posts, subjectFilter, topicFilter, sort, query]);

  // actions
  function vote(id:PostId, delta:1|-1){ setPosts(arr=> arr.map(p=> p.id===id? {...p, score: Math.max(0, p.score + delta)}: p)); }
  function toggleSave(id:PostId){ setPosts(arr=> arr.map(p=> p.id===id? {...p, saved: !p.saved} : p)); }
  function report(id:PostId){ alert('Thanks for reporting. We will review this.'); }
  function addAnswer(id:PostId, text:string){ const ans:Answer={ id:uid(), author:'You', avatar:'https://api.dicebear.com/7.x/thumbs/svg?seed=You', text, images:[], createdAt: now(), score:0 }; setPosts(arr=> arr.map(p=> p.id===id? {...p, answers:[...p.answers, ans]}: p)); }
  function accept(id:PostId, answerId:string){ setPosts(arr=> arr.map(p=> p.id===id? {...p, answers: p.answers.map(a=> ({...a, isAccepted: a.id===answerId}))}: p)); }
  function createPost(input: Omit<Post,'id'|'score'|'createdAt'|'answers'|'saved'>){ setPosts(prev=> [{...input, id:uid(), score:0, createdAt: now(), answers:[]}, ...prev]); setTab('feed'); }

  return (
    <div className="min-h-[100dvh] w-full bg-gradient-to-b from-orange-50 via-yellow-50 to-amber-50 text-slate-700">
      {/* Header */}
      <div className="mx-auto max-w-6xl px-4 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => window.history.back()} 
              className="flex items-center gap-2 rounded-full border border-orange-100 bg-white px-3 py-2 text-sm font-medium text-orange-700 shadow-sm hover:bg-orange-50 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-100 bg-white shadow-sm"><Users className="h-5 w-5 text-orange-600"/></div>
            <div>
              <div className="text-lg font-semibold tracking-wide text-orange-700">Lumos Community</div>
              <div className="text-xs text-slate-500">Reddit-style Q&A for students</div>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex items-center gap-2">
            <button onClick={()=>setTab('feed')} className={`rounded-full px-4 py-2 text-sm font-medium border ${tab==='feed'? 'bg-orange-500 text-white border-orange-400 shadow':'bg-white/80 text-slate-700 border-orange-100'}`}>Feed</button>
            <button onClick={()=>setTab('ask')} className={`rounded-full px-4 py-2 text-sm font-medium border ${tab==='ask'? 'bg-orange-500 text-white border-orange-400 shadow':'bg-white/80 text-slate-700 border-orange-100'}`}>Ask</button>
            <button onClick={()=>setTab('my-questions')} className={`rounded-full px-4 py-2 text-sm font-medium border ${tab==='my-questions'? 'bg-orange-500 text-white border-orange-400 shadow':'bg-white/80 text-slate-700 border-orange-100'}`}>My Questions</button>
          </div>
        </div>
      </div>

      {tab==='feed' && (
        <div className="mx-auto max-w-6xl px-4 pb-10">
          {/* Toolbar */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 rounded-full border border-orange-100 bg-white/80 px-3 py-1.5 text-sm shadow-sm">
              <Search className="h-4 w-4 text-orange-500"/>
              <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search posts or tags…" className="bg-transparent outline-none placeholder:text-slate-400"/>
            </div>
            <div className="flex items-center gap-2">
              <select value={subjectFilter} onChange={(e)=>{ const v = e.target.value as 'all'|keyof typeof SUBJECTS; setSubjectFilter(v); setTopicFilter('all'); }} className="rounded-full border border-orange-100 bg-white/80 px-3 py-1.5 text-sm shadow-sm">
                <option value="all">All subjects</option>
                {subjectKeys.map(s=> <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={topicFilter} onChange={(e)=> setTopicFilter(e.target.value as any)} disabled={subjectFilter==='all'} className="rounded-full border border-orange-100 bg-white/80 px-3 py-1.5 text-sm shadow-sm disabled:opacity-50">
                <option value="all">All topics</option>
                {topicOptions.map(t=> <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={sort} onChange={(e)=> setSort(e.target.value as any)} className="rounded-full border border-orange-100 bg-white/80 px-3 py-1.5 text-sm shadow-sm">
                <option value="hot">Hot</option>
                <option value="new">New</option>
                <option value="top">Top</option>
              </select>
            </div>
          </div>

          {/* Feed */}
          <div className="space-y-3">
            {feed.map(p=> (
              <PostCard key={p.id} post={p} onVote={vote} onToggleSave={toggleSave} onReport={report} onAddAnswer={addAnswer} onAccept={accept}/>
            ))}
            {feed.length===0 && (
              <div className="rounded-2xl border border-orange-100 bg-white p-6 text-center text-sm text-slate-600">No posts match your filters.</div>
            )}
          </div>
        </div>
      )}

      {tab==='ask' && (
        <div className="mx-auto max-w-3xl px-4 pb-10">
          <AskComposer onPost={(p)=> createPost({ ...p })}/>
          <div className="mt-2 rounded-xl border border-orange-100 bg-orange-50 p-3 text-xs text-slate-600">PDPA: Only upload study content. Remove names/faces and personal data.</div>
        </div>
      )}

      {tab==='my-questions' && (
        <div className="mx-auto max-w-6xl px-4 pb-10">
          {/* Toolbar */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 rounded-full border border-orange-100 bg-white/80 px-3 py-1.5 text-sm shadow-sm">
              <Search className="h-4 w-4 text-orange-500"/>
              <input value={query} onChange={(e)=>setQuery(e.target.value)} placeholder="Search your questions…" className="bg-transparent outline-none placeholder:text-slate-400"/>
            </div>
            <div className="flex items-center gap-2">
              <select value={subjectFilter} onChange={(e)=>{ const v = e.target.value as 'all'|keyof typeof SUBJECTS; setSubjectFilter(v); setTopicFilter('all'); }} className="rounded-full border border-orange-100 bg-white/80 px-3 py-1.5 text-sm shadow-sm">
                <option value="all">All subjects</option>
                {subjectKeys.map(s=> <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={topicFilter} onChange={(e)=> setTopicFilter(e.target.value as any)} disabled={subjectFilter==='all'} className="rounded-full border border-orange-100 bg-white/80 px-3 py-1.5 text-sm shadow-sm disabled:opacity-50">
                <option value="all">All topics</option>
                {topicOptions.map(t=> <option key={t} value={t}>{t}</option>)}
              </select>
              <select value={sort} onChange={(e)=> setSort(e.target.value as any)} className="rounded-full border border-orange-100 bg-white/80 px-3 py-1.5 text-sm shadow-sm">
                <option value="hot">Hot</option>
                <option value="new">New</option>
                <option value="top">Top</option>
              </select>
            </div>
          </div>

          {/* My Questions */}
          <div className="space-y-3">
            {myQuestions.map(p=> (
              <PostCard key={p.id} post={p} onVote={vote} onToggleSave={toggleSave} onReport={report} onAddAnswer={addAnswer} onAccept={accept}/>
            ))}
            {myQuestions.length===0 && (
              <div className="rounded-2xl border border-orange-100 bg-white p-6 text-center text-sm text-slate-600">
                <div className="mb-2 text-lg font-medium text-orange-700">No questions yet</div>
                <div className="text-slate-500">You haven't asked any questions yet. Click the "Ask" tab to create your first post!</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
