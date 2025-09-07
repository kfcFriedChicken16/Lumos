'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react';

interface VideoPlayerProps {
  youtubeId: string;
  title?: string;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  onStateChange?: (state: number) => void;
  startTime?: number;
  endTime?: number;
  autoplay?: boolean;
  className?: string;
}

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function VideoPlayer({
  youtubeId,
  title,
  onTimeUpdate,
  onStateChange,
  startTime = 0,
  endTime,
  autoplay = false,
  className = ''
}: VideoPlayerProps) {
  const playerRef = useRef<HTMLDivElement>(null);
  const playerInstanceRef = useRef<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize YouTube API
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = initializePlayer;
    } else {
      initializePlayer();
    }

    return () => {
      if (playerInstanceRef.current) {
        playerInstanceRef.current.destroy();
      }
    };
  }, []);

  const initializePlayer = useCallback(() => {
    if (!playerRef.current || !window.YT) return;

    try {
      playerInstanceRef.current = new window.YT.Player(playerRef.current, {
        height: '100%',
        width: '100%',
        videoId: youtubeId,
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          start: startTime,
          end: endTime,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          controls: 0, // We'll use custom controls
          iv_load_policy: 3,
          fs: 0, // Disable fullscreen button
        },
        events: {
          onReady: onPlayerReady,
          onStateChange: onPlayerStateChange,
          onError: onPlayerError,
        },
      });
    } catch (err) {
      setError('Failed to load video player');
      console.error('Player initialization error:', err);
    }
  }, [youtubeId, autoplay, startTime, endTime]);

  const onPlayerReady = useCallback((event: any) => {
    setIsLoading(false);
    setDuration(event.target.getDuration());
    if (startTime > 0) {
      event.target.seekTo(startTime);
    }
  }, [startTime]);

  const onPlayerStateChange = useCallback((event: any) => {
    const state = event.data;
    onStateChange?.(state);

    switch (state) {
      case window.YT.PlayerState.PLAYING:
        setIsPlaying(true);
        break;
      case window.YT.PlayerState.PAUSED:
      case window.YT.PlayerState.ENDED:
        setIsPlaying(false);
        break;
    }
  }, [onStateChange]);

  const onPlayerError = useCallback((event: any) => {
    setError('Video playback error');
    console.error('Player error:', event.data);
  }, []);

  // Update time tracking
  useEffect(() => {
    if (!playerInstanceRef.current || !isPlaying) return;

    const interval = setInterval(() => {
      try {
        const currentTime = playerInstanceRef.current.getCurrentTime();
        const duration = playerInstanceRef.current.getDuration();
        setCurrentTime(currentTime);
        setDuration(duration);
        onTimeUpdate?.(currentTime, duration);
      } catch (err) {
        console.error('Time update error:', err);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying, onTimeUpdate]);

  // Control functions
  const togglePlay = useCallback(() => {
    if (!playerInstanceRef.current) return;
    
    if (isPlaying) {
      playerInstanceRef.current.pauseVideo();
    } else {
      playerInstanceRef.current.playVideo();
    }
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    if (!playerInstanceRef.current) return;
    
    if (isMuted) {
      playerInstanceRef.current.unMute();
      setIsMuted(false);
    } else {
      playerInstanceRef.current.mute();
      setIsMuted(true);
    }
  }, [isMuted]);

  const setVolumeLevel = useCallback((newVolume: number) => {
    if (!playerInstanceRef.current) return;
    
    playerInstanceRef.current.setVolume(newVolume);
    setVolume(newVolume);
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  }, [isMuted]);

  const seekTo = useCallback((time: number) => {
    if (!playerInstanceRef.current) return;
    playerInstanceRef.current.seekTo(time);
  }, []);

  const toggleFullscreen = useCallback(() => {
    if (!playerRef.current) return;
    
    if (!isFullscreen) {
      if (playerRef.current.requestFullscreen) {
        playerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  const restart = useCallback(() => {
    if (!playerInstanceRef.current) return;
    playerInstanceRef.current.seekTo(startTime);
    playerInstanceRef.current.playVideo();
  }, [startTime]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (error) {
    return (
      <div className={`bg-gray-100 rounded-lg p-8 text-center ${className}`}>
        <div className="text-red-500 mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Video Unavailable</h3>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className={`relative bg-black rounded-lg overflow-hidden ${className}`}>
      {/* Video Container */}
      <div className="relative aspect-video">
        <div ref={playerRef} className="w-full h-full" />
        
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p>Loading video...</p>
            </div>
          </div>
        )}

        {/* Custom Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
          {/* Progress Bar */}
          <div className="mb-3">
            <div className="w-full bg-white/30 rounded-full h-1 cursor-pointer" onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const clickX = e.clientX - rect.left;
              const percentage = clickX / rect.width;
              seekTo(percentage * duration);
            }}>
              <div 
                className="bg-orange-500 h-1 rounded-full transition-all"
                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Control Buttons */}
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlay}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>

              <button
                onClick={toggleMute}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>

              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolumeLevel(Number(e.target.value))}
                  className="w-20 h-1 bg-white/30 rounded-full appearance-none cursor-pointer"
                />
                <span className="text-sm min-w-[3rem]">{isMuted ? 0 : volume}%</span>
              </div>

              <button
                onClick={restart}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
                title="Restart video"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
              
              <button
                onClick={toggleFullscreen}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Video Title */}
      {title && (
        <div className="p-4 bg-white">
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
      )}
    </div>
  );
}
