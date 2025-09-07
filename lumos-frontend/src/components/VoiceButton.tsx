"use client"

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, Volume2, MessageCircle } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function VoiceButton() {
  const { user, accessToken } = useAuth()
  const [isListening, setIsListening] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [conversation, setConversation] = useState<Array<{type: 'user' | 'ai', text: string}>>([])
  const [emotionalState, setEmotionalState] = useState<string>('neutral')
  const [ttsReady, setTtsReady] = useState(false)
  const [isButtonDisabled, setIsButtonDisabled] = useState(false) // Add debounce state
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const sessionIdRef = useRef<string | null>(null)

  // Initialize TTS on component mount
  useEffect(() => {
    if ('speechSynthesis' in window) {
      console.log('🗣️ TTS available, initializing...');
      
      // Wait for voices to load
      const loadVoices = () => {
        const voices = speechSynthesis.getVoices();
        console.log(`🗣️ Loaded ${voices.length} voices`);
        if (voices.length > 0) {
          setTtsReady(true);
          console.log('✅ TTS ready');
        }
      };
      
      // Try to load voices immediately
      loadVoices();
      
      // Also listen for voices to load
      speechSynthesis.onvoiceschanged = loadVoices;
      
      return () => {
        speechSynthesis.onvoiceschanged = null;
      };
    } else {
      console.log('❌ TTS not available');
    }
  }, []);

  // Helper: get or create persistent sessionId
  function getOrCreateSessionId(): string {
    try {
      const existingSid = localStorage.getItem('lumos_session_id');
      if (!existingSid) {
        const newSid = (typeof crypto !== 'undefined' && (crypto as any).randomUUID)
          ? (crypto as any).randomUUID()
          : `${Date.now()}_${Math.random().toString(36).slice(2)}`;
        localStorage.setItem('lumos_session_id', newSid);
        console.log('🆕 Created new sessionId:', newSid);
        sessionIdRef.current = newSid;
        return newSid;
      } else {
        console.log('🔁 Reusing existing sessionId:', existingSid);
        sessionIdRef.current = existingSid;
        return existingSid;
      }
    } catch (e) {
      console.warn('⚠️ Could not access localStorage for sessionId, falling back');
      const fallbackSid = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
      sessionIdRef.current = fallbackSid;
      return fallbackSid;
    }
  }

  // Cleanup effect to prevent memory leaks and recursion
  useEffect(() => {
    return () => {
      // Cleanup WebSocket connection
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      
      // Cleanup media recorder
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        mediaRecorderRef.current = null;
      }
      
      // Clear audio chunks
      audioChunksRef.current = [];
      
      // Stop any ongoing speech
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }
      
      console.log('🧹 Cleanup completed');
    };
  }, []);

  const startListening = async () => {
    try {
      console.log('🎤 Starting voice recording...');
      
      // Stop any current speech for barge-in capability
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
        console.log('🗣️ Stopped current speech for barge-in');
      }
      
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      console.log('✅ Microphone access granted');
      
      // Connect to WebSocket with better error handling
      const backendUrl = process.env.NODE_ENV === 'development' 
        ? 'ws://localhost:3001' 
        : 'wss://lumos-p0t2.onrender.com'
      const ws = new WebSocket(backendUrl);
      wsRef.current = ws;
      
      ws.onopen = () => {
        setIsConnected(true);
        console.log('✅ Connected to Lumos backend');
        // Ensure we have a persistent session and send it to backend
        const sid = getOrCreateSessionId();
        ws.send(JSON.stringify({ 
          type: 'init_session', 
          sessionId: sid,
          userId: user?.id, // Include user ID for conversation storage
          token: accessToken // Include token for authentication
        }));
        console.log('📨 Sent init_session with sessionId:', sid, 'userId:', user?.id, 'token:', accessToken ? 'present' : 'none');
      };
      
      ws.onclose = (event) => {
        console.log('❌ WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        setIsProcessing(false);
      };
      
      ws.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setIsConnected(false);
        setIsProcessing(false);
      };
      
      ws.onmessage = async (event) => {
        try {
          console.log('📨 Raw WebSocket message received');
          const data = JSON.parse(event.data);
          console.log('📨 Parsed message:', data);
          
          if (data.type === 'session_initialized') {
            // Show personalized greeting on first connect, but only if no conversation exists
            if (data.greeting && conversation.length === 0) {
              setConversation(prev => [...prev, { type: 'ai', text: data.greeting }]);
            }
          } else if (data.type === 'processing_start') {
            console.log('🔄 Processing started');
            setConversation(prev => [...prev, { type: 'ai', text: data.message }]);
          } else if (data.type === 'stream_start') {
            console.log('🌊 Streaming started');
            setConversation(prev => prev.slice(0, -1));
            setConversation(prev => [...prev, { type: 'ai', text: '' }]);
          } else if (data.type === 'stream_chunk') {
            console.log('🌊 Stream chunk received:', data.text);
            // Add streaming text to conversation with error handling
            setConversation(prev => {
              try {
                const newConversation = [...prev];
                const lastMessage = newConversation[newConversation.length - 1];
                if (lastMessage && lastMessage.type === 'ai') {
                  lastMessage.text += data.text + ' ';
                }
                return newConversation;
              } catch (error) {
                console.error('❌ Error updating conversation:', error);
                return prev; // Return previous state if error
              }
            });
            
            // Speak the sentence immediately with simplified TTS
            if (ttsReady && 'speechSynthesis' in window && data.text && data.text.trim()) {
              console.log('🗣️ Speaking chunk:', data.text);
              
              try {
                // Create utterance with simple settings
                const utterance = new SpeechSynthesisUtterance(data.text.trim());
                utterance.rate = 1.0; // Normal speed
                utterance.pitch = 1.0;
                utterance.volume = 0.9; // Slightly louder
                
                // Smart voice selection based on response language
                const voices = speechSynthesis.getVoices();
                console.log('Available voices:', voices.length);
                
                if (voices.length > 0) {
                  // Detect if response contains Chinese characters
                  const hasChinese = /[\u4e00-\u9fff]/.test(data.text);
                  const hasEnglish = /[a-zA-Z]/.test(data.text);
                  
                  let selectedVoice;
                  
                  if (hasChinese) {
                    // Prefer Chinese voices for Chinese text
                    selectedVoice = voices.find(voice => 
                      voice.lang.includes('zh') || voice.lang.includes('cmn')
                    ) || voices.find(voice => 
                      voice.name.toLowerCase().includes('chinese')
                    ) || voices[0];
                    console.log('🗣️ Chinese detected, using Chinese voice');
                  } else if (hasEnglish) {
                    // Use English voice for English text
                    selectedVoice = voices.find(voice => 
                      voice.lang.includes('en')
                    ) || voices[0];
                    console.log('🗣️ English detected, using English voice');
                  } else {
                    // Fallback to first available voice
                    selectedVoice = voices[0];
                    console.log('🗣️ No specific language detected, using default voice');
                  }
                  
                  utterance.voice = selectedVoice;
                  console.log(`🗣️ Using voice: ${selectedVoice.name} (${selectedVoice.lang})`);
                }
                
                // Add event listeners for debugging
                utterance.onstart = () => console.log('🗣️ Speech started');
                utterance.onend = () => console.log('🗣️ Speech ended');
                utterance.onerror = (event) => console.error('🗣️ Speech error:', event);
                
                // Speak the text
                speechSynthesis.speak(utterance);
                console.log('🗣️ Speech synthesis initiated');
                
              } catch (error) {
                console.error('❌ TTS Error:', error);
              }
            } else {
              console.log('⚠️ TTS not ready or no text to speak. TTS ready:', ttsReady, 'Text:', data.text);
            }
          } else if (data.type === 'stream_complete') {
            console.log('✅ Streaming completed');
            // Finalize the conversation with error handling
            setConversation(prev => {
              try {
                const newConversation = [...prev];
                const lastMessage = newConversation[newConversation.length - 1];
                if (lastMessage && lastMessage.type === 'ai') {
                  lastMessage.text = data.full_text;
                }
                return newConversation;
              } catch (error) {
                console.error('❌ Error finalizing conversation:', error);
                return prev;
              }
            });
            
            setEmotionalState(data.emotional_state);
            setIsProcessing(false);
            console.log('✅ Processing completed successfully');
          } else if (data.type === 'ai_response') {
            console.log('🤖 Legacy AI response received');
            // Legacy non-streaming response (fallback)
            setConversation(prev => [...prev, { type: 'ai', text: data.ai_text }]);
            setEmotionalState(data.emotional_state);
            
            // Try to play audio response (but don't fail if it doesn't work)
            try {
              if (data.audio && data.audio.length > 0) {
                console.log('🎵 Playing audio response...');
                const audioBuffer = Buffer.from(data.audio, 'base64');
                const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                const audio = new Audio(audioUrl);
                
                audio.onloadeddata = () => {
                  console.log('✅ Audio loaded successfully');
                };
                
                audio.onerror = (e) => {
                  console.error('❌ Audio playback error:', e);
                };
                
                await audio.play();
                console.log('🎵 Audio playback started');
              } else {
                console.log('⚠️ No audio data received');
              }
              
              // Also try Web Speech API for real text-to-speech
              if ('speechSynthesis' in window && data.ai_text) {
                console.log('🗣️ Using Web Speech API for TTS...');
                
                // Stop any current speech
                speechSynthesis.cancel();
                
                const utterance = new SpeechSynthesisUtterance(data.ai_text);
                utterance.rate = 0.9; // Slightly slower for clarity
                utterance.pitch = 1.0;
                utterance.volume = 0.8;
                
                // Set consistent voice preference with language detection
                const voices = speechSynthesis.getVoices();
                console.log('Available voices:', voices.map(v => `${v.name} (${v.lang})`));
                
                // Detect language and choose appropriate voice
                const hasChinese = /[\u4e00-\u9fff]/.test(data.ai_text);
                const hasEnglish = /[a-zA-Z]/.test(data.ai_text);
                
                let preferredVoice;
                
                if (hasChinese) {
                  // Prefer Chinese voices for Chinese text
                  preferredVoice = voices.find(voice => 
                    voice.lang.includes('zh') || voice.lang.includes('cmn')
                  ) || voices.find(voice => 
                    voice.name.toLowerCase().includes('chinese')
                  ) || voices[0];
                  console.log('🗣️ Chinese detected, using Chinese voice');
                } else if (hasEnglish) {
                  // Use English voice for English text
                  preferredVoice = voices.find(voice => 
                    voice.lang.includes('en') && voice.name.includes('Google') && voice.name.toLowerCase().includes('female')
                  ) || voices.find(voice => 
                    voice.lang.includes('en') && voice.name.includes('Google')
                  ) || voices.find(voice => 
                    voice.lang.includes('en') && voice.name.toLowerCase().includes('female')
                  ) || voices.find(voice => 
                    voice.lang.includes('en')
                  ) || voices[0];
                  console.log('🗣️ English detected, using English voice');
                } else {
                  // Fallback to first available voice
                  preferredVoice = voices[0];
                  console.log('🗣️ No specific language detected, using default voice');
                }
                
                if (preferredVoice) {
                  utterance.voice = preferredVoice;
                  console.log(`🗣️ Using consistent voice: ${preferredVoice.name} (${preferredVoice.lang})`);
                } else {
                  console.log('⚠️ No preferred voice found, using default');
                }
                
                // Ensure voices are loaded
                if (voices.length === 0) {
                  speechSynthesis.onvoiceschanged = () => {
                    const loadedVoices = speechSynthesis.getVoices();
                    const voice = loadedVoices.find(v => v.lang.includes('en')) || loadedVoices[0];
                    if (voice) {
                      utterance.voice = voice;
                      console.log(`🗣️ Using loaded voice: ${voice.name}`);
                    }
                    speechSynthesis.speak(utterance);
                  };
                } else {
                  speechSynthesis.speak(utterance);
                }
                
                console.log('🗣️ Web Speech API TTS started');
              }
            } catch (audioError) {
              console.error('❌ Audio playback failed:', (audioError as Error).message);
            }
            
            setIsProcessing(false);
          } else if (data.type === 'no_speech_detected') {
            console.log('🔇 No speech detected');
            setConversation(prev => [...prev, { type: 'ai', text: data.message }]);
            setIsProcessing(false);
          } else if (data.type === 'error') {
            console.error('❌ Backend error:', data.message);
            setConversation(prev => [...prev, { type: 'ai', text: data.message }]);
            setIsProcessing(false);
          } else {
            console.log('❓ Unknown message type:', data.type);
          }
        } catch (error) {
          console.error('❌ Error parsing WebSocket message:', error);
          console.error('❌ Raw message was:', event.data);
          setIsProcessing(false);
        }
      };
      
      // Set up MediaRecorder with better error handling
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          console.log(`📦 Audio chunk received: ${event.data.size} bytes`);
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onerror = (event) => {
        console.error('❌ MediaRecorder error:', event);
      };
      
      mediaRecorder.start(1000); // Collect data every second
      setIsListening(true);
      console.log('✅ Voice recording started successfully');
      
    } catch (error) {
      console.error('❌ Error starting voice recording:', error);
      alert('Please allow microphone access to talk to Lumos');
    }
  };

  const stopListening = async () => {
    console.log('🛑 Stop listening called');
    
    // Prevent recursive calls
    if (isProcessing) {
      console.log('⚠️ Already processing, ignoring stop request');
      return;
    }
    
    console.log('🛑 Stopping recording...');
    
    // Stop recording first
    if (mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        console.log('✅ Recording stopped successfully');
      } catch (error) {
        console.error('❌ Error stopping recording:', error);
      }
    }
    
    setIsListening(false);
    console.log('🛑 Listening state set to false');
    
    // Process collected audio
    console.log(`📦 Audio chunks to process: ${audioChunksRef.current.length}`);
    console.log(`🔗 WebSocket connected: ${wsRef.current ? 'Yes' : 'No'}`);
    
    if (audioChunksRef.current.length > 0 && wsRef.current) {
      console.log('🔄 Starting audio processing...');
      setIsProcessing(true);
      
      // Add a temporary user message
      setConversation(prev => [...prev, { type: 'user', text: 'Processing...' }]);
      
      try {
        console.log('📦 Combining audio chunks...');
        // Combine audio chunks
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        console.log(`📦 Combined audio size: ${audioBlob.size} bytes`);
        
        // Check audio size before sending
        if (audioBlob.size > 5 * 1024 * 1024) { // 5MB limit
          console.log('⚠️ Audio too large, truncating to prevent processing issues');
          setConversation(prev => {
            const newConversation = [...prev];
            const lastMessage = newConversation[newConversation.length - 1];
            if (lastMessage && lastMessage.type === 'user') {
              lastMessage.text = 'Audio too long, please try a shorter message';
            }
            return newConversation;
          });
          setIsProcessing(false);
          audioChunksRef.current = [];
          return;
        }
        
        console.log('🔄 Converting audio to base64...');
        const arrayBuffer = await audioBlob.arrayBuffer();
        console.log(`📦 ArrayBuffer size: ${arrayBuffer.byteLength} bytes`);
        
        // Fix: Use more memory-efficient base64 conversion
        const uint8Array = new Uint8Array(arrayBuffer);
        const base64Audio = btoa(
          Array.from(uint8Array, byte => String.fromCharCode(byte)).join('')
        );
        console.log(`📦 Base64 audio length: ${base64Audio.length} characters`);
        
        console.log('📤 Sending audio to backend...');
        // Send to backend for processing
        wsRef.current.send(JSON.stringify({
          type: 'process_audio',
          audio: base64Audio,
          userId: user?.id // Include user ID for conversation storage
        }));
        console.log('✅ Audio sent to backend successfully');
        
        // Clear audio chunks
        audioChunksRef.current = [];
        console.log('🧹 Audio chunks cleared');
        
      } catch (error) {
        console.error('❌ Error processing audio:', error);
        console.error('❌ Error details:', {
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : 'No stack trace',
          name: error instanceof Error ? error.name : 'Unknown error'
        });
        setIsProcessing(false);
        // Remove the temporary message on error
        setConversation(prev => prev.slice(0, -1));
      }
    } else {
      // No audio to process, just stop listening
      console.log('⚠️ No audio chunks to process or WebSocket not connected');
      if (audioChunksRef.current.length === 0) {
        console.log('📦 No audio chunks available');
      }
      if (!wsRef.current) {
        console.log('🔗 WebSocket not connected');
      }
    }
  };

  const handleVoiceToggle = () => {
    // Prevent rapid clicking and recursive calls
    if (isButtonDisabled || isProcessing) {
      console.log('⚠️ Button disabled or processing, ignoring toggle request');
      return;
    }
    
    // Debounce the button
    setIsButtonDisabled(true);
    setTimeout(() => setIsButtonDisabled(false), 500); // 500ms debounce
    
    if (isListening) {
      console.log('🛑 Stopping listening...');
      stopListening();
    } else {
      console.log('🎤 Starting listening...');
      startListening();
    }
  };

  const clearConversation = () => {
    setConversation([]);
    if (wsRef.current) {
      wsRef.current.send(JSON.stringify({ 
        type: 'clear_conversation',
        userId: user?.id
      }));
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      
      <Button
        onClick={handleVoiceToggle}
        size="lg"
        disabled={isProcessing || isButtonDisabled}
        className={`
          w-20 h-20 rounded-full transition-all duration-300
          ${isListening 
            ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
            : isProcessing || isButtonDisabled
            ? 'bg-yellow-500 hover:bg-yellow-600'
            : 'bg-blue-500 hover:bg-blue-600'
          }
        `}
      >
        {isListening ? (
          <MicOff className="h-8 w-8" />
        ) : isProcessing ? (
          <MessageCircle className="h-8 w-8" />
        ) : (
          <Mic className="h-8 w-8" />
        )}
      </Button>
      
      <div className="text-center">
        <p className="text-sm text-gray-500">
          {isListening ? 'Listening... Click to stop' : 
           isProcessing ? 'Processing...' : 
           'Click to talk to Lumos'}
        </p>
        {isConnected && (
          <div className="flex items-center justify-center mt-2 text-green-600">
            <Volume2 className="h-4 w-4 mr-1" />
            <span className="text-xs">Connected</span>
          </div>
        )}
        {ttsReady && (
          <div className="flex items-center justify-center mt-1 text-blue-600">
            <Volume2 className="h-4 w-4 mr-1" />
            <span className="text-xs">TTS Ready</span>
          </div>
        )}
      </div>

      {/* Conversation Display */}
      {conversation.length > 0 && (
        <div className="w-full max-w-md mt-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-lg font-semibold text-gray-700">Conversation</h3>
            <Button 
              onClick={clearConversation}
              variant="outline" 
              size="sm"
              className="text-xs"
            >
              Clear
            </Button>
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {conversation.map((msg, index) => (
              <div 
                key={index} 
                className={`p-3 rounded-lg ${
                  msg.type === 'user' 
                    ? 'bg-blue-100 text-blue-800 ml-8' 
                    : 'bg-gray-100 text-gray-800 mr-8'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Emotional State Indicator */}
      {emotionalState !== 'neutral' && (
        <div className="mt-4 p-2 bg-gray-100 rounded-lg">
          <p className="text-xs text-gray-600">
            Detected mood: <span className="font-medium capitalize">{emotionalState}</span>
          </p>
        </div>
      )}
    </div>
  );
}
