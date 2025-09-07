// Session Page
"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { 
  ArrowLeft, 
  MessageSquare, 
  Send, 
  Bot, 
  User,
  Phone,
  Video,
  Settings,
  X,
  Palette,
  RotateCcw,
  RotateCw,
  Star,
  Trash2,
  RefreshCw
} from 'lucide-react';

// Dynamically import Whiteboard with SSR disabled
const Whiteboard = dynamic(() => import('../../../components/Whiteboard'), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading whiteboard...</p>
      </div>
    </div>
  )
});

interface Message {
  id: string;
  sender: 'user' | 'bot' | 'tutor';
  text: string;
  timestamp: Date;
  senderName: string;
  senderAvatar?: string;
}

export default function SessionPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'bot',
      text: "Hey! I'm Lumos, your AI assistant. I'm here to help you with your studies! Feel free to ask me anything or work on the whiteboard.",
      timestamp: new Date(),
      senderName: 'Lumos Bot'
    },
    {
      id: '2',
      sender: 'bot',
      text: "You can tell me what you need help with in the chat! You can also write out your problem on the whiteboard.",
      timestamp: new Date(),
      senderName: 'Lumos Bot'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [sessionStatus, setSessionStatus] = useState<'active' | 'ended'>('active');
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: newMessage,
      timestamp: new Date(),
      senderName: profile?.name || user?.email?.split('@')[0] || 'You'
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    // Simulate bot response
    setTimeout(() => {
      const response: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: "Thanks for sharing! I'm here to help you with your math problem. Feel free to work on the whiteboard while we chat!",
        timestamp: new Date(),
        senderName: 'Lumos Bot'
      };
      setMessages(prev => [...prev, response]);
    }, 1000);
  };

  const handleEndSession = () => {
    setShowFeedbackModal(true);
  };

  const handleSubmitFeedback = () => {
    // Here you would typically send the feedback to your backend
    console.log('Rating:', rating, 'Feedback:', feedback);
    
    // Redirect back to seek-help page
    router.push('/web/seek-help');
  };

  const handleSkipFeedback = () => {
    // Redirect back to seek-help page
    router.push('/web/seek-help');
  };

  const handleBackToDashboard = () => {
            router.push('/web/seek-help');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleBackToDashboard}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Seek Help</span>
          </button>
          <div className="h-6 w-px bg-gray-300"></div>
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Lumos</h1>
              <p className="text-sm text-gray-500">Live Tutoring Session</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Phone className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Video className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Content - UPchieve Style Layout */}
      <div className="flex-1 flex">
        {/* Whiteboard Section (Left - 2/3 width) */}
        <div className="flex-1 flex flex-col bg-white">
          {/* Whiteboard Header */}
          <div className="px-4 py-2 border-b border-gray-200 bg-gray-50">
            <h2 className="text-sm font-medium text-gray-700">Interactive Whiteboard</h2>
          </div>
          
          {/* Whiteboard Container */}
          <div className="flex-1 relative h-full">
            <Whiteboard />
          </div>
        </div>

        {/* Chat Section (Right - 1/3 width) */}
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
          {/* Chat Header */}
          <div className={`p-4 border-b border-gray-200 ${
            sessionStatus === 'active' ? 'bg-emerald-500 text-white' : 'bg-gray-100'
          }`}>
            {sessionStatus === 'active' ? (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold">Lumos AI Assistant</h3>
                  <p className="text-sm opacity-90">Ready to help with your studies</p>
                </div>
                <button 
                  onClick={handleEndSession}
                  className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded text-sm font-medium transition-colors"
                >
                  End Session
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-500 rounded-full flex items-center justify-center">
                  <X className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Session Ended</h3>
                  <p className="text-sm opacity-90">Thank you for using Lumos</p>
                </div>
              </div>
            )}
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sender === 'user'
                    ? 'bg-emerald-500 text-white'
                    : message.sender === 'tutor'
                    ? 'bg-blue-100 text-blue-900'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  {message.sender !== 'user' && (
                    <div className="flex items-center space-x-2 mb-1">
                      {message.senderAvatar && (
                        <span className="text-lg">{message.senderAvatar}</span>
                      )}
                      <span className="text-xs font-medium opacity-75">
                        {message.senderName}
                      </span>
                    </div>
                  )}
                  <p className="text-sm">{message.text}</p>
                  <p className="text-xs opacity-75 mt-1">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Message Input */}
          {sessionStatus === 'active' && (
            <div className="p-4 border-t border-gray-200">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <div className="text-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                How was your session?
              </h3>
              <p className="text-gray-600">
                Your feedback helps us improve the tutoring experience
              </p>
            </div>

            {/* Star Rating */}
            <div className="flex justify-center mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 transition-colors"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= rating
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Feedback Text */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional feedback (optional)
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Tell us about your experience..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none h-24"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={handleSkipFeedback}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Skip
              </button>
              <button
                onClick={handleSubmitFeedback}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg hover:from-orange-600 hover:to-yellow-600 transition-all"
              >
                Submit Feedback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
