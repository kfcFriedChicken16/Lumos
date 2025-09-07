// Home Page
'use client';

import React, { useEffect, useRef, useState } from "react";

// Hydration guard hook
function useHasHydrated() {
  const [hydrated, setHydrated] = React.useState(false);
  React.useEffect(() => setHydrated(true), []);
  return hydrated;
}
import { motion, useMotionValue, useTransform, useScroll, useSpring } from "framer-motion";
import dynamic from "next/dynamic";
import { 
  BookOpen, 
  Users, 
  Clock, 
  Star, 
  ChevronRight, 
  CheckCircle, 
  Play,
  Calculator,
  TestTube,
  Languages,
  GraduationCap,
  Lightbulb,
  FileText,
  ArrowRight,
  Sparkles,
  Shield,
  Zap,
  Brain
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useLenis } from "@/hooks/useLenis";

// Smooth scroll setup
function SmoothScroll() {
  const lenis = useLenis();
  return null;
}

// Hero Section with Parallax
function HeroSection() {
  const hydrated = useHasHydrated();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: hydrated ? containerRef : undefined,   // ⬅️ don't attach until hydrated
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  return (
    <motion.section 
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Static Image Background */}
      <div className="absolute inset-0">
                 <img
           src="/school.jpg"
           alt="Two young students with backpacks representing the target audience"
           className="absolute inset-0 w-full h-full object-cover object-center"
           style={{ objectPosition: "center 35%" }}
         />
        
        {/* Dark overlay for text readability */}
        <div className="absolute inset-0 bg-black/60" />
      </div>

      {/* Main Content */}
      <motion.div 
        style={{ y, opacity }}
        className="relative z-10 text-center px-6 max-w-6xl mx-auto"
      >
        {/* Logo */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-6"
        >
          <div className="inline-flex items-center space-x-3 mb-4">
            <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center shadow-2xl">
              <BookOpen className="w-7 h-7 text-white" />
            </div>
            <div className="text-left">
              <h1 className="text-3xl font-bold text-white">Lumos</h1>
              <p className="text-orange-400 font-medium text-sm">AI Tutoring Platform</p>
            </div>
          </div>
        </motion.div>

        {/* Main Headline */}
        <motion.h1 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight"
        >
          Expert Tutoring for
          <span className="block bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">
            Malaysian Students
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-lg md:text-xl text-gray-300 mb-6 max-w-3xl mx-auto leading-relaxed"
        >
          Get personalized 1-on-1 support from qualified tutors, available 24/7. 
          Master Math, Science, Languages, and more with our AI-powered platform.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
        >
          <Link href="/web/login">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all duration-300 flex items-center space-x-2"
            >
              <span>Start Learning Now</span>
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </Link>
          <Link href="#subjects">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 border-2 border-orange-500/30 text-orange-400 font-semibold rounded-xl hover:bg-orange-500/10 transition-all duration-300 flex items-center space-x-2"
            >
              <span>Browse Subjects</span>
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
        >
          {[
            { icon: Users, value: "500+", label: "Qualified Tutors" },
            { icon: Clock, value: "24/7", label: "Availability" },
            { icon: Star, value: "4.9★", label: "Student Rating" },
            { icon: BookOpen, value: "15+", label: "Subjects" }
          ].map((stat, index) => (
            <motion.div 
              key={index}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
              className="text-center"
            >
              <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center mx-auto mb-2">
                <stat.icon className="w-5 h-5 text-orange-400" />
              </div>
              <div className="text-xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-xs text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div 
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-orange-400/50 rounded-full flex justify-center"
        >
          <motion.div 
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-orange-400 rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </motion.section>
  );
}

// Mission Section
function MissionSection() {
  const hydrated = useHasHydrated();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: hydrated ? containerRef : undefined,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0.9]);

  return (
    <section ref={containerRef} className="py-24 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <motion.div 
        style={{ y }}
        className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-cyan-50/50"
      />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
                 {/* Main Mission Content - UPchieve Style */}
         <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
           {/* Left Side - Text Content */}
           <motion.div 
             style={{ opacity }}
             className="space-y-8"
           >
             <motion.div
               initial={{ y: 50, opacity: 0 }}
               whileInView={{ y: 0, opacity: 1 }}
               transition={{ duration: 0.8 }}
               viewport={{ once: true, margin: "-100px" }}
             >
               <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                 Our Mission
               </h2>
               <p className="text-xl text-gray-600 leading-relaxed mb-8">
                 We are committed to democratizing access to quality education for Malaysian students, 
                 ensuring that every learner has the opportunity to excel academically regardless of their background.
               </p>
             </motion.div>

             {/* Mission Points */}
             <div className="space-y-6">
               {[
                 {
                   icon: "🎯",
                   title: "Equal Access",
                   description: "Breaking down barriers to quality education by making expert tutoring accessible to all Malaysian students."
                 },
                 {
                   icon: "🚀",
                   title: "Academic Excellence", 
                   description: "Empowering students to reach their full potential through personalized, AI-powered learning experiences."
                 },
                 {
                   icon: "🤝",
                   title: "Community Impact",
                   description: "Building a supportive learning community that fosters growth, confidence, and lifelong success."
                 }
               ].map((item, index) => (
                 <motion.div
                   key={index}
                   initial={{ x: -100, opacity: 0, scale: 0.9 }}
                   whileInView={{ x: 0, opacity: 1, scale: 1 }}
                   transition={{ 
                     duration: 0.8, 
                     delay: index * 0.2,
                     type: "spring",
                     stiffness: 100
                   }}
                   viewport={{ once: true, margin: "-50px" }}
                   whileHover={{ 
                     x: 10,
                     transition: { duration: 0.3 }
                   }}
                   className="flex items-start space-x-4 group cursor-pointer"
                 >
                   <motion.div 
                     className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-orange-200 transition-colors duration-300"
                     whileHover={{ 
                       scale: 1.1,
                       rotate: 5,
                       transition: { duration: 0.3 }
                     }}
                   >
                     <span className="text-2xl">{item.icon}</span>
                   </motion.div>
                   <div>
                     <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-700 transition-colors duration-300">{item.title}</h3>
                     <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">{item.description}</p>
                   </div>
                 </motion.div>
               ))}
             </div>

             {/* CTA Button */}
             <motion.div
               initial={{ y: 50, opacity: 0, scale: 0.9 }}
               whileInView={{ y: 0, opacity: 1, scale: 1 }}
               transition={{ 
                 duration: 0.8, 
                 delay: 0.8,
                 type: "spring",
                 stiffness: 100
               }}
               viewport={{ once: true, margin: "-50px" }}
             >
               <Link href="#subjects">
                 <motion.button 
                   whileHover={{ 
                     scale: 1.05,
                     boxShadow: "0 20px 40px rgba(249, 115, 22, 0.3)"
                   }}
                   whileTap={{ scale: 0.95 }}
                   className="px-8 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all duration-300 flex items-center space-x-2"
                 >
                   <span>Explore Our Subjects</span>
                   <motion.div
                     animate={{ x: [0, 5, 0] }}
                     transition={{ duration: 2, repeat: Infinity }}
                   >
                     <ArrowRight className="w-5 h-5" />
                   </motion.div>
                 </motion.button>
               </Link>
             </motion.div>
           </motion.div>

           {/* Right Side - Illustration */}
           <motion.div
             initial={{ x: 100, opacity: 0, scale: 0.8 }}
             whileInView={{ x: 0, opacity: 1, scale: 1 }}
             transition={{ 
               duration: 1, 
               delay: 0.3,
               type: "spring",
               stiffness: 80
             }}
             viewport={{ once: true, margin: "-100px" }}
             className="flex justify-center lg:justify-end"
           >
             <div className="relative">
               {/* Main Illustration */}
               <motion.div 
                 className="relative z-10"
                 whileHover={{ 
                   scale: 1.05,
                   transition: { duration: 0.3 }
                 }}
               >
                 <img 
                   src="/undraw_ideas_vn7a.svg" 
                   alt="Educational ideas and innovation" 
                   className="w-full max-w-md h-auto"
                 />
               </motion.div>
               
               {/* Decorative Elements */}
               <motion.div 
                 style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "30%"]) }}
                 className="absolute -top-8 -right-8 w-24 h-24 bg-orange-200/30 rounded-full blur-xl"
                 animate={{ 
                   scale: [1, 1.2, 1],
                   opacity: [0.3, 0.6, 0.3]
                 }}
                 transition={{ duration: 4, repeat: Infinity }}
               />
               <motion.div 
                 style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "-25%"]) }}
                 className="absolute -bottom-8 -left-8 w-32 h-32 bg-yellow-200/30 rounded-full blur-xl"
                 animate={{ 
                   scale: [1.2, 1, 1.2],
                   opacity: [0.4, 0.7, 0.4]
                 }}
                 transition={{ duration: 5, repeat: Infinity, delay: 1 }}
               />
               
               {/* Additional floating elements */}
               <motion.div 
                 style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "40%"]) }}
                 className="absolute top-16 -left-4 w-16 h-16 bg-orange-200/20 rounded-full blur-lg"
                 animate={{ 
                   y: [0, -20, 0],
                   opacity: [0.2, 0.5, 0.2]
                 }}
                 transition={{ duration: 6, repeat: Infinity, delay: 2 }}
               />
               <motion.div 
                 style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "-35%"]) }}
                 className="absolute bottom-16 -right-4 w-12 h-12 bg-yellow-200/25 rounded-full blur-lg"
                 animate={{ 
                   y: [0, 15, 0],
                   opacity: [0.3, 0.6, 0.3]
                 }}
                 transition={{ duration: 4, repeat: Infinity, delay: 3 }}
               />
             </div>
           </motion.div>
         </div>

        
      </div>
    </section>
  );
}

// ===== Tunables for the pinned, laptop-sized stack =====
const PIN_STEP_VH = 115;        // vertical scroll per card (bigger = longer sequence)
const FRAME_HEIGHT_VH = 70;     // the "laptop window" height on screen
const PERSPECTIVE = 1600;       // 3D depth (bigger = less dramatic)
const DEPTH_SCALE_STEP = 0.05;  // how much smaller deeper cards start
const DEPTH_Y_STEP = 64;        // how much lower deeper cards start
const SLICE_PAD = 0.08;         // extra lead/lag around each card's slice (0–1 of total)

function SubjectsSection() {
  const subjects = [
    {
      icon: Calculator,
      title: "Mathematics",
      description:
        "Master algebra, calculus, statistics, and more with expert guidance. Our qualified tutors help you understand complex mathematical concepts through personalized, step-by-step explanations.",
      color: "from-emerald-500 to-teal-500",
    },
    {
      icon: TestTube,
      title: "Sciences",
      description:
        "Explore physics, chemistry, biology, and other sciences with hands-on learning. Get practical insights and real-world applications from experienced science educators.",
      color: "from-violet-500 to-purple-500",
    },
    {
      icon: Languages,
      title: "Languages",
      description:
        "Improve English, Malay, Mandarin, and other language skills. Develop fluency through conversation practice and comprehensive grammar instruction.",
      color: "from-blue-500 to-cyan-500",
    },
    {
      icon: GraduationCap,
      title: "Test Preparation",
      description:
        "Prepare for SPM, STPM, MUET, and university entrance exams. Get targeted strategies and practice materials to achieve your academic goals.",
      color: "from-amber-500 to-orange-500",
    },
    {
      icon: Lightbulb,
      title: "Study Skills",
      description:
        "Learn effective study techniques and time management strategies. Develop habits that will help you succeed in all your academic pursuits.",
      color: "from-rose-500 to-pink-500",
    },
    {
      icon: FileText,
      title: "Essay & Writing",
      description:
        "Plan, draft, and polish essays and reports. Build structure, clarity, and argumentation with expert feedback.",
      color: "from-fuchsia-500 to-pink-500",
    },
  ];

  const hydrated = useHasHydrated();
  const progressRef = React.useRef<HTMLDivElement | null>(null);

  // One global progress for the whole sequence (from 0 to 1)
  const { scrollYProgress } = useScroll({
    target: hydrated ? progressRef : undefined,
    offset: ["start start", "end end"],
  });

  // Tall spacer that lets you "play" the sequence while the frame is pinned
  const spacerHeight = `calc(${subjects.length} * ${PIN_STEP_VH}vh)`;

  return (
    <section
      id="subjects"
      className="relative bg-white"
      style={{ overflow: "visible" }}
    >
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 text-center pt-32">
          Explore Our Subjects
        </h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto text-center mb-10">
          Choose from a wide range of subjects and get personalized support from qualified tutors
        </p>

        {/* === Scrollytelling container (provides progress) === */}
        <div ref={progressRef} style={{ height: spacerHeight }}>
          {/* The pinned "laptop window" */}
          <div className="sticky top-0 h-screen grid place-items-center">
            <div
              className="relative w-full max-w-5xl overflow-visible shadow-none ring-0 bg-transparent rounded-none"
              // IMPORTANT: give the actual card container the perspective
              style={{ height: `${FRAME_HEIGHT_VH}vh`, perspective: PERSPECTIVE }}
            >

              {/* The stacked cards live absolutely inside this frame */}
              {subjects.map((subject, i) => (
                <DeckCard
                  key={subject.title}
                  i={i}
                  total={subjects.length}
                  subject={subject}
                  progress={scrollYProgress}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Space after the pinned sequence so the next section isn't cramped */}
        <div className="h-[16vh]" />
      </div>
    </section>
  );
}



function DeckCard({
  i,
  total,
  subject,
  progress,
}: {
  i: number;
  total: number;
  subject: { icon: any; title: string; description: string; color: string };
  progress: any; // MotionValue<number>
}) {
  // Deeper cards (earlier in array) start smaller & lower
  const depth = total - 1 - i;
  const baseScale = 1 - depth * DEPTH_SCALE_STEP;

  // Each card's "active" slice of the global progress, padded a bit on both sides
  const slice = 1 / total;
  const rawStart = i * slice;
  const rawEnd = (i + 1) * slice;
  const start = Math.max(0, rawStart - SLICE_PAD * slice);
  const end = Math.min(1, rawEnd + SLICE_PAD * slice);

  // Entry → Front → Exit mapping
  const scaleMV = useTransform(
    progress,
    [start, rawStart, rawEnd, end],
    [baseScale, 1, 1, 0.98],
    { clamp: true }
  );
  const yMV = useTransform(
    progress,
    [start, rawStart, rawEnd, end],
    [DEPTH_Y_STEP * depth + 80, 0, -12, -48],
    { clamp: true }
  );
  const rotateXMV = useTransform(
    progress,
    [start, rawStart, rawEnd, end],
    [12 + depth * 2, 0, 0, -2],
    { clamp: true }
  );
  const opacityMV = useTransform(
    progress,
    [start, rawStart, rawEnd, end],
    [0, 1, 1, 0.72],
    { clamp: true }
  );

  // Add a gentle spring to the transforms for smoother motion
  const scale = useSpring(scaleMV, { stiffness: 140, damping: 22, mass: 0.25 });
  const y = useSpring(yMV, { stiffness: 140, damping: 22, mass: 0.25 });
  const rotateX = useSpring(rotateXMV, { stiffness: 140, damping: 22, mass: 0.25 });
  const opacity = useSpring(opacityMV, { stiffness: 120, damping: 24, mass: 0.3 });

  return (
          <motion.article
        className={[
          "absolute inset-0 m-0 rounded-3xl p-8 text-white",
          "bg-gradient-to-br", subject.color,
          "transform-gpu will-change-transform shadow-2xl ring-1 ring-black/10",
        ].join(" ")}
      style={{
        zIndex: i + 1, // later cards on top
        scale,
        y,
        rotateX,
        opacity,
        transformStyle: "preserve-3d",
        transformOrigin: "center top",
        backfaceVisibility: "hidden",
        boxShadow:
          "0 50px 100px -40px rgba(2,6,23,.5), inset 0 1px 0 rgba(255,255,255,.15)",
      }}
      whileHover={{ scale: 1.015 }}
    >
      <div className="flex flex-col lg:flex-row items-start gap-8">
        <div className="flex-1">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
            <subject.icon className="h-7 w-7 text-white" />
          </div>
          <h3 className="mb-3 text-2xl md:text-3xl font-bold">{subject.title}</h3>
          <p className="mb-6 max-w-2xl text-base md:text-lg text-white/95">
            {subject.description}
          </p>
          <button className="inline-flex items-center gap-2 rounded-xl bg-white/20 px-6 py-3 font-semibold text-white backdrop-blur-sm hover:bg-white/30 transition">
            Start Learning <ArrowRight className="h-5 w-5" />
          </button>
        </div>

        <div className="hidden lg:block relative flex-shrink-0">
          <motion.div
            className="h-36 w-36 rounded-full bg-white/10 backdrop-blur-sm"
            animate={{ rotate: [0, 360], scale: [1, 1.06, 1] }}
            transition={{
              rotate: { duration: 18, repeat: Infinity, ease: "linear" },
              scale: { duration: 4, repeat: Infinity },
            }}
          />
          <div className="absolute -top-4 -right-4 h-8 w-8 rounded-full bg-white/20" />
          <div className="absolute -bottom-4 -left-4 h-6 w-6 rounded-full bg-white/15" />
        </div>
      </div>
    </motion.article>
  );
}

// How It Works Section
function HowItWorksSection() {
  const hydrated = useHasHydrated();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: hydrated ? containerRef : undefined,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0.9]);

  const steps = [
    {
      icon: Users,
      title: "Connect with Tutors",
      description: "Get matched with qualified tutors in under 5 minutes",
      color: "text-emerald-600",
      gradient: "from-emerald-500 to-teal-500"
    },
    {
      icon: BookOpen,
      title: "1-on-1 Learning",
      description: "Work through problems together using our interactive whiteboard",
      color: "text-blue-600",
      gradient: "from-blue-500 to-cyan-500"
    },
    {
      icon: CheckCircle,
      title: "Track Progress",
      description: "Monitor your improvement with detailed progress reports",
      color: "text-purple-600",
      gradient: "from-purple-500 to-pink-500"
    }
  ];

  return (
    <section ref={containerRef} className="py-32 bg-gray-50 relative overflow-hidden">
      {/* Background Elements */}
      <motion.div 
        style={{ y }}
        className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-cyan-50/50"
      />
      
      {/* Floating Elements */}
      <motion.div 
        className="absolute top-20 left-20 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl"
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 4, repeat: Infinity }}
      />
      <motion.div 
        className="absolute bottom-20 right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-xl"
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.4, 0.7, 0.4]
        }}
        transition={{ duration: 5, repeat: Infinity, delay: 1 }}
      />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Main Content - Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left Side - Illustration */}
          <motion.div 
            style={{ opacity }}
            initial={{ x: -100, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: "-100px" }}
            className="flex justify-center lg:justify-start"
          >
            <div className="relative">
              {/* Main Illustration */}
              <motion.div 
                className="relative z-10"
                whileHover={{ 
                  scale: 1.05,
                  transition: { duration: 0.3 }
                }}
              >
                <img 
                  src="/undraw_math_ldpv.svg" 
                  alt="Mathematics learning illustration" 
                  className="w-full max-w-md h-auto"
                />
              </motion.div>
              
              {/* Decorative Elements */}
              <motion.div 
                style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "30%"]) }}
                                 className="absolute -top-8 -right-8 w-24 h-24 bg-orange-200/30 rounded-full blur-xl"
                animate={{ 
                  scale: [1, 1.2, 1],
                  opacity: [0.3, 0.6, 0.3]
                }}
                transition={{ duration: 4, repeat: Infinity }}
              />
              <motion.div 
                style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "-25%"]) }}
                                 className="absolute -bottom-8 -left-8 w-32 h-32 bg-yellow-200/30 rounded-full blur-xl"
                animate={{ 
                  scale: [1.2, 1, 1.2],
                  opacity: [0.4, 0.7, 0.4]
                }}
                transition={{ duration: 5, repeat: Infinity, delay: 1 }}
              />
              
              {/* Additional floating elements */}
              <motion.div 
                style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "40%"]) }}
                                 className="absolute top-16 -left-4 w-16 h-16 bg-orange-200/20 rounded-full blur-lg"
                animate={{ 
                  y: [0, -20, 0],
                  opacity: [0.2, 0.5, 0.2]
                }}
                transition={{ duration: 6, repeat: Infinity, delay: 2 }}
              />
            </div>
          </motion.div>

          {/* Right Side - Content */}
          <motion.div 
            style={{ opacity }}
            className="space-y-8"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                How Lumos Works
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed mb-8">
                Getting help has never been easier. Follow these simple steps to start your learning journey.
              </p>
            </motion.div>

            {/* Steps */}
            <div className="space-y-6">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ x: 100, opacity: 0, scale: 0.9 }}
                  whileInView={{ x: 0, opacity: 1, scale: 1 }}
                  transition={{ 
                    duration: 0.8, 
                    delay: index * 0.2,
                    type: "spring",
                    stiffness: 100
                  }}
                  viewport={{ once: true, margin: "-50px" }}
                  whileHover={{ 
                    x: 10,
                    transition: { duration: 0.3 }
                  }}
                  className="flex items-start space-x-4 group cursor-pointer"
                >
                  <motion.div 
                    className={`w-12 h-12 bg-gradient-to-br ${step.gradient} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:shadow-lg transition-shadow duration-300`}
                    whileHover={{ 
                      scale: 1.1,
                      rotate: 5,
                      transition: { duration: 0.3 }
                    }}
                  >
                    <step.icon className="w-6 h-6 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-700 transition-colors duration-300">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* CTA Button */}
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.9 }}
              whileInView={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ 
                duration: 0.8, 
                delay: 0.8,
                type: "spring",
                stiffness: 100
              }}
              viewport={{ once: true, margin: "-50px" }}
            >
              <Link href="/web/login">
                <motion.button 
                  whileHover={{ 
                    scale: 1.05,
                    boxShadow: "0 20px 40px rgba(249, 115, 22, 0.3)"
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all duration-300 relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-orange-400 to-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: "100%" }}
                    transition={{ duration: 0.6 }}
                  />
                  <span className="relative z-10">Get Started Today</span>
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// Features Section
function FeaturesSection() {
  const hydrated = useHasHydrated();
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: hydrated ? containerRef : undefined,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [0, 1, 0.9]);

  const features = [
    {
      icon: Clock,
      title: "Available 24/7",
      description: "Get help whenever you need it, day or night",
      gradient: "from-orange-500 to-red-500"
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "Your privacy and data are protected with enterprise-grade security",
      gradient: "from-green-500 to-emerald-500"
    },
    {
      icon: Zap,
      title: "Fast Response",
      description: "Connect with tutors in under 5 minutes",
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      icon: Brain,
      title: "AI-Powered",
      description: "Advanced AI helps match you with the perfect tutor",
      gradient: "from-purple-500 to-pink-500"
    }
  ];

  return (
    <section ref={containerRef} className="py-32 bg-white relative overflow-hidden">
      {/* Background Elements */}
      <motion.div 
        style={{ y }}
        className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-emerald-50/50"
      />
      
      {/* Floating Elements */}
      <motion.div 
        className="absolute top-32 right-32 w-24 h-24 bg-orange-500/10 rounded-full blur-xl"
        animate={{ 
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.5, 0.2]
        }}
        transition={{ duration: 6, repeat: Infinity }}
      />
      <motion.div 
        className="absolute bottom-32 left-32 w-28 h-28 bg-yellow-500/10 rounded-full blur-xl"
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{ duration: 7, repeat: Infinity, delay: 2 }}
      />

              <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Main Content - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Side - Content */}
            <motion.div 
              style={{ opacity }}
              className="space-y-8"
            >
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                  Why Choose Lumos?
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed mb-12">
                  Experience the difference with our innovative approach to online tutoring
                </p>
              </motion.div>

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -100, opacity: 0, scale: 0.9 }}
                    whileInView={{ x: 0, opacity: 1, scale: 1 }}
                    transition={{ 
                      duration: 0.8, 
                      delay: index * 0.1,
                      type: "spring",
                      stiffness: 100
                    }}
                    viewport={{ once: true, margin: "-50px" }}
                    whileHover={{ 
                      x: -10,
                      transition: { duration: 0.3 }
                    }}
                    className="flex items-start space-x-4 group cursor-pointer"
                  >
                    <motion.div 
                      className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center flex-shrink-0 group-hover:shadow-lg transition-shadow duration-300`}
                      whileHover={{ 
                        scale: 1.1,
                        rotate: 5,
                        transition: { duration: 0.3 }
                      }}
                    >
                      <feature.icon className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-700 transition-colors duration-300">{feature.title}</h3>
                      <p className="text-gray-600 leading-relaxed group-hover:text-gray-700 transition-colors duration-300 text-sm">{feature.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right Side - Illustration */}
            <motion.div 
              style={{ opacity }}
              initial={{ x: 100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-100px" }}
              className="flex justify-center lg:justify-end"
            >
              <div className="relative">
                {/* Main Illustration */}
                <motion.div 
                  className="relative z-10"
                  whileHover={{ 
                    scale: 1.05,
                    transition: { duration: 0.3 }
                  }}
                >
                  <img 
                    src="/undraw_world_bdnk.svg" 
                    alt="Global learning illustration" 
                    className="w-full max-w-md h-auto"
                  />
                </motion.div>
                
                {/* Decorative Elements */}
                <motion.div 
                  style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "30%"]) }}
                  className="absolute -top-8 -left-8 w-24 h-24 bg-orange-200/30 rounded-full blur-xl"
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.3, 0.6, 0.3]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                />
                <motion.div 
                  style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "-25%"]) }}
                  className="absolute -bottom-8 -right-8 w-32 h-32 bg-yellow-200/30 rounded-full blur-xl"
                  animate={{ 
                    scale: [1.2, 1, 1.2],
                    opacity: [0.4, 0.7, 0.4]
                  }}
                  transition={{ duration: 5, repeat: Infinity, delay: 1 }}
                />
                
                {/* Additional floating elements */}
                <motion.div 
                  style={{ y: useTransform(scrollYProgress, [0, 1], ["0%", "40%"]) }}
                  className="absolute top-16 -right-4 w-16 h-16 bg-orange-200/20 rounded-full blur-lg"
                  animate={{ 
                    y: [0, -20, 0],
                    opacity: [0.2, 0.5, 0.2]
                  }}
                  transition={{ duration: 6, repeat: Infinity, delay: 2 }}
                />
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Additional spacing to match laptop size */}
        <div className="h-32" />
    </section>
  );
}

// Footer
function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Lumos</h3>
                <p className="text-gray-400">AI Tutoring Platform</p>
              </div>
            </div>
            <p className="text-gray-400 mb-4">
              Empowering Malaysian students to excel academically with personalized, 
              24/7 tutoring support.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="#subjects" className="hover:text-orange-400 transition-colors">Subjects</Link></li>
              <li><Link href="/web/login" className="hover:text-orange-400 transition-colors">Login</Link></li>
              <li><Link href="/web/signup" className="hover:text-orange-400 transition-colors">Sign Up</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400">
              <li>support@lumos.edu.my</li>
              <li>+60 12-345 6789</li>
              <li>Kuala Lumpur, Malaysia</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 Lumos. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

// Main Component
export default function HomePage() {
  return (
    <>
      {/* <SmoothScroll /> */}
      <HeroSection />
      <MissionSection />
      <SubjectsSection />
      <HowItWorksSection />
      <FeaturesSection />
      <Footer />
    </>
  );
}