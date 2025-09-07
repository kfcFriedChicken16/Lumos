"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  Trash2,
  RefreshCw
} from 'lucide-react';

// Dynamically import Whiteboard with SSR disabled
const Whiteboard = dynamic(() => import('../../../components/Whiteboard'), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto mb-2"></div>
        <p className="text-gray-600 text-sm">Loading whiteboard...</p>
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

export default function MobileSessionPage() {
  const { user, profile } = useAuth();
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
  const [activeTab, setActiveTab] = useState<'whiteboard' | 'chat'>('whiteboard');

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
    setSessionStatus('ended');
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      sender: 'bot',
      text: "Session ended. Thank you for using Lumos!",
      timestamp: new Date(),
      senderName: 'Lumos Bot'
    }]);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Back</span>
          </button>
          <div className="h-6 w-px bg-gray-300"></div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">L</span>
            </div>
            <div>
              <h1 className="text-sm font-semibold text-gray-900">Lumos</h1>
              <p className="text-xs text-gray-500">Tutoring Session</p>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
            <Phone className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
            <Video className="w-4 h-4" />
          </button>
          <button className="p-1.5 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors">
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="flex">
          <button
            onClick={() => setActiveTab('whiteboard')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'whiteboard'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Whiteboard
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'chat'
                ? 'text-emerald-600 border-b-2 border-emerald-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Chat
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {activeTab === 'whiteboard' ? (
          /* Whiteboard Tab */
          <div className="flex-1 flex flex-col bg-white">
            {/* Whiteboard Header */}
            <div className="px-3 py-2 border-b border-gray-200 bg-gray-50">
              <h2 className="text-xs font-medium text-gray-700">Interactive Whiteboard</h2>
            </div>
            
            {/* Whiteboard Container */}
            <div className="flex-1 relative h-full">
              <Whiteboard />
            </div>
          </div>
        ) : (
          /* Chat Tab */
          <div className="flex-1 flex flex-col bg-white">
            {/* Chat Header */}
            <div className={`p-3 border-b border-gray-200 ${
              sessionStatus === 'active' ? 'bg-emerald-500 text-white' : 'bg-gray-100'
            }`}>
              {sessionStatus === 'active' ? (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold">Lumos AI Assistant</h3>
                    <p className="text-xs opacity-90">Ready to help with your studies</p>
                  </div>
                  <button 
                    onClick={handleEndSession}
                    className="px-2 py-1 bg-white/20 hover:bg-white/30 rounded text-xs font-medium transition-colors"
                  >
                    End Session
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                    <X className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold">Session Ended</h3>
                    <p className="text-xs opacity-90">Thank you for using Lumos</p>
                  </div>
                </div>
              )}
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[80%] px-3 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-emerald-500 text-white'
                      : message.sender === 'tutor'
                      ? 'bg-blue-100 text-blue-900'
                      : 'bg-gray-100 text-gray-900'
                  }`}>
                    {message.sender !== 'user' && (
                      <div className="flex items-center space-x-1 mb-1">
                        {message.senderAvatar && (
                          <span className="text-sm">{message.senderAvatar}</span>
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
              <div className="p-3 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
                    className="px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
