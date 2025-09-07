"use client"

import React, { useEffect, useMemo, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bot,
  Send,
  Paperclip,
  Mic,
  MicOff,
  Timer,
  Zap,
  Languages,
  HeartPulse,
  X,
  FileText,
  Image,
  File,
} from "lucide-react";
import VoiceButton from '@/components/VoiceButton'
import ProtectedRoute from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { usePreferences } from '@/contexts/PreferencesContext'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import PracticePanel from '@/components/PracticePanel';

// Add custom CSS for tight markdown spacing
const markdownStyles = `
  .markdown-tight p:empty, .markdown-tight li:empty { display:none; }
  .markdown-tight > * + * { margin-top: 0.25rem; }
  .katex-display { margin: 0.25rem 0 !important; }
  li .katex-display { margin: 0.125rem 0 !important; display:inline-block; }
`;

/**
 * Lumos Tutor — Chat‑Only Preview (Undraw Education style)
 * -------------------------------------------------------
 * • Chat panel only (resources/sidebars removed)
 * • Soft pastel palette inspired by undraw education illustrations
 * • Micro‑help: hint‑first replies, timebank credits
 * • Lite (low‑data) toggle + language switch (EN/BM/中文)
 * • TailwindCSS + framer‑motion, integrated with existing backend
 */

// --- Language typing helpers (prevents bad casts) ---
const LANG_OPTIONS = ["EN", "BM", "中文"] as const;
type Lang = typeof LANG_OPTIONS[number];

// --- File types and interfaces ---
interface ChatFile {
  id: string;
  file: File;
  name: string;
  type: string;
  size: number;
  content?: string; // For text files
  preview?: string; // For images
}

function isLang(v: string): v is Lang {
  return (LANG_OPTIONS as readonly string[]).includes(v);
}

function getFileIcon(type: string) {
  if (type.startsWith('image/')) return <Image className="w-4 h-4" />;
  if (type.includes('pdf')) return <FileText className="w-4 h-4" />;
  if (type.includes('word') || type.includes('document')) return <FileText className="w-4 h-4" />;
  if (type.includes('text')) return <FileText className="w-4 h-4" />;
  return <File className="w-4 h-4" />;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function Chip({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-orange-100 bg-white/80 px-3 py-1.5 text-xs text-slate-700 shadow-sm">
      <Icon className="h-4 w-4 text-orange-500" />
      <span className="opacity-70">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <button
      onClick={onChange}
      className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs shadow-sm transition ${
        checked
          ? "bg-orange-100 border-orange-200 text-orange-700"
          : "bg-white/80 border-orange-100 text-slate-700"
      }`}
    >
      <span className={`relative inline-block h-4 w-7 rounded-full bg-white/60`}>
        <span
          className={`absolute top-0.5 h-3 w-3 rounded-full transition ${
            checked ? "right-0.5 bg-orange-500" : "left-0.5 bg-slate-400"
          }`}
        />
      </span>
      <span className="font-medium">{label}</span>
    </button>
  );
}

function Bubble({ role, text, files, onTopicSelect, availableTopics, completedTopics, showNextTopicOptions }: { 
  role: "user" | "assistant"; 
  text: string; 
  files?: ChatFile[]; 
  onTopicSelect?: (topic: string) => void; 
  availableTopics?: string[];
  completedTopics?: string[];
  showNextTopicOptions?: boolean;
}) {
  const isUser = role === "user";
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div
          className={`${
            isUser
              ? "bg-gradient-to-r from-orange-400 to-yellow-400 text-white whitespace-pre-wrap"
              : "bg-white text-slate-700 border border-orange-100"
          } max-w-[82%] rounded-2xl px-4 py-3 shadow-sm`}
        >
        {!isUser && (
          <div className="mb-1 flex items-center gap-2 text-xs text-orange-600">
            <Bot className="h-4 w-4" /> Lumos Tutor
          </div>
        )}
        
        {/* Show attached files if any */}
        {files && files.length > 0 && (
          <div className={`mb-2 flex flex-wrap gap-2 ${isUser ? 'text-white/90' : 'text-slate-600'}`}>
            {files.map((file) => (
              <div key={file.id} className={`flex items-center gap-2 px-2 py-1 rounded-lg ${isUser ? 'bg-white/20' : 'bg-gray-100'}`}>
                {getFileIcon(file.type)}
                <span className="text-xs">{file.name}</span>
                <span className="text-xs opacity-70">({formatFileSize(file.size)})</span>
              </div>
            ))}
          </div>
        )}
        
        {!isUser ? (
          <div className="max-w-none">
            {/* Topic Selection Interface - Telegram Bot Style */}
            {text.includes("Choose a Topic to Learn") && onTopicSelect && (
              <div className="space-y-4">
                <div className="text-sm font-semibold text-slate-800 mb-3">🎯 Choose a Topic to Learn</div>
                <div className="text-xs text-slate-600 mb-4">
                  I've analyzed your PDF and found these specific topics. Click any topic to start your guided learning journey:
                </div>
                
                {/* Topic Buttons Grid - Individual buttons for each topic */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableTopics?.map((topic: string, index: number) => (
                    <button
                      key={topic}
                      onClick={() => onTopicSelect(topic)}
                      className="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 rounded-lg transition-all duration-200 group text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-slate-800 group-hover:text-blue-700 text-sm">
                            {topic}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            Click to learn with notes + practice
                          </div>
                        </div>
                        <div className="text-blue-500 group-hover:text-blue-600 text-lg">
                          →
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                
                {/* How it works - Updated for new flow */}
                <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                  <div className="text-sm font-medium text-green-800 mb-3 flex items-center gap-2">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    How the Guided Learning Works:
                  </div>
                  <div className="text-sm text-green-700 space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                      <span>Click a topic → I'll send you detailed notes and explanations</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                      <span>Study the material, then practice with 6 levels of questions</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                      <span>Master all levels, then choose your next topic!</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Next Topic Options Interface - After completing a topic */}
            {showNextTopicOptions && onTopicSelect && availableTopics && (
              <div className="space-y-4">
                <div className="text-sm font-semibold text-slate-800 mb-3">🚀 Choose Your Next Topic</div>
                <div className="text-xs text-slate-600 mb-4">
                  Great job! Select your next learning adventure:
                </div>
                
                {/* Next Topic Buttons Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {availableTopics
                    .filter(topic => !completedTopics?.includes(topic))
                    .map((topic: string, index: number) => (
                    <button
                      key={topic}
                      onClick={() => onTopicSelect(topic)}
                      className="p-3 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border border-green-200 rounded-lg transition-all duration-200 group text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-slate-800 group-hover:text-green-700 text-sm">
                            {topic}
                          </div>
                          <div className="text-xs text-slate-500 mt-1">
                            Click to continue learning
                          </div>
                        </div>
                        <div className="text-green-500 group-hover:text-green-600 text-lg">
                          →
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                
                {/* Completed topics indicator */}
                {completedTopics && completedTopics.length > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-xs font-medium text-blue-800 mb-2">✅ Completed Topics:</div>
                    <div className="text-xs text-blue-700">
                      {completedTopics.join(', ')}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="markdown-tight">
              <ReactMarkdown
                remarkPlugins={[remarkMath]}
                rehypePlugins={[rehypeKatex]}
                components={{
                  h1: ({ children }) => <h1 className="text-base font-bold mt-0 mb-1">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-sm font-semibold mt-0 mb-1">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-sm font-semibold mt-0 mb-0.5">{children}</h3>,

                  // kill paragraph margins
                  p: ({ children }) => <p className="m-0 leading-snug">{children}</p>,

                  // outside bullets, tiny spacing, no inner gaps
                  ul: ({ children }) => <ul className="list-disc list-outside pl-5 my-1 space-y-0">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal list-outside pl-5 my-1 space-y-0">{children}</ol>,
                  li: ({ children }) => <li className="m-0 leading-snug">{children}</li>,

                  strong: ({ children }) => <strong className="font-bold text-slate-800">{children}</strong>,
                  em: ({ children }) => <em className="italic">{children}</em>,
                  code: ({ children }) => <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">{children}</code>,
                  pre: ({ children }) => <pre className="bg-gray-100 p-1.5 rounded text-xs font-mono overflow-x-auto m-0">{children}</pre>,
                }}
              >
                {text}
              </ReactMarkdown>
            </div>
          </div>
        ) : (
          text
        )}
      </div>
    </motion.div>
  );
}

export default function LumosTutorChat() {
  const { user, profile, signOut } = useAuth()
  const { prefs } = usePreferences()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [messages, setMessages] = useState<{
    role: "user" | "assistant";
    text: string;
    files?: ChatFile[];
  }[]>([
    {
      role: "assistant",
      text: prefs ? 
        `Hi! I'm your Lumos tutor, personalized for your ${prefs.year} ${prefs.major} studies at ${prefs.university}. I'll adapt my explanations to your ${prefs.explanationStyle} learning style and ${prefs.responseStyle} communication preference. How can I help you today?` :
        "Hi! I'm your Lumos tutor. I can help with your homework and academic questions. You can also attach files for me to read and analyze!",
    },
  ]);

  const [input, setInput] = useState("");
  const [recording, setRecording] = useState(false);
  const [lite, setLite] = useState(false);
  const [credits, setCredits] = useState(24);
  const [lang, setLang] = useState<Lang>("EN");
  const [mood, setMood] = useState<"great" | "ok" | "stressed">("ok");
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<ChatFile[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [teachingMode, setTeachingMode] = useState(false);
  const [availableTopics, setAvailableTopics] = useState<string[]>([]);
  const [pdfAnalysis, setPdfAnalysis] = useState<string>("");
  const [completedTopics, setCompletedTopics] = useState<string[]>([]);
  const [showNextTopicOptions, setShowNextTopicOptions] = useState(false);

  // Normalize markdown and convert math syntax for remark-math
  function normalizeMarkdown(s: string) {
    return s
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+\n/g, '\n')        // trim trailing spaces
      .replace(/\n{3,}/g, '\n\n')        // collapse big gaps
      // Convert block math \[...\] to $$...$$ (trim inside)
      .replace(/\\\[\s*([\s\S]*?)\s*\\\]/g, (_m, inner) => `$$\n${inner.trim()}\n$$`)
      // Convert inline math \(...\) to $...$ (no surrounding spaces)
      .replace(/\\\(\s*([\s\S]*?)\s*\\\)/g, (_m, inner) => `$${inner.trim()}$`)
      // Safety: remove spaces *right after/before* inline $ delimiters
      .replace(/\$\s+/g, '$')            // "$ P(" -> "$P("
      .replace(/\s+\$/g, '$');           // ") $" -> ")$"
  }

  // Truncate large content to prevent payload size issues
  function excerpt(content: string, maxLength: number = 12000): string {
    if (!content) return "";
    if (content.length <= maxLength) return content;
    
    const head = content.slice(0, 5000);
    const tail = content.slice(-5000);
    const truncated = content.length - 10000;
    
    return `${head}\n\n...[truncated ${truncated} characters]...\n\n${tail}`;
  }

  const placeholder = useMemo(() => {
    if (lang === "BM") return "Tampal soalan anda di sini…";
    if (lang === "中文") return "在这里粘贴你的问题…";
    return "Paste or describe your question…";
  }, [lang]);

  function push(role: "user" | "assistant", text: string, files?: ChatFile[]) {
    setMessages((m) => [...m, { role, text, files }]);
  }

  // Handle topic selection for guided learning (Telegram bot style)
  function handleTopicSelection(topic: string) {
    setSelectedTopic(topic);
    setTeachingMode(true);
    setShowNextTopicOptions(false);
    
    // Auto-send user message (like Telegram bot)
    push("user", `I want to learn about ${topic}`);
    
    // Generate structured response with notes and tutor details
    generateTopicResponse(topic);
  }

  // Handle topic completion and show next topic options
  function handleTopicCompletion(topic: string) {
    if (!completedTopics.includes(topic)) {
      setCompletedTopics(prev => [...prev, topic]);
    }
    
    // Show next topic options
    const remainingTopics = availableTopics.filter(t => !completedTopics.includes(t) && t !== topic);
    
    if (remainingTopics.length > 0) {
      setTimeout(() => {
        setShowNextTopicOptions(true);
        push("assistant", `🎉 **Congratulations!** You've completed **${topic}**!

## 🚀 Ready for the Next Topic?

Great job mastering all 6 levels! Here are your remaining topics to explore:

${remainingTopics.map((t, i) => `${i + 1}. **${t}**`).join('\n')}

**Choose your next learning adventure!** Click any topic below to continue your journey.`);
      }, 1000);
    } else {
      setTimeout(() => {
        push("assistant", `🎉 **Amazing!** You've completed all topics from your PDF!

## 🏆 Learning Journey Complete!

You've successfully mastered:
${availableTopics.map(topic => `✅ **${topic}**`).join('\n')}

**What's next?**
- Upload another PDF to learn new topics
- Review any topic you want to practice more
- Ask me any questions about what you've learned

Great work on your learning journey! 🚀`);
      }, 1000);
    }
  }

  // Generate structured topic response with notes and tutor details
  async function generateTopicResponse(topic: string) {
    try {
      setIsTyping(true);
      
      // Create a structured prompt for the topic
      const topicPrompt = `I want to learn about ${topic}. Please provide:

1. **Study Notes**: Key concepts, definitions, and important points
2. **Tutor Explanation**: Step-by-step explanation with examples
3. **Learning Objectives**: What I should understand after studying this topic
4. **Practice Instructions**: How to use the practice panel effectively

Make it engaging and educational, like a personal tutor explaining the topic.`;

      // Call the LLM to generate structured content
      const { data, error } = await apiClient.generateLLMResponse(topicPrompt, user?.id || undefined, prefs);
      
      if (error) {
        throw new Error(error);
      }
      
      const response = normalizeMarkdown(data.response);
      
      // Add the structured response
      push("assistant", `## 📚 ${topic} - Learning Guide

${response}

---

**🎯 Next Steps:**
1. **Read through the notes above** to understand the concepts
2. **Go to the practice panel** on the right
3. **Start with Level 1** and work your way up to Level 6
4. **Master each level** before moving to the next
5. **Come back here** when you're ready for the next topic!

**Ready to practice?** Click "Start Practice" in the practice panel! 🚀`);
      
    } catch (error) {
      console.error('Error generating topic response:', error);
      push("assistant", `I'll help you learn about **${topic}**! 

## 📚 ${topic} - Learning Guide

Let me explain the key concepts and provide you with study materials.

**Ready to start learning?** Click "Start Practice" in the practice panel when you're ready to test your understanding!`);
    } finally {
      setIsTyping(false);
    }
  }

  // Extract topics from PDF analysis
  function extractTopicsFromResponse(response: string): string[] {
    const topics: string[] = [];
    
    // Look for "Learning Topics" section with more flexible matching
    const topicsMatch = response.match(/Learning Topics[\s\S]*?(?=\n[A-Z][a-z]+\s+Topics|\n[A-Z][a-z]+\s+Questions|\n[A-Z][a-z]+\s+Practice|\n\n|$)/is);
    
    if (topicsMatch) {
      const topicsText = topicsMatch[0];
      
      // Split by lines and extract individual topics
      const lines = topicsText.split('\n');
      
      for (const line of lines) {
        const trimmedLine = line.trim();
        
        // Skip empty lines, headers, and descriptive text
        if (!trimmedLine || 
            trimmedLine.includes('Learning Topics') ||
            trimmedLine.includes('Based on the general structure') ||
            trimmedLine.includes('to be verified') ||
            trimmedLine.includes('might include') ||
            trimmedLine.includes('Prerequisites') ||
            trimmedLine.includes('Difficulty') ||
            trimmedLine.length < 3) {
          continue;
        }
        
        // Clean up the topic name
        let topic = trimmedLine
          .replace(/^[-•*]\s*/, '') // Remove bullet points
          .replace(/^\d+\.\s*/, '') // Remove numbers
          .replace(/^\d+\)\s*/, '') // Remove numbered lists
          .trim();
        
        // Only add if it looks like a real topic (not too short, not descriptive text)
        if (topic.length > 3 && 
            !topic.includes('Based on') && 
            !topic.includes('expected major') &&
            !topic.includes('to be verified') &&
            !topic.includes('might include')) {
          topics.push(topic);
        }
      }
    }
    
    // If no topics found with the above method, try a simpler approach
    if (topics.length === 0) {
      const lines = response.split('\n');
      for (const line of lines) {
        const trimmedLine = line.trim();
        // Look for lines that start with common topic patterns
        if (trimmedLine.match(/^(Introduction to|Installing|Basic|User and|Permissions|Networking|Package|System|Troubleshooting|File Management|Linux Distributions)/i)) {
          topics.push(trimmedLine);
        }
      }
    }
    
    return topics;
  }

  // File handling functions
  const handleFileSelect = async (files: FileList) => {
    const newFiles: ChatFile[] = [];
    
    for (const file of Array.from(files)) {
      const fileId = Math.random().toString(36).substr(2, 9);
      const chatFile: ChatFile = {
        id: fileId,
        file,
        name: file.name,
        type: file.type,
        size: file.size,
      };

      // Process text files
      if (file.type.startsWith('text/') || file.type.includes('pdf') || file.type.includes('word') || file.type.includes('document')) {
        try {
          const text = await readFileAsText(file);
          chatFile.content = text;
        } catch (error) {
          console.error('Error reading file:', error);
        }
      }

      // Process images
      if (file.type.startsWith('image/')) {
        try {
          const preview = await readFileAsDataURL(file);
          chatFile.preview = preview;
        } catch (error) {
          console.error('Error reading image:', error);
        }
      }

      newFiles.push(chatFile);
    }

    setAttachedFiles(prev => [...prev, ...newFiles]);
  };

  const readFileAsText = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (fileId: string) => {
    setAttachedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  async function send() {
    if (!input.trim() && attachedFiles.length === 0) return;
    
    const userMessage = input.trim();
    const filesToSend = [...attachedFiles];
    
    // Add user message with truncation notice if needed
    const hasLargeFiles = filesToSend.some(file => file.content && file.content.length > 12000);
    const userMessageText = userMessage || "Analyze the attached files" + (hasLargeFiles ? " (large files truncated for processing)" : "");
    push("user", userMessageText, attachedFiles);
    
    setInput("");
    setAttachedFiles([]);
    setIsTyping(true);
    
    try {
      // Prepare the message for the backend
      let fullMessage = userMessage;
      
      // Add file contents to the message (with size limits)
      if (filesToSend.length > 0) {
        fullMessage += "\n\nAttached files:\n";
        for (const file of filesToSend) {
          if (file.content) {
            // Use excerpt to prevent payload size issues
            const fileExcerpt = excerpt(file.content);
            fullMessage += `\n--- ${file.name} (excerpt) ---\n${fileExcerpt}\n`;
            
            // Add specific instruction for PDF analysis
            if (file.name.toLowerCase().includes('.pdf')) {
              fullMessage += `\n\nPlease analyze this PDF content and create a structured learning path. Format your response as follows:\n\n`;
              fullMessage += `## Learning Topics\n`;
              fullMessage += `List each major topic/chapter as a separate line, like this:\n`;
              fullMessage += `- Introduction to Linux\n`;
              fullMessage += `- Installing Linux\n`;
              fullMessage += `- Linux Distributions\n`;
              fullMessage += `- Basic Command-Line Usage\n`;
              fullMessage += `- File Management\n`;
              fullMessage += `- User and Group Management\n`;
              fullMessage += `- Permissions and Security\n`;
              fullMessage += `- Networking Basics\n`;
              fullMessage += `- Package Management\n`;
              fullMessage += `- System Administration Basics\n`;
              fullMessage += `- Troubleshooting Common Issues\n\n`;
              fullMessage += `Make sure to:\n`;
              fullMessage += `1. Extract ALL major topics from the actual PDF content\n`;
              fullMessage += `2. List them as individual bullet points\n`;
              fullMessage += `3. Use clear, descriptive topic names\n`;
              fullMessage += `4. Organize them in logical learning order\n`;
            }
          } else if (file.type.startsWith('image/')) {
            fullMessage += `\n--- ${file.name} (Image) ---\n[Image file attached: ${file.name}]\n`;
          }
        }
      }

      // Final payload size check to prevent 413 errors
      const MAX_SEND = 15000; // ~15k chars is safe for most backends
      if (fullMessage.length > MAX_SEND) {
        fullMessage = fullMessage.slice(0, MAX_SEND) + `\n\n...[message truncated due to size]`;
      }

      // Call your real LLM backend using existing apiClient with preferences
      const { data, error } = await apiClient.generateLLMResponse(fullMessage, user?.id || undefined, prefs);
      
      if (error) {
        throw new Error(error);
      }
      
      const response = normalizeMarkdown(data.response);
      push("assistant", response);
      
      // Extract topics from PDF analysis and enable teaching mode
      if (filesToSend.some(file => file.name.toLowerCase().includes('.pdf'))) {
        // Store the PDF analysis for question generation
        setPdfAnalysis(response);
        
        const topics = extractTopicsFromResponse(response);
        if (topics.length > 0) {
          setAvailableTopics(topics);
          setTeachingMode(true);
          
          // Add topic selection message
          setTimeout(() => {
            push("assistant", `## 🎯 Choose a Topic to Learn

I've analyzed your PDF and found **${topics.length} specific topics**. Click on any topic to start your guided learning journey:

${topics.map((topic, index) => `${index + 1}. **${topic}**`).join('\n')}

**How the Guided Learning Works:**
1. **Click a topic** → I'll send you detailed notes and explanations
2. **Study the material**, then practice with 6 levels of questions
3. **Master all levels**, then choose your next topic!

**Ready to start?** Click any topic above to begin! 🚀`);
          }, 1000);
        }
      }
    } catch (error) {
      console.error('Error getting AI response:', error);
      push("assistant", "Sorry, I'm having trouble connecting to my backend right now. Please try again.");
    } finally {
      setIsTyping(false);
    }
  }

  const handleSignOut = async () => {
    try {
      console.log('🚪 Chat: Signing out user...')
      window.location.href = '/'
      await signOut()
      console.log('✅ Chat: User signed out successfully')
    } catch (error) {
      console.error('❌ Chat: Error during signout:', error)
      window.location.href = '/'
    }
  }

  // --- Dev tests (runtime assertions) ---
  useEffect(() => {
    console.assert(isLang("EN"), "EN should be a valid Lang");
    console.assert(!isLang("JP"), "JP should NOT be a valid Lang");
  }, []);

  return (
    <ProtectedRoute requireAuth={true} requireProfile={true}>
      <style dangerouslySetInnerHTML={{ __html: markdownStyles }} />
      <div className="min-h-[100dvh] w-full bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50 text-slate-700">
        {/* Header */}
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex items-center gap-6">
            <button
              onClick={() => router.push('/web/dashboard/student')}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 rounded-full transition-all duration-300 text-sm font-medium"
            >
              ← Back to Dashboard
            </button>
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-orange-100 bg-white shadow-sm">
                <Bot className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <div className="text-xl font-semibold tracking-wide text-orange-700">Lumos Tutor</div>
                <div className="text-sm text-slate-500">
                  {prefs ? 
                    `Personalized for ${prefs.year} ${prefs.major} at ${prefs.university}` :
                    "Micro‑help • Hint‑first • 24/7"
                  }
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="mx-auto max-w-7xl px-4 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chat Panel - 2/3 width */}
            <div className="lg:col-span-2">
              <div className="rounded-3xl border border-orange-100 bg-white/70 p-4 shadow-sm backdrop-blur">
            {/* Mood row */}
            <div className="mb-3 flex items-center gap-2 text-xs">
              <HeartPulse className="h-4 w-4 text-rose-500" />
              <span className="text-slate-600">Mood:</span>
              <button onClick={() => setMood("great")} className={`rounded-full px-2 py-0.5 ${mood === "great" ? "bg-emerald-100 text-emerald-800" : "bg-white border border-slate-200"}`}>Great</button>
              <button onClick={() => setMood("ok")} className={`rounded-full px-2 py-0.5 ${mood === "ok" ? "bg-amber-100 text-amber-800" : "bg-white border border-slate-200"}`}>Okay</button>
              <button onClick={() => setMood("stressed")} className={`rounded-full px-2 py-0.5 ${mood === "stressed" ? "bg-rose-100 text-rose-800" : "bg-white border border-slate-200"}`}>Stressed</button>
              <span className="ml-auto text-[11px] text-slate-500">PDPA: consent & masking on uploads</span>
            </div>

            {/* Messages */}
            <div className="flex h-[62vh] flex-col gap-3 overflow-y-auto pr-1">
              <AnimatePresence initial={false}>
                {messages.map((m, i) => (
                  <Bubble 
                    key={i} 
                    role={m.role} 
                    text={m.text} 
                    files={m.files} 
                    onTopicSelect={handleTopicSelection} 
                    availableTopics={availableTopics}
                    completedTopics={completedTopics}
                    showNextTopicOptions={showNextTopicOptions}
                  />
                ))}
                
                {/* Typing indicator */}
                {isTyping && (
                  <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                    <div className="bg-white text-slate-700 border border-orange-100 max-w-[82%] rounded-2xl px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-2 text-xs text-orange-600 mb-1">
                        <Bot className="h-4 w-4" /> Lumos Tutor
                      </div>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-orange-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* File Preview */}
            {attachedFiles.length > 0 && (
              <div className="mt-3 p-3 bg-orange-50 rounded-xl border border-orange-200">
                <div className="text-xs font-medium text-orange-700 mb-2">Attached Files:</div>
                <div className="flex flex-wrap gap-2">
                  {attachedFiles.map((file) => (
                    <div key={file.id} className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-orange-200">
                      {getFileIcon(file.type)}
                      <div className="text-xs">
                        <div className="font-medium text-slate-700">{file.name}</div>
                        <div className="text-slate-500">{formatFileSize(file.size)}</div>
                      </div>
                      <button
                        onClick={() => removeFile(file.id)}
                        className="ml-2 p-1 hover:bg-red-100 rounded-full transition-colors"
                      >
                        <X className="w-3 h-3 text-red-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Composer */}
            <div className="mt-4 flex flex-col gap-2">
              <div 
                className={`flex items-center gap-2 p-4 border-2 border-dashed rounded-xl transition-colors ${
                  isDragOver 
                    ? 'border-orange-400 bg-orange-50' 
                    : 'border-orange-200 hover:border-orange-300'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <div className="flex items-center gap-2">
                  <label htmlFor="file" className="flex cursor-pointer items-center gap-2 rounded-2xl border border-orange-100 bg-white/80 px-3 py-2 text-slate-600 shadow-sm hover:bg-white hover:border-orange-200 transition-all">
                    <Paperclip className="h-5 w-5 text-slate-500" />
                    <span className="text-xs">Attach Files</span>
                    <input 
                      id="file" 
                      type="file" 
                      multiple
                      accept=".txt,.pdf,.doc,.docx,.png,.jpg,.jpeg"
                      className="hidden" 
                      ref={fileInputRef}
                      onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
                    />
                  </label>
                  <span className="text-xs text-slate-500">or drag & drop files here</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 overflow-hidden rounded-2xl border border-orange-100 bg-white/80 shadow-sm">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        send();
                      }
                    }}
                    placeholder={placeholder}
                    className="w-full bg-transparent px-4 py-3 outline-none placeholder:text-slate-400"
                  />
                </div>
                
                {/* Talk to Lumos Button */}
                {/* <div className="flex items-center gap-2">
                  <VoiceButton />
                  <span className="text-xs text-slate-600">Talk to Lumos</span>
                </div> */}
                
                <button
                  onClick={send}
                  disabled={!input.trim() && attachedFiles.length === 0}
                  className="rounded-2xl border border-orange-200 bg-orange-500 px-4 py-2 font-medium text-white shadow-sm transition hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center gap-2"><Send className="h-5 w-5" /> Send</div>
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>Tip: paste a screenshot or say "explain step 2".</span>
                <span className="ml-auto">Credits: {credits} • Each micro‑help uses ~2–5 min</span>
              </div>
            </div>
          </div>
            </div>

            {/* Practice Panel - 1/3 width */}
            <div className="lg:col-span-1">
              <PracticePanel 
                selectedTopic={selectedTopic}
                teachingMode={teachingMode}
                availableTopics={availableTopics}
                pdfAnalysis={pdfAnalysis}
                onTopicCompletion={handleTopicCompletion}
              />
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
