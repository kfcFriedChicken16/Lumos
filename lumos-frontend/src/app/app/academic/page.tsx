// Academic Test Page
'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, CheckCircle, Copy, Database, Shield, Zap, Calendar, Link, FileText, BarChart3, Globe } from 'lucide-react';

// Creamy yellow background
function DynamicBackground() {
  return (
    <div className="fixed inset-0 z-0 bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50" />
  );
}

  

// Floating particles for ambient animation
function FloatingParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-orange-400/30 rounded-full animate-pulse"
          style={{
            left: `${15 + i * 12}%`,
            top: `${10 + i * 15}%`,
            animationDelay: `${i * 1.2}s`,
            animationDuration: `${6 + i * 2}s`
          }}
        />
      ))}
    </div>
  );
}

// Status Chip Component
function StatusChip({ icon: Icon, label, status }: { icon: any; label: string; status: 'online' | 'offline' | 'warning' }) {
  const colors = {
    online: 'bg-orange-100 border-orange-300 text-orange-700',
    offline: 'bg-red-100 border-red-300 text-red-700',
    warning: 'bg-amber-100 border-amber-300 text-amber-700'
  };
  
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 border rounded-full backdrop-blur-md ${colors[status]} shadow-[0_0_20px_rgba(249,115,22,0.1)]`}>
      <div className={`w-2 h-2 rounded-full ${status === 'online' ? 'bg-orange-400 animate-pulse shadow-[0_0_8px_rgba(249,115,22,0.6)]' : status === 'warning' ? 'bg-amber-400' : 'bg-red-400'}`} />
      <Icon size={12} />
      <span className="text-xs font-medium">{label}</span>
    </div>
  );
}

// Segmented Control Component
function SegmentedControl({ options, value, onChange }: { 
  options: { label: string; value: string }[]; 
  value: string; 
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex bg-white/60 backdrop-blur-md rounded-lg p-1 border border-orange-200">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
            value === option.value
              ? 'bg-orange-400/90 text-black shadow-[0_0_20px_rgba(249,115,22,0.3)]'
              : 'text-slate-600 hover:text-slate-800 hover:bg-white/80'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

// Score Component with Color Bands
function Score({ value }: { value: number }) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: 'bg-orange-500/20', text: 'text-orange-300', bar: 'bg-orange-500', glow: 'shadow-[0_0_20px_rgba(249,115,22,0.4)]' };
    if (score >= 55) return { bg: 'bg-amber-500/20', text: 'text-amber-300', bar: 'bg-amber-500', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]' };
    return { bg: 'bg-red-500/20', text: 'text-red-300', bar: 'bg-red-500', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.4)]' };
  };
  
  const colors = getScoreColor(value);
  
  return (
    <div className="space-y-3">
      <div className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-medium border border-orange-200 ${colors.bg} ${colors.text} ${colors.glow}`}>
        Credibility: {value}/100
      </div>
      <div className="h-3 w-full rounded-full bg-white/10 border border-white/5">
        <div 
          className={`h-3 rounded-full transition-all duration-1000 ${colors.bar} ${colors.glow}`}
          style={{ width: `${Math.min(value, 100)}%` }} 
        />
      </div>
    </div>
  );
}

// Results Panel Component
function ResultsPanel({ result, type }: { result: any; type: 'url' | 'resource' | 'project' | 'plan' }) {
  const [activeTab, setActiveTab] = useState<'summary' | 'json' | 'trace'>('summary');
  
  if (!result) {
    return (
      <div className="rounded-2xl border border-orange-200 bg-black/30 backdrop-blur-xl p-8 text-center shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <BarChart3 className="mx-auto h-12 w-12 text-slate-800/40 mb-4" />
        <p className="text-slate-500">Run an analysis to see results here</p>
      </div>
    );
  }
  
  return (
    <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50 backdrop-blur-xl shadow-[0_0_30px_rgba(249,115,22,0.1)]">
      {/* Tabs */}
      <div className="flex border-b border-orange-200">
        {['summary', 'json', 'trace'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-4 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-orange-400 text-orange-300 shadow-[0_0_10px_rgba(249,115,22,0.3)]'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>
      
      {/* Content */}
      <div className="p-6">
        {activeTab === 'summary' && (
          <div className="space-y-6">
            {type === 'url' && result.success && result.check && (
              <div className="space-y-6">
                {/* URL Credibility Score */}
                <div className="bg-orange-50 rounded-xl border border-orange-200 p-4">
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-orange-400" />
                    Credibility Score
                  </h4>
                  <div className="flex items-center gap-4">
                    <div className={`text-3xl font-bold px-4 py-2 rounded-lg ${
                      result.check.score >= 80 ? 'bg-green-500/20 text-green-400' :
                      result.check.score >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {result.check.score}/100
                    </div>
                    <div className="flex-1">
                      <div className="w-full bg-white/10 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-1000 ${
                            result.check.score >= 80 ? 'bg-green-400' :
                            result.check.score >= 60 ? 'bg-yellow-400' :
                            'bg-red-400'
                          }`}
                          style={{ width: `${result.check.score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div className="bg-orange-50 rounded-xl border border-orange-200 p-4">
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <Database className="h-4 w-4 text-blue-400" />
                    Category
                  </h4>
                  <div className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {result.check.category || 'Unknown'}
                  </div>
                </div>

                {/* Analysis Reasoning */}
                <div className="bg-orange-50 rounded-xl border border-orange-200 p-4">
                  <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4 text-purple-400" />
                    Analysis Reasoning
                  </h4>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    {result.check.reasoning || 'No reasoning provided'}
                  </p>
                </div>

                {/* URL Analyzed */}
                {result.check.url && (
                  <div className="bg-orange-50 rounded-xl border border-orange-200 p-4">
                    <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <Link className="h-4 w-4 text-orange-400" />
                      URL Analyzed
                    </h4>
                    <p className="text-orange-400 text-sm font-mono bg-orange-500/10 rounded-lg p-3 break-all border border-orange-500/20">
                      {result.check.url}
                    </p>
                  </div>
                )}
              </div>
            )}
            
            {type === 'resource' && result.success && result.analysis && (
              <div className="space-y-6">
                {/* Credibility Score */}
                {result.analysis.credibility && (
                  <div className="bg-orange-50 rounded-xl border border-orange-200 p-4">
                    <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-orange-400" />
                      Credibility Assessment
                    </h4>
                    <div className="flex items-center gap-4">
                      <div className={`text-2xl font-bold px-4 py-2 rounded-lg ${
                        result.analysis.credibility === 'high' ? 'bg-green-500/20 text-green-400' :
                        result.analysis.credibility === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {result.analysis.credibility.toUpperCase()}
                      </div>
                    </div>
                  </div>
                )}

                {/* Reasoning */}
                {result.analysis.reasoning && (
                  <div className="bg-orange-50 rounded-xl border border-orange-200 p-4">
                    <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-blue-400" />
                      Analysis Reasoning
                    </h4>
                    <p className="text-slate-600 text-sm leading-relaxed">
                      {result.analysis.reasoning}
                    </p>
                  </div>
                )}

                {/* Key Points */}
                {result.analysis.key_points && result.analysis.key_points.length > 0 && (
                  <div className="bg-orange-50 rounded-xl border border-orange-200 p-4">
                    <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      Key Points
                    </h4>
                    <ul className="space-y-3">
                      {result.analysis.key_points.map((point: string, i: number) => (
                        <li key={i} className="text-slate-600 text-sm flex items-start gap-3 bg-green-500/10 rounded-lg p-3">
                          <div className="h-2 w-2 rounded-full bg-green-400 mt-2 flex-shrink-0" />
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Potential Issues */}
                {result.analysis.potential_issues && result.analysis.potential_issues.length > 0 && (
                  <div className="bg-orange-50 rounded-xl border border-orange-200 p-4">
                    <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-yellow-400" />
                      Potential Issues
                    </h4>
                    <ul className="space-y-3">
                      {result.analysis.potential_issues.map((issue: string, i: number) => (
                        <li key={i} className="text-slate-600 text-sm flex items-start gap-3 bg-yellow-500/10 rounded-lg p-3">
                          <div className="h-2 w-2 rounded-full bg-yellow-400 mt-2 flex-shrink-0" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Suggestions */}
                {result.analysis.suggestions && result.analysis.suggestions.length > 0 && (
                  <div className="bg-orange-50 rounded-xl border border-orange-200 p-4">
                    <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                      <Zap className="h-4 w-4 text-purple-400" />
                      Suggestions
                    </h4>
                    <ul className="space-y-3">
                      {result.analysis.suggestions.map((suggestion: string, i: number) => (
                        <li key={i} className="text-slate-600 text-sm flex items-start gap-3 bg-purple-500/10 rounded-lg p-3">
                          <div className="h-2 w-2 rounded-full bg-purple-400 mt-2 flex-shrink-0" />
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
            
            {/* Error State */}
            {!result.success && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <h4 className="font-semibold text-red-400 mb-2 flex items-center gap-2">
                  <div className="h-4 w-4 rounded-full bg-red-400" />
                  Error
                </h4>
                <p className="text-red-300 text-sm">{result.error || 'An unknown error occurred'}</p>
              </div>
            )}
            
            {/* Empty State */}
            {result.success && !result.check && !result.data && !result.analysis && (
              <div className="text-center py-12 text-slate-500">
                <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No analysis data available to display</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'json' && (
          <div className="relative">
            <button
              onClick={() => navigator.clipboard.writeText(JSON.stringify(result, null, 2))}
              className="absolute top-2 right-2 p-2 text-neutral-500 hover:text-neutral-700 transition-colors z-10"
            >
              <Copy size={16} />
            </button>
            <pre className="bg-neutral-50 rounded-lg p-4 text-xs max-h-96 overflow-y-auto whitespace-pre-wrap break-words">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
        
        {activeTab === 'trace' && (
          <div className="text-neutral-600 text-sm">
            <p>Debug information and trace logs would appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AcademicTestPage() {
  const { user, accessToken } = useAuth();
  const router = useRouter();
  
  // Form states
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: '',
    subject: '',
    due_date: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    estimated_hours: 0
  });
  
  const [resourceForm, setResourceForm] = useState({
    content: '',
    context: '',
    sourceUrl: '',
    useCase: 'general_info' as 'vendor_announcement' | 'technical_doc' | 'academic_evidence' | 'news_reporting' | 'general_info'
  });
  
  const [urlForm, setUrlForm] = useState({
    url: ''
  });
  
  // Response states
  const [projectResponse, setProjectResponse] = useState<any>(null);
  const [resourceResponse, setResourceResponse] = useState<any>(null);
  const [urlResponse, setUrlResponse] = useState<any>(null);
  
  // Loading states
  const [loading, setLoading] = useState({
    project: false,
    resource: false,
    url: false,
  });

  // Active tab state for forms
  const [activeFormTab, setActiveFormTab] = useState<'projects' | 'analyzer' | 'resources'>('projects');

  // API call helper
  const apiCall = async (endpoint: string, method: string = 'GET', body?: any) => {
    if (!accessToken) {
      throw new Error('No access token available - please log in again');
    }
    
    const backendUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3001' 
      : 'https://lumos-p0t2.onrender.com'
    const response = await fetch(`${backendUrl}/api/academic${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: body ? JSON.stringify(body) : undefined
    });
    
    const result = await response.json();
    
    // Handle expired token
    if (result.error && result.message && result.message.includes('expired')) {
      alert('Your session has expired. Please log in again.');
      // Detect if mobile
      const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
      router.push(isMobile ? '/m/login' : '/web/login');
      return;
    }
    
    return result;
  };

  // Create Academic Project
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, project: true }));
    
    try {
      const result = await apiCall('/projects', 'POST', projectForm);
      setProjectResponse(result);
      setUrlResponse(null); // Clear other results when creating project
      setResourceResponse(null);
    } catch (error) {
      setProjectResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
    
    setLoading(prev => ({ ...prev, project: false }));
  };

  // Analyze Resource
  const handleAnalyzeResource = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, resource: true }));
    
    try {
      const result = await apiCall('/analyze-resource', 'POST', resourceForm);
      setResourceResponse(result);
      setUrlResponse(null); // Clear URL result when analyzing resource
    } catch (error) {
      setResourceResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
    
    setLoading(prev => ({ ...prev, resource: false }));
  };

    // Check URL
  const handleCheckUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(prev => ({ ...prev, url: true }));
    
    try {
      const result = await apiCall('/quick-check-url', 'POST', { 
        url: urlForm.url,
        analyzeContent: true
      });
      setUrlResponse(result);
      setResourceResponse(null); // Clear resource result when analyzing URL
    } catch (error) {
      setUrlResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
    
    setLoading(prev => ({ ...prev, url: false }));
  };

  // Use case options for segmented control
  const useCaseOptions = [
    { label: 'General', value: 'general_info' },
    { label: 'Vendor', value: 'vendor_announcement' },
    { label: 'Technical', value: 'technical_doc' },
    { label: 'Academic', value: 'academic_evidence' },
    { label: 'News', value: 'news_reporting' },
  ];

  return (
    <ProtectedRoute requireAuth={true} requireProfile={true}>
      <div className="min-h-screen relative overflow-hidden">
        {/* Dynamic Background */}
        <DynamicBackground />
        
        {/* Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.02] z-[5]"
          style={{
            backgroundImage: "linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
        
        {/* Floating Particles */}
        <FloatingParticles />

        {/* Header */}
        <header className="relative z-20 bg-white/80 backdrop-blur-xl border-b border-orange-200 shadow-[0_0_30px_rgba(249,115,22,0.1)]">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => router.push('/web/dashboard/student')}
                  className="flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors"
                >
                  <ArrowLeft size={20} />
                  Back to Dashbaord
                </button>
                <div className="h-6 w-px bg-slate-300" />
                <h1 className="text-xl font-semibold text-slate-800 flex items-center gap-2">
                  🎓 Academic Lab
                </h1>
              </div>
              
              {/* Status Chips */}
              <div className="flex items-center gap-3">
                <StatusChip icon={Database} label="Supabase Connected" status="online" />
                <StatusChip icon={Shield} label="RLS On" status="online" />
                <StatusChip icon={Zap} label="LLM Online" status="online" />
              </div>
            </div>
            
            {/* Use Case Segmented Control */}
            <div className="mt-4 flex items-center gap-4">
              <span className="text-sm text-slate-600">Use Case:</span>
              <SegmentedControl 
                options={useCaseOptions}
                value={resourceForm.useCase}
                onChange={(value) => setResourceForm(prev => ({ ...prev, useCase: value as any }))}
              />
            </div>
          </div>
        </header>

        {/* Main Content - Tabbed Layout */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
          {/* Tab Navigation */}
          <div className="mb-8">
            <div className="flex items-center gap-1 bg-white/80 backdrop-blur-xl rounded-2xl p-2 border border-orange-200 w-fit">
              {[
                { id: 'projects', label: 'Projects', icon: Calendar },
                { id: 'analyzer', label: 'Analyzer', icon: Link },
                { id: 'resources', label: 'Resources', icon: FileText }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveFormTab(id as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activeFormTab === id
                      ? 'bg-orange-500/20 text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.3)] border border-orange-500/30'
                      : 'text-slate-600 hover:text-slate-800 hover:bg-white/60'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-5 gap-8">
            {/* Left Column - Active Form (40%) */}
            <div className="col-span-2">
              <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50 backdrop-blur-xl shadow-[0_0_30px_rgba(249,115,22,0.1)] p-6 h-fit">
                {/* Create Academic Project Form */}
                {activeFormTab === 'projects' && (
                  <>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                      Create Academic Project
                    </h3>
                    <form onSubmit={handleCreateProject} className="space-y-4">
                      <div>
                        <label className="block text-sm text-slate-700 mb-1 font-medium">Project Title</label>
                        <Input
                          placeholder="e.g., Research Paper on AI Ethics"
                          value={projectForm.title}
                          onChange={(e) => setProjectForm(prev => ({ ...prev, title: e.target.value }))}
                          required
                          className="bg-white border-orange-200 text-slate-800 placeholder:text-slate-400 focus:border-orange-400/50 focus:ring-orange-400/20"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm text-slate-700 mb-1 font-medium">Description</label>
                        <Textarea
                          placeholder="Brief project description..."
                          value={projectForm.description}
                          onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                          className="bg-white border-orange-200 text-slate-800 placeholder:text-slate-400 focus:border-orange-400/50 focus:ring-orange-400/20 resize-none h-20 overflow-y-auto"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-slate-700 mb-1 font-medium">Subject</label>
                          <Input
                            placeholder="e.g., Computer Science"
                            value={projectForm.subject}
                            onChange={(e) => setProjectForm(prev => ({ ...prev, subject: e.target.value }))}
                            className="bg-white border-orange-200 text-slate-800 placeholder:text-slate-400 focus:border-orange-400/50 focus:ring-orange-400/20"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm text-slate-700 mb-1 font-medium">Priority</label>
                          <select
                            value={projectForm.priority}
                            onChange={(e) => setProjectForm(prev => ({ ...prev, priority: e.target.value as any }))}
                            className="w-full px-3 py-2 border border-white/20 rounded-md bg-white/10 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 text-sm"
                          >
                            <option value="low" className="bg-gray-800 text-slate-800">Low</option>
                            <option value="medium" className="bg-gray-800 text-slate-800">Medium</option>
                            <option value="high" className="bg-gray-800 text-slate-800">High</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-slate-700 mb-1 font-medium">Due Date</label>
                          <input
                            type="datetime-local"
                            value={projectForm.due_date}
                            onChange={(e) => setProjectForm(prev => ({ ...prev, due_date: e.target.value }))}
                            className="w-full px-3 py-2 border border-white/20 rounded-md bg-white/10 text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-400/50 focus:border-orange-400/50 text-sm"
                            min={new Date().toISOString().slice(0, 16)}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm text-slate-700 mb-1 font-medium">Estimated Hours</label>
                          <Input
                            type="number"
                            placeholder="20"
                            value={projectForm.estimated_hours}
                            onChange={(e) => setProjectForm(prev => ({ ...prev, estimated_hours: parseInt(e.target.value) || 0 }))}
                            min="1"
                            className="bg-white border-orange-200 text-slate-800 placeholder:text-slate-400 focus:border-orange-400/50 focus:ring-orange-400/20"
                          />
                        </div>
                      </div>
                      
                      <Button type="submit" disabled={loading.project} className="w-full bg-orange-600 hover:bg-orange-700 shadow-[0_0_20px_rgba(249,115,22,0.3)] border-orange-500/50">
                        {loading.project ? 'Creating...' : 'Create Project'}
                      </Button>
                    </form>
                  </>
                )}

                {/* AI URL Analyzer Form */}
                {activeFormTab === 'analyzer' && (
                  <>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <Link className="h-5 w-5 text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                      AI URL Analyzer
                    </h3>
                    <form onSubmit={handleCheckUrl} className="space-y-4">
                      <div>
                        <label className="block text-sm text-slate-700 mb-1 font-medium">URL to Analyze</label>
                        <Input
                          placeholder="https://example.com/article"
                          value={urlForm.url}
                          onChange={(e) => setUrlForm(prev => ({ ...prev, url: e.target.value }))}
                          required
                          className="bg-white border-orange-200 text-slate-800 placeholder:text-slate-400 focus:border-blue-400/50 focus:ring-blue-400/20"
                        />
                      </div>
                      
                      <Button type="submit" disabled={loading.url} className="w-full bg-blue-600 hover:bg-blue-700 shadow-[0_0_20px_rgba(59,130,246,0.3)] border-blue-500/50">
                        {loading.url ? 'Analyzing...' : 'Analyze URL'}
                      </Button>
                    </form>
                  </>
                )}

                {/* Analyze Resource Form */}
                {activeFormTab === 'resources' && (
                  <>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                      Analyze Resource
                    </h3>
                    <form onSubmit={handleAnalyzeResource} className="space-y-4">
                      <div>
                        <label className="block text-sm text-slate-700 mb-1 font-medium">Content</label>
                        <Textarea
                          placeholder="Paste article text or content here..."
                          value={resourceForm.content}
                          onChange={(e) => setResourceForm(prev => ({ ...prev, content: e.target.value }))}
                          required
                          rows={4}
                          className="bg-white border-orange-200 text-slate-800 placeholder:text-slate-400 focus:border-orange-400/50 focus:ring-orange-400/20 resize-none h-32 overflow-y-auto"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm text-slate-700 mb-1 font-medium">Source URL</label>
                          <Input
                            placeholder="https://source.com"
                            value={resourceForm.sourceUrl}
                            onChange={(e) => setResourceForm(prev => ({ ...prev, sourceUrl: e.target.value }))}
                            className="bg-white border-orange-200 text-slate-800 placeholder:text-slate-400 focus:border-orange-400/50 focus:ring-orange-400/20"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm text-slate-700 mb-1 font-medium">Context</label>
                          <Input
                            placeholder="e.g., Climate change assignment"
                            value={resourceForm.context}
                            onChange={(e) => setResourceForm(prev => ({ ...prev, context: e.target.value }))}
                            className="bg-white border-orange-200 text-slate-800 placeholder:text-slate-400 focus:border-orange-400/50 focus:ring-orange-400/20"
                          />
                        </div>
                      </div>
                      
                      <Button type="submit" disabled={loading.resource} className="w-full bg-orange-600 hover:bg-orange-700 shadow-[0_0_20px_rgba(249,115,22,0.3)] border-orange-500/50">
                        {loading.resource ? 'Analyzing...' : 'Analyze Resource'}
                      </Button>
                    </form>
                  </>
                )}
              </div>
            </div>
            
            {/* Right Column - Results Panel (60%) */}
            <div className="col-span-3 space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                  Analysis Results
                </h2>
                
                {/* Show Resource Response */}
                {resourceResponse && (
                  <div>
                    <h4 className="text-slate-600 text-sm font-medium mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-orange-400" />
                      Resource Analysis
                    </h4>
                    <ResultsPanel result={resourceResponse} type="resource" />
                  </div>
                )}
                
                {/* Show URL Response */}
                {urlResponse && (
                  <div>
                    <h4 className="text-slate-600 text-sm font-medium mb-3 flex items-center gap-2">
                      <Globe className="h-4 w-4 text-blue-400" />
                      URL Analysis
                    </h4>
                    <ResultsPanel result={urlResponse} type="url" />
                  </div>
                )}

                {/* Show Project Response */}
                {projectResponse && (
                  <div>
                    <h4 className="text-slate-600 text-sm font-medium mb-3 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-orange-400" />
                      Project Created
                    </h4>
                    <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50 backdrop-blur-xl shadow-[0_0_30px_rgba(249,115,22,0.1)] p-6">
                      {projectResponse.success ? (
                        <div className="space-y-4">
                          <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                            <h4 className="font-semibold text-green-400 mb-2 flex items-center gap-2">
                              <CheckCircle className="h-4 w-4" />
                              Project Created Successfully
                            </h4>
                            <p className="text-green-300 text-sm">Your academic project has been saved and is ready for tracking.</p>
                          </div>
                          {projectResponse.data && (
                            <div className="bg-orange-50 rounded-xl p-4">
                              <h5 className="text-slate-800 font-medium mb-2">Project Details:</h5>
                              <div className="space-y-2 text-sm text-slate-600">
                                <p><span className="text-slate-500">Title:</span> {projectResponse.data.title}</p>
                                <p><span className="text-slate-500">Subject:</span> {projectResponse.data.subject}</p>
                                <p><span className="text-slate-500">Priority:</span> <span className={`px-2 py-1 rounded text-xs ${
                                  projectResponse.data.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                                  projectResponse.data.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                  'bg-green-500/20 text-green-400'
                                }`}>{projectResponse.data.priority.toUpperCase()}</span></p>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                          <h4 className="font-semibold text-red-400 mb-2">Error Creating Project</h4>
                          <p className="text-red-300 text-sm">{projectResponse.error || 'An unknown error occurred'}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Show empty state if no results */}
                {!resourceResponse && !urlResponse && !projectResponse && (
                  <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50 backdrop-blur-xl shadow-[0_0_30px_rgba(249,115,22,0.1)] p-16 text-center">
                    <div className="w-20 h-20 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6">
                      <BarChart3 className="h-10 w-10 text-white" />
                    </div>
                    <h3 className="text-xl font-medium mb-3 text-slate-800">Ready for Analysis</h3>
                    <p className="text-sm text-slate-600">Select a tool from the tabs above and submit your analysis</p>
                  </div>
                )}
              </div>
              
              {/* History Panel */}
              <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50 backdrop-blur-xl shadow-[0_0_30px_rgba(249,115,22,0.1)] p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <Database className="h-5 w-5 text-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                  Analysis History
                </h3>
                <div className="space-y-2 text-sm text-slate-500">
                  <p>Previous analysis results will appear here...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}