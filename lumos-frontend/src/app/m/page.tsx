"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { Sparkles, Bot, ShieldCheck, Zap, Radio, Radar, Lightbulb, ChevronRight, Mic, MicOff, CalendarPlus, CheckCircle2, XCircle, ArrowRight, Volume2, VolumeX, Play, Pause } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { AnimatePresence } from "framer-motion";
import { useLenis } from "@/hooks/useLenis";
import { SectionReveal, useParallax } from "@/components/ScrollScene";
import ScrollProgress from "@/components/ScrollProgress";

// Tiny utility for a repeating grid background
function GridBG({ opacity = 0.06 }: { opacity?: number }) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(transparent_0%,black_65%)]"
      style={{
        backgroundImage:
          "linear-gradient(to right, rgba(255,255,255,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.12) 1px, transparent 1px)",
        backgroundSize: "48px 48px",
        opacity,
      }}
    />
  );
}

// Animated conic gradient radar sweep (JARVIS-ish)
function RadarSweep({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 rounded-full border border-white/10" />
      <div className="absolute inset-3 rounded-full border border-white/10" />
      <div className="absolute inset-6 rounded-full border border-white/10" />
      <div className="absolute inset-0 rounded-full overflow-hidden">
        <div className="absolute inset-0 animate-[spin_8s_linear_infinite]"
             style={{
               background:
                 "conic-gradient(from 0deg at 50% 50%, rgba(0,255,194,0.25), transparent 40deg, transparent 360deg)",
             }}
        />
      </div>
      <div className="absolute inset-0 rounded-full shadow-[0_0_40px_8px_rgba(0,255,194,0.15)_inset]" />
    </div>
  );
}

// Subtle noise overlay for cinematic feel
function Noise() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-soft-light"
      style={{
        backgroundImage:
          "url('data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'200\' height=\'200\'><filter id=\'n\'><feTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'2\'/></filter><rect width=\'100%\' height=\'100%\' filter=\'url(%23n)\' opacity=\'0.35\'/></svg>')",
        backgroundSize: "auto",
      }}
    />
  );
}

// Floating particles for ambient animation
function FloatingParticles() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-emerald-400/30 rounded-full"
          style={{
            left: `${20 + i * 15}%`,
            top: `${10 + i * 20}%`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0.3, 0.8, 0.3],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 8 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 1.5,
          }}
        />
      ))}
    </div>
  );
}

// Cursor-following light (pure white)
function CursorLight() {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  return (
    <div className="pointer-events-none fixed inset-0 z-10">
      <div
        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl transition-transform duration-100 ease-out"
        style={{
          left: mousePos.x,
          top: mousePos.y,
          width: 600,
          height: 600,
          background:
            "radial-gradient(circle at center, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.15) 30%, rgba(0,0,0,0) 70%)",
        }}
      />
    </div>
  );
}

// Static ambient light (background glow)
function AmbientLight() {
  return (
    <div className="pointer-events-none absolute inset-0">
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          width: 800,
          height: 800,
          background:
            "radial-gradient(circle at center, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.05) 30%, rgba(0,0,0,0) 70%)",
        }}
      />
    </div>
  );
}

// Minimal equalizer bars (ambient life)
function Equalizer() {
  const bars = new Array(18).fill(null);
  return (
    <div className="flex items-end gap-1 h-12">
      {bars.map((_, i) => (
        <div
          key={i}
          className="w-1 bg-emerald-400/70 rounded-sm"
          style={{
            height: `${6 + ((i * 13) % 30)}px`,
            animation: `pulseBar 1.8s ${i * 0.08}s infinite ease-in-out`,
          }}
        />
      ))}
      <style>{`
        @keyframes pulseBar {
          0%, 100% { transform: scaleY(0.4); opacity: .65 }
          50% { transform: scaleY(1.4); opacity: 1 }
        }
      `}</style>
    </div>
  );
}

// Floating HUD chips
function HudChip({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6 }}
      className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 backdrop-blur-md shadow-[0_0_20px_rgba(0,255,194,0.12)]"
    >
      <Icon size={14} className="text-emerald-300" />
      <span className="text-xs text-white/80">{label}</span>
    </motion.div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  desc,
}: {
  icon: any;
  title: string;
  desc: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6 }}
      whileHover={{ 
        y: -12,
        scale: 1.03,
        transition: { duration: 0.4, ease: "easeOut" }
      }}
      className="relative rounded-2xl border border-white/10 bg-white/[0.03] p-5 backdrop-blur-md group cursor-pointer overflow-hidden shadow-[0_0_0_1px_rgba(0,255,194,0.0)]"
    >
      {/* Enhanced glow effect */}
      <motion.div 
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background:
            "radial-gradient(800px 300px at top left, rgba(0,255,194,0.12), transparent 70%)",
        }}
      />
      
      {/* Border glow effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl border border-emerald-400/0 group-hover:border-emerald-400/30 transition-colors duration-500"
        style={{
          boxShadow: "0 0 0 1px rgba(0,255,194,0.0)",
        }}
      />
      
      <div className="relative z-10 flex items-start gap-4">
        <motion.div 
          className="rounded-xl border border-white/10 bg-black/50 p-2"
          whileHover={{ 
            scale: 1.2,
            rotate: 5,
            transition: { duration: 0.3 }
          }}
        >
          <motion.div
            animate={{ 
              boxShadow: "0 0 20px rgba(0,255,194,0.3)"
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity, 
              repeatType: "reverse" 
            }}
          >
            <Icon className="text-emerald-300 group-hover:text-emerald-200 transition-colors" />
          </motion.div>
        </motion.div>
        <div>
          <motion.h3 
            className="text-white text-lg font-semibold tracking-tight group-hover:text-emerald-100 transition-colors"
            whileHover={{ 
              scale: 1.02,
              transition: { duration: 0.2 }
            }}
          >
            {title}
          </motion.h3>
          <p className="text-white/70 group-hover:text-white/80 mt-1 text-sm leading-relaxed transition-colors">{desc}</p>
        </div>
      </div>
    </motion.div>
  );
}

const Fade = ({ delay = 0, children }: { delay?: number; children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
  >
    {children}
  </motion.div>
);

// Audio player hook
function useAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.13);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const play = () => {
    if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.volume = volume;
        setIsMuted(false);
      } else {
        audioRef.current.volume = 0;
        setIsMuted(true);
      }
    }
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (audioRef.current && !isMuted) {
      audioRef.current.volume = newVolume;
    }
  };

  return {
    audioRef,
    isPlaying,
    volume,
    isMuted,
    togglePlay,
    toggleMute,
    handleVolumeChange,
  };
}

// Testimonials carousel component
function TestimonialsCarousel() {
  const items = [
    { 
      quote: "Lumos helped me challenge my limiting beliefs. It's like having a wise friend who tells you the truth.", 
      by: "Sarah, Computer Science Student" 
    },
    { 
      quote: "Finally, an AI that understands student stress. The voice interaction feels so natural and calming.", 
      by: "Alex, Psychology Major" 
    },
    { 
      quote: "It's like a small light when nights get heavy. Lumos remembers our conversations and actually helps me grow.", 
      by: "Maya, Engineering Student" 
    },
    { 
      quote: "The calm UI with strong actions is rare. Lumos doesn't just comfort me - it challenges me to be better.", 
      by: "Jordan, Business Student" 
    },
  ];
  const [i, setI] = React.useState(0);

  React.useEffect(() => {
    const id = setInterval(() => setI(v => (v + 1) % items.length), 5000);
    return () => clearInterval(id);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.6 }}
      className="relative overflow-hidden"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-md"
        >
          <div className="flex items-start gap-4">
            <div className="rounded-xl border border-white/10 bg-black/50 p-2 mt-1">
              <Sparkles className="text-emerald-300" size={16} />
            </div>
            <div className="flex-1">
              <p className="text-white/90 text-lg leading-relaxed">"{items[i].quote}"</p>
              <div className="text-emerald-300/80 text-sm mt-3 font-medium">— {items[i].by}</div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="mt-6 flex justify-center gap-2">
        {items.map((_, idx) => (
          <motion.button
            key={idx}
            onClick={() => setI(idx)}
            className={`h-1.5 w-8 rounded-full transition-colors ${
              idx === i ? "bg-emerald-400" : "bg-white/20 hover:bg-white/30"
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

// Audio control component
function AudioControl({ audio }: { audio: ReturnType<typeof useAudioPlayer> }) {

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 1 }}
      className="fixed bottom-6 right-6 z-50"
    >
      <div className="relative" data-audio-control>
        {/* Main control bar */}
        <motion.div
          className="flex items-center gap-3 rounded-full border border-white/10 bg-black/50 px-4 py-2 backdrop-blur-md shadow-[0_0_20px_rgba(0,255,194,0.12)]"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          {/* Music note icon */}
          <motion.div
            animate={{ rotate: audio.isPlaying ? 360 : 0 }}
            transition={{ duration: 2, repeat: audio.isPlaying ? Infinity : 0, ease: "linear" }}
            className="text-emerald-400"
          >
            <Sparkles size={16} />
          </motion.div>

          {/* Play/Pause button */}
          <motion.button
            onClick={audio.togglePlay}
            className="flex items-center gap-2 rounded-full bg-emerald-400/90 px-3 py-1.5 text-sm font-semibold text-black shadow-[0_4px_12px_rgba(0,255,194,0.25)] hover:bg-emerald-300 transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {audio.isPlaying ? <Pause size={14} /> : <Play size={14} />}
            {audio.isPlaying ? "Pause" : "Play"}
          </motion.button>

          {/* Integrated volume control */}
          <motion.div
            className="relative flex items-center gap-2"
          >
            {/* Combined mute button and volume slider */}
            
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

// Dynamic video background component with cursor reveal effect
function DynamicBackground() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Ensure video loads and plays
      video.load();
      video.play().catch(error => {
        console.log('Video autoplay failed:', error);
      });
    }
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 z-0 overflow-hidden">
      {/* Original bright video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        onError={(e) => console.log('Video error:', e)}
        onLoadStart={() => console.log('Video loading started')}
        onCanPlay={() => console.log('Video can play')}
      >
        <source src="/dynamic_background3.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Darkened video overlay */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ 
          filter: 'brightness(0.1) contrast(1.1)',
          mask: `radial-gradient(circle 300px at ${mousePos.x}px ${mousePos.y}px, transparent 0%, black 70%)`,
          WebkitMask: `radial-gradient(circle 300px at ${mousePos.x}px ${mousePos.y}px, transparent 0%, black 70%)`
        }}
      >
        <source src="/dynamic_background3.mp4" type="video/mp4" />
      </video>
      
      {/* Additional dark overlay for text readability */}
      <div className="absolute inset-0 bg-black/20" />
    </div>
  );
}



export default function HomePage() {
  useLenis(); // Enable smooth scrolling
  const { user } = useAuth();
  const audio = useAudioPlayer();
  const [currentScreen, setCurrentScreen] = useState(0);
  const [currentTaglineIndex, setCurrentTaglineIndex] = useState(0);


  
  // Rotating taglines for hero section
  const heroTaglines = [
    "Feel the Lumos in the dark",
    "Find your light with Lumos", 
    "Let Lumos guide your way",
    "Discover Lumos in silence",
    "Embrace Lumos in solitude"
  ];
  
  // Rotate hero taglines every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTaglineIndex((prev) => (prev + 1) % heroTaglines.length);
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  // Handle scroll-based screen detection with IntersectionObserver
  useEffect(() => {
    const ids = ["screen-0", "screen-1", "screen-2", "screen-3", "screen-4", "screen-5"];
    const sections = ids.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[];

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter(e => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) {
          const idx = ids.indexOf(visible.target.id);
          setCurrentScreen(idx);
        }
      },
      { root: null, threshold: [0.4, 0.6, 0.9] }
    );

    sections.forEach(s => obs.observe(s));
    return () => obs.disconnect();
  }, []);
  
  // Parallax for hero glyph
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useTransform(my, [ -48, 48 ], [ 8, -8 ]);
  const ry = useTransform(mx, [ -48, 48 ], [ -8, 8 ]);

  // Throttled mouse movement to prevent jumping
  const lastMove = useRef(0);
  function onPointerMove(e: React.PointerEvent) {
    const now = Date.now();
    if (now - lastMove.current < 16) return; // ~60fps throttling
    lastMove.current = now;
    
    const r = (v: number) => Math.max(-48, Math.min(48, v));
    const { innerWidth, innerHeight } = window;
    mx.set(r((e.clientX - innerWidth / 2) / 8));
    my.set(r((e.clientY - innerHeight / 2) / 8));
  }

  // Handle scroll to next screen
  const scrollToScreen = (screenIndex: number) => {
    setCurrentScreen(screenIndex);
    const element = document.getElementById(`screen-${screenIndex}`);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

    return (
          <>
        <ScrollProgress />
      <DynamicBackground />
        <div className="min-h-[100dvh] w-full text-white overflow-x-hidden relative snap-y snap-mandatory" onPointerMove={onPointerMove}>
      {/* Background layers - Fixed positioning to cover entire page */}
      <GridBG />
      <Noise />
      <FloatingParticles />
      <AmbientLight />

      {/* Cursor Light - Fixed position for all screens */}
      <CursorLight />
      
      {/* Corner HUDs */}
      <div className="pointer-events-none fixed right-6 top-6 z-30 opacity-80">
        <RadarSweep className="h-28 w-28" />
      </div>
      <div className="pointer-events-none fixed left-6 bottom-6 z-30 opacity-80">
        <Equalizer />
      </div>

      {/* NAV */}
      <header className="relative z-20">
        <div className="mx-auto max-w-7xl px-6 py-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-emerald-400/90 shadow-[0_0_30px_6px_rgba(0,255,194,0.65)]" />
            <span className="text-white font-semibold">Lumos</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-white/70 text-sm">
            <a className="hover:text-white/95 transition" href="#features">Features</a>
            <a className="hover:text-white/95 transition" href="#how">How it works</a>
            <a className="hover:text-white/95 transition" href="#contact">Contact</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link 
              href="/m/login"
              className="inline-flex items-center gap-2 rounded-full bg-emerald-400/90 px-4 py-2 text-sm font-semibold text-black shadow-[0_10px_30px_rgba(0,255,194,0.25)] hover:bg-emerald-300 transition"
            >
              <Mic className="h-4 w-4" />
              Start Chat
            </Link>
          </div>
        </div>
      </header>

      {/* SCREEN 1: HERO */}
      <section id="screen-0" className="relative z-10 min-h-screen flex items-center snap-start">
        <div className="mx-auto max-w-7xl px-6 w-full">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-5xl md:text-6xl font-extrabold leading-tight"
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={currentTaglineIndex}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                  >
                    {heroTaglines[currentTaglineIndex].split('Lumos').map((part, index) => (
                      <span key={index}>
                        {part}
                        {index < heroTaglines[currentTaglineIndex].split('Lumos').length - 1 && (
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 drop-shadow-[0_0_20px_rgba(0,255,200,0.35)]">
                            Lumos
                          </span>
                        )}
                      </span>
                    ))}
                  </motion.span>
                </AnimatePresence>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7 }}
                className="mt-4 text-white/70 max-w-xl"
              >
                In the quiet moments when you feel lost, Lumos is your authentic companion. 
                Not just comforting words but honest guidance that challenges your limiting beliefs 
                and helps you grow. <span className="text-white">"Hey Lumos..."</span> and discover what's possible.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35, duration: 0.7 }}
                className="mt-6 flex flex-wrap items-center gap-3"
              >
                <motion.button
                  onClick={() => scrollToScreen(1)}
                  className="inline-flex items-center gap-2 rounded-full bg-emerald-400/90 px-5 py-2.5 text-sm font-semibold text-black shadow-[0_10px_30px_rgba(0,255,194,0.25)] hover:bg-emerald-300 transition"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start with Lumos
                  <ChevronRight size={16} />
                </motion.button>
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm text-white/80">
                  <Mic className="h-4 w-4" />
                  Voice-first AI
                </div>
              </motion.div>

              <div className="mt-8 flex items-center gap-3">
                <HudChip icon={ShieldCheck} label="Private by design" />
                <HudChip icon={Zap} label="Authentic growth" />
                <HudChip icon={Bot} label="Memory & context" />
              </div>
            </div>

            {/* Floating emblem */}
            <motion.div
              style={{ rotateX: rx, rotateY: ry }}
              className="relative h-[380px] md:h-[460px]"
            >
              <div className="absolute inset-0 rounded-3xl border border-white/10 bg-gradient-to-b from-white/5 to-white/[0.02] backdrop-blur-md shadow-[0_30px_80px_rgba(0,0,0,0.4)]" />
              <div className="absolute inset-0 grid place-items-center">
                <div className="relative">
                  {/* The lone light */}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 h-10 w-10 rounded-full bg-emerald-400/90 shadow-[0_0_60px_18px_rgba(0,255,194,0.55)]" />
                  <h2 className="text-6xl md:text-7xl font-black tracking-tight text-white/90">
                    Lumos
                  </h2>
                  <p className="text-center text-white/50 text-xs mt-2 tracking-widest">LISTEN • REMEMBER • GROW</p>
                </div>
              </div>
              {/* Hero image placeholder */}
              <div className="absolute bottom-4 left-4 right-4 h-28 rounded-xl bg-white/5 border border-white/10 grid place-items-center">
                <span className="text-white/30 text-xs">Your growth journey starts here</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* SCREEN 2: FEATURES + TESTIMONIALS */}
      <section id="screen-1" className="relative z-10 min-h-screen flex items-center snap-start">
        <div className="mx-auto max-w-7xl px-6 w-full">
          <div className="space-y-16">
            {/* Features + Growth Points */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="mb-8"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  Why Lumos is different
                </h2>
                <p className="text-white/70 max-w-2xl">
                  Most AI companions just comfort you. Lumos challenges you to grow.
                </p>
              </motion.div>
              
              {/* Feature cards */}
              <div className="space-y-4">
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                >
                  <FeatureCard
                    icon={Sparkles}
                    title="Authentic, not artificial"
                    desc="Lumos doesn't just agree with you. It challenges limiting beliefs with warmth and honesty."
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                >
                  <FeatureCard
                    icon={ShieldCheck}
                    title="Private & secure"
                    desc="Your conversations stay private. Lumos remembers your journey across sessions."
                  />
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                >
                  <FeatureCard
                    icon={Radio}
                    title="Voice-first experience"
                    desc="Natural voice interaction with advanced speech recognition. Just say 'Hey Lumos'."
                  />
                </motion.div>
              </div>
            </div>

            {/* How Lumos guides your growth */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8 }}
                className="mb-8"
              >
                <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  How Lumos guides your growth
                </h2>
                <p className="text-white/70 mb-6">
                  Lumos combines emotional intelligence with honest feedback. It validates your feelings while gently challenging the thoughts that hold you back.
                </p>
              </motion.div>
              
              {/* Growth guidance cards */}
              <div className="space-y-4">
                {[
                  {
                    icon: Lightbulb,
                    title: "Validates emotions, challenges limiting thoughts",
                    desc: "Lumos provides honest feedback, helping you reframe negative thought patterns."
                  },
                  {
                    icon: Radio,
                    title: "Remembers your journey across sessions",
                    desc: "Lumos builds context over time, offering personalized insights and support."
                  },
                  {
                    icon: Zap,
                    title: "Suggests actionable next steps",
                    desc: "Beyond conversation, Lumos helps you translate insights into real-world actions."
                  },
                  {
                    icon: Bot,
                    title: "Adapts to your personality and growth style",
                    desc: "Lumos learns your preferences and adapts its guidance to match your unique needs."
                  }
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                  >
                    <FeatureCard
                      icon={item.icon}
                      title={item.title}
                      desc={item.desc}
                    />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
          

        </div>
      </section>



      {/* SCREEN 3: TESTIMONIALS + FAQ + FINAL CTA */}
      <section id="screen-2" className="relative z-10 min-h-screen flex items-center snap-start">
        <div className="mx-auto max-w-4xl px-6 w-full pt-16">
          {/* Testimonials Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="text-emerald-300/90 text-xs tracking-widest uppercase mb-2">What students say</div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Quiet, capable, reassuring
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto mb-8">
              Real experiences from students who found their light in the dark
            </p>
            <TestimonialsCarousel />
          </motion.div>


          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mb-12"
          >
            <div className="text-emerald-300/90 text-xs tracking-widest uppercase mb-2">Frequently Asked Questions</div>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Everything you need to know
            </h3>
            <p className="text-white/70 max-w-2xl mx-auto">
              Common questions about your AI growth companion
            </p>
          </motion.div>

          {/* Simplified FAQ */}
          <div className="grid md:grid-cols-2 gap-6">
            {[
              {
                q: "What is Lumos?",
                a: "Your comprehensive AI companion - part agentic assistant, part mental health provider. Think JARVIS for your mind and life."
              },
              {
                q: "How does Lumos help me grow?",
                a: "It validates your feelings while constructively challenging limiting beliefs. Warm but honest guidance for real personal growth."
              },
              {
                q: "Is my privacy protected?",
                a: "Absolutely. Your conversations are encrypted and stored securely. You have full control over your data."
              },
              {
                q: "How do I get started?",
                a: "Simply sign up, complete your profile, and start talking! Say 'Hey Lumos' and begin your journey."
              }
            ].map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md"
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-xl border border-white/10 bg-black/50 p-2 mt-1">
                    <Sparkles className="text-emerald-300" size={16} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white text-lg font-semibold tracking-tight mb-2">{faq.q}</h3>
                    <p className="text-white/70 text-sm leading-relaxed">{faq.a}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SCREEN 4: TECHNOLOGY & SECURITY */}
      <section id="screen-3" className="relative z-10 min-h-screen flex items-center snap-start">
        <div className="mx-auto max-w-6xl px-6 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="text-emerald-300/90 text-xs tracking-widest uppercase mb-2">Advanced Technology</div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Built with cutting-edge AI
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              Powered by the latest language models and speech recognition technology
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Bot,
                title: "Advanced LLM",
                desc: "Powered by GPT-4o-mini for intelligent, contextual conversations that understand your unique situation."
              },
              {
                icon: Radio,
                title: "Speech Recognition",
                desc: "Whisper Turbo technology for accurate voice-to-text conversion in multiple languages."
              },
              {
                icon: ShieldCheck,
                title: "Enterprise Security",
                desc: "End-to-end encryption, secure data storage, and privacy-first design principles."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 mb-6">
                  <item.icon className="text-emerald-400" size={28} />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-white/70 text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SCREEN 5: USE CASES & SCENARIOS */}
      <section id="screen-4" className="relative z-10 min-h-screen flex items-center snap-start">
        <div className="mx-auto max-w-6xl px-6 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="text-emerald-300/90 text-xs tracking-widest uppercase mb-2">Real-World Applications</div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              When to turn to Lumos
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto">
              From daily challenges to life-changing decisions, Lumos is there to guide you
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                icon: Lightbulb,
                title: "Academic Challenges",
                desc: "Struggling with motivation, procrastination, or imposter syndrome? Lumos helps you reframe challenges and find your path forward."
              },
              {
                icon: CalendarPlus,
                title: "Life Transitions",
                desc: "Moving to a new city, changing careers, or facing major life decisions? Get honest guidance and actionable advice."
              },
              {
                icon: Sparkles,
                title: "Personal Growth",
                desc: "Want to build better habits, improve relationships, or develop new skills? Lumos provides personalized growth strategies."
              },
              {
                icon: ShieldCheck,
                title: "Mental Wellness",
                desc: "Feeling overwhelmed, anxious, or stuck? Lumos offers compassionate support while encouraging healthy coping mechanisms."
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-8 backdrop-blur-md"
              >
                <div className="flex items-start gap-4">
                  <div className="rounded-xl border border-white/10 bg-black/50 p-3">
                    <item.icon className="text-emerald-300" size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white text-xl font-semibold tracking-tight mb-3">{item.title}</h3>
                    <p className="text-white/70 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SCREEN 6: FINAL CTA & SOCIAL PROOF */}
      <section id="screen-5" className="relative z-10 min-h-screen flex items-center snap-start">
        <div className="mx-auto max-w-4xl px-6 w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="mb-12"
          >
            <div className="text-emerald-300/90 text-xs tracking-widest uppercase mb-2">Ready to Transform?</div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Your AI companion awaits
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto text-lg mb-8">
              Join thousands of students who've found their light with Lumos. Start your journey today.
            </p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-12"
            >
              {user ? (
                <Link 
                  href="/m/dashboard"
                  className="inline-flex items-center gap-3 rounded-full bg-emerald-400/90 px-10 py-5 text-xl font-semibold text-black shadow-[0_20px_50px_rgba(0,255,194,0.4)] hover:bg-emerald-300 transition"
                >
                  Continue Your Journey
                  <ChevronRight size={24} />
                </Link>
              ) : (
                <Link 
                  href="/m/signup"
                  className="inline-flex items-center gap-3 rounded-full bg-emerald-400/90 px-10 py-5 text-xl font-semibold text-black shadow-[0_20px_50px_rgba(0,255,194,0.4)] hover:bg-emerald-300 transition"
                >
                  Start Your Journey Today
                  <ChevronRight size={24} />
                </Link>
              )}
            </motion.div>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              { number: "10K+", label: "Active Users" },
              { number: "50K+", label: "Conversations" },
              { number: "95%", label: "Satisfaction Rate" }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-emerald-400 mb-2">{stat.number}</div>
                <div className="text-white/70 text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Navigation Dots */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="flex gap-3">
          {[0, 1, 2, 3, 4, 5].map((screenIndex) => (
            <motion.button
              key={screenIndex}
              onClick={() => scrollToScreen(screenIndex)}
              className={`w-3 h-3 rounded-full transition-colors ${
                currentScreen === screenIndex 
                  ? "bg-emerald-400 shadow-[0_0_12px_rgba(0,255,194,0.6)]" 
                  : "bg-white/20 hover:bg-white/40"
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.8 }}
            />
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer id="contact" className="relative z-10">
        <div className="mx-auto max-w-7xl px-6 pb-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded-full bg-emerald-400/90 shadow-[0_0_30px_6px_rgba(0,255,194,0.5)]" />
              <span className="text-white/70 text-sm">© {new Date().getFullYear()} Lumos</span>
            </div>
            <div className="text-white/50 text-xs">
              Built for authentic growth — one honest conversation at a time.
            </div>
          </div>
        </div>
      </footer>

      {/* Audio element */}
      <audio ref={audio.audioRef} loop>
        <source src="/Lofi1.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>

      {/* Audio Control Bar */}
      <AudioControl audio={audio} />
    </div>
    </>
  );
}