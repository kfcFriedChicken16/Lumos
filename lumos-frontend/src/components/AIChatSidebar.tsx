'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Clock, Loader2 } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  timestamp: number;
  videoTime?: number;
  confidence?: number;
}

interface AIChatSidebarProps {
  videoTitle?: string;
  currentTime: number;
  duration: number;
  onSeekTo?: (time: number) => void;
  className?: string;
}

export default function AIChatSidebar({
  videoTitle,
  currentTime,
  duration,
  onSeekTo,
  className = ''
}: AIChatSidebarProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Removed auto-scroll functionality - let user control scrolling manually

  // Welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          type: 'ai',
          content: `Hi! I'm your AI learning assistant. I can help you understand this video about "${videoTitle || 'the current topic'}". Ask me anything!`,
          timestamp: Date.now(),
          confidence: 1.0
        }
      ]);
    }
  }, [videoTitle, messages.length]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: Date.now(),
      videoTime: currentTime
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Call our internal API endpoint (which uses private OpenRouter API key)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'openai/gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an educational AI assistant helping students understand video content. Provide clear, helpful explanations and answer questions about the video they are watching.'
            },
            {
              role: 'user',
              content: `I'm watching a video about "${videoTitle || 'a topic'}" and I'm at ${formatTime(currentTime)}. ${inputValue.trim()}`
            }
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const openRouterData = await response.json();
      const aiResponse = openRouterData.choices?.[0]?.message?.content;
      
      if (!aiResponse) {
        throw new Error('No response content from OpenRouter');
      }
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: aiResponse || 'I apologize, but I\'m having trouble processing your request right now.',
        timestamp: Date.now(),
        videoTime: currentTime,
        confidence: 0.85
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI response error:', error);
      
      // Fallback response
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: 'I\'m having trouble connecting right now. Please try again in a moment.',
        timestamp: Date.now(),
        videoTime: currentTime,
        confidence: 0.5
      };

      setMessages(prev => [...prev, aiMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className={`flex flex-col h-[800px] w-[400px] bg-white border-l border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-yellow-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">AI Learning Assistant</h3>
            <p className="text-sm text-gray-600">
              {videoTitle ? `Helping with: ${videoTitle}` : 'Ready to help!'}
            </p>
          </div>
        </div>
        
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>Current: {formatTime(currentTime)} / {formatTime(duration)}</span>
        </div>
      </div>

      {/* Messages */}
      <div className="h-[500px] overflow-y-auto px-4 pt-3 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {message.type === 'ai' && (
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            
            <div className={`max-w-[80%] ${message.type === 'user' ? 'order-1' : 'order-2'}`}>
              <div
                className={`rounded-2xl px-4 py-3 ${
                  message.type === 'user'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
              </div>
            </div>
            
            {message.type === 'user' && (
              <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className="bg-gray-100 rounded-2xl px-4 py-3">
              <div className="flex items-center gap-1">
                <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
                <span className="text-sm text-gray-600">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="mt-auto border-t border-orange-200/60 bg-orange-50/40 px-4 py-3 sticky bottom-0 rounded-t-3xl">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about the video..."
            disabled={isLoading}
            className="w-full rounded-full border border-orange-200 bg-white/90 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-100"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || isLoading}
            className="grid place-items-center h-10 w-10 rounded-full bg-orange-500 text-white hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
