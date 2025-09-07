"use client";

import { useState, useEffect } from "react";
import { StudyPack } from "@/types/study";
import StepRunner from "./StepRunner";
import { BookOpen, Zap, Target, Upload } from "lucide-react";
import dynamic from "next/dynamic";
import { parsePdfAnalysisToStudyPack } from "@/lib/pdf-to-study-pack";

// Dynamically import PdfUploader to prevent SSR issues
const PdfUploader = dynamic(() => import("./PdfUploader"), {
  ssr: false,
  loading: () => (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-orange-200 rounded-xl p-6 text-center">
        <div className="text-sm text-gray-500">Loading PDF uploader...</div>
      </div>
    </div>
  )
});

interface PracticePanelProps {
  studyPack?: StudyPack | null;
  selectedTopic?: string | null;
  teachingMode?: boolean;
  availableTopics?: string[];
  pdfAnalysis?: string;
  onTopicCompletion?: (topic: string) => void;
}

// Demo data for immediate testing
const demoStudyPack: StudyPack = {
  topic: "Java Object-Oriented Programming",
  subtopics: ["Classes", "Inheritance", "Polymorphism", "Encapsulation", "Abstraction"],
  questions: [
    {
      id: "q1",
      subtopic: "Classes",
      difficulty: 1,
      type: "mcq",
      prompt: "What does a class define in Java?",
      options: ["A file", "An object's blueprint", "A package", "A library"],
      answer: 1,
      solution: "A class defines the blueprint (fields + methods) for objects."
    },
    {
      id: "q2",
      subtopic: "Classes",
      difficulty: 2,
      type: "mcq",
      prompt: "Which keyword is used to create a new instance of a class?",
      options: ["new", "create", "instance", "object"],
      answer: 0,
      solution: "The 'new' keyword is used to create a new instance of a class."
    },
    {
      id: "q3",
      subtopic: "Inheritance",
      difficulty: 2,
      type: "mcq",
      prompt: "What keyword is used for inheritance in Java?",
      options: ["extends", "inherits", "implements", "derives"],
      answer: 0,
      solution: "The 'extends' keyword is used for class inheritance in Java."
    },
    {
      id: "q4",
      subtopic: "Inheritance",
      difficulty: 3,
      type: "open",
      prompt: "Explain the concept of method overriding in Java inheritance.",
      answer: "Method overriding allows a subclass to provide a specific implementation of a method that is already defined in its parent class.",
      solution: "Method overriding occurs when a subclass provides its own implementation of a method that exists in the parent class, using the same method signature."
    },
    {
      id: "q5",
      subtopic: "Polymorphism",
      difficulty: 3,
      type: "mcq",
      prompt: "Which type of polymorphism is achieved through method overriding?",
      options: ["Compile-time", "Runtime", "Static", "Dynamic binding"],
      answer: 1,
      solution: "Runtime polymorphism is achieved through method overriding, where the method to be called is determined at runtime."
    },
    {
      id: "q6",
      subtopic: "Polymorphism",
      difficulty: 4,
      type: "code",
      prompt: "Write a simple example demonstrating polymorphism with a Shape class and its subclasses.",
      answer: "class Shape { void draw() { System.out.println(\"Drawing shape\"); } } class Circle extends Shape { void draw() { System.out.println(\"Drawing circle\"); } }",
      solution: "Polymorphism allows objects of different types to be treated as objects of a common base type, with the correct method being called based on the actual object type."
    },
    {
      id: "q7",
      subtopic: "Encapsulation",
      difficulty: 2,
      type: "mcq",
      prompt: "What is the purpose of encapsulation in OOP?",
      options: ["Code reusability", "Data hiding", "Inheritance", "Polymorphism"],
      answer: 1,
      solution: "Encapsulation is about data hiding - keeping the internal state of an object private and only allowing access through public methods."
    },
    {
      id: "q8",
      subtopic: "Encapsulation",
      difficulty: 4,
      type: "open",
      prompt: "How do you achieve encapsulation in Java?",
      answer: "By declaring fields as private and providing public getter and setter methods to access and modify them.",
      solution: "Encapsulation is achieved by making fields private and providing controlled access through public methods (getters/setters)."
    },
    {
      id: "q9",
      subtopic: "Abstraction",
      difficulty: 3,
      type: "mcq",
      prompt: "Which keyword is used to create abstract classes in Java?",
      options: ["abstract", "virtual", "interface", "abstract class"],
      answer: 0,
      solution: "The 'abstract' keyword is used to declare abstract classes in Java."
    },
    {
      id: "q10",
      subtopic: "Abstraction",
      difficulty: 5,
      type: "code",
      prompt: "Create an abstract class 'Animal' with an abstract method 'makeSound()' and a concrete subclass 'Dog'.",
      answer: "abstract class Animal { abstract void makeSound(); } class Dog extends Animal { void makeSound() { System.out.println(\"Woof!\"); } }",
      solution: "Abstract classes provide a common interface for subclasses while allowing some methods to be left unimplemented (abstract)."
    }
  ]
};

export default function PracticePanel({ studyPack, selectedTopic, teachingMode, availableTopics, pdfAnalysis, onTopicCompletion }: PracticePanelProps) {
  const [selectedPack, setSelectedPack] = useState<StudyPack | null>(studyPack || demoStudyPack);
  const [showPdfUploader, setShowPdfUploader] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePdfProcessed = (studyPack: StudyPack) => {
    setSelectedPack(studyPack);
    setShowPdfUploader(false);
    setError(null);
  };

  // Function to convert PDF analysis to study pack
  const convertPdfAnalysisToStudyPack = (analysis: string) => {
    try {
      const studyPack = parsePdfAnalysisToStudyPack(analysis);
      setSelectedPack(studyPack);
      setError(null);
    } catch (error) {
      console.error('Error converting PDF analysis:', error);
      setError('Failed to process PDF analysis');
    }
  };

  // Generate structured questions for selected topic
  const generateTopicQuestions = (topic: string): StudyPack => {
    const questions: any[] = [];
    
    // Generate 10 questions per level (6 levels total)
    for (let level = 1; level <= 6; level++) {
      // 5 MCQ questions per level (first)
      for (let i = 1; i <= 5; i++) {
        const mcqData = generateMCQQuestion(topic, level, i);
        questions.push({
          id: `q-${level}-mcq-${i}`,
          subtopic: topic,
          difficulty: level as 1 | 2 | 3 | 4 | 5 | 6,
          type: "mcq" as const,
          prompt: mcqData.prompt,
          options: mcqData.options,
          answer: mcqData.answer,
          solution: mcqData.solution
        });
      }
      
      // 3 Short answer questions per level (second)
      for (let i = 1; i <= 3; i++) {
        const shortData = generateShortQuestion(topic, level, i);
        questions.push({
          id: `q-${level}-short-${i}`,
          subtopic: topic,
          difficulty: level as 1 | 2 | 3 | 4 | 5 | 6,
          type: "open" as const,
          prompt: shortData.prompt,
          answer: shortData.answer,
          solution: shortData.solution
        });
      }
      
      // 2 Deep learning questions per level (third)
      for (let i = 1; i <= 2; i++) {
        const deepData = generateDeepQuestion(topic, level, i);
        questions.push({
          id: `q-${level}-deep-${i}`,
          subtopic: topic,
          difficulty: level as 1 | 2 | 3 | 4 | 5 | 6,
          type: "code" as const,
          prompt: deepData.prompt,
          answer: deepData.answer,
          solution: deepData.solution
        });
      }
    }
    
    return {
      topic: topic,
      subtopics: [topic],
      questions: questions
    };
  };

  // Generate MCQ questions with real content
  const generateMCQQuestion = (topic: string, level: number, questionNum: number) => {
    const questionTemplates = {
      "Introduction to Linux": {
        1: [
          { prompt: "What is Linux?", options: ["A proprietary operating system", "An open-source operating system", "A programming language", "A database system"], answer: 1, solution: "Linux is an open-source operating system based on Unix." },
          { prompt: "Who created Linux?", options: ["Bill Gates", "Steve Jobs", "Linus Torvalds", "Richard Stallman"], answer: 2, solution: "Linus Torvalds created the Linux kernel in 1991." },
          { prompt: "What does 'open source' mean?", options: ["Free to use", "Source code is publicly available", "No support available", "Only for developers"], answer: 1, solution: "Open source means the source code is publicly available for anyone to view, modify, and distribute." },
          { prompt: "Which of these is NOT a Linux distribution?", options: ["Ubuntu", "Fedora", "Windows", "Debian"], answer: 2, solution: "Windows is a Microsoft operating system, not a Linux distribution." },
          { prompt: "What is the Linux kernel?", options: ["A type of file", "The core of the operating system", "A user interface", "A programming tool"], answer: 1, solution: "The kernel is the core component that manages system resources and hardware." }
        ],
        2: [
          { prompt: "What is the default shell in most Linux systems?", options: ["PowerShell", "CMD", "Bash", "Python"], answer: 2, solution: "Bash (Bourne Again Shell) is the default shell in most Linux distributions." },
          { prompt: "Which command lists files in a directory?", options: ["dir", "list", "ls", "show"], answer: 2, solution: "The 'ls' command lists files and directories in the current location." },
          { prompt: "What does 'cd' command do?", options: ["Create directory", "Change directory", "Copy directory", "Delete directory"], answer: 1, solution: "The 'cd' command changes the current directory." },
          { prompt: "Which symbol represents the home directory?", options: ["@", "~", "#", "$"], answer: 1, solution: "The tilde (~) symbol represents the user's home directory." },
          { prompt: "What is the root directory in Linux?", options: ["/home", "/", "/root", "/usr"], answer: 1, solution: "The root directory is represented by '/' and contains all other directories." }
        ]
      }
    };

    const topicData = questionTemplates[topic as keyof typeof questionTemplates];
    if (topicData && topicData[level as keyof typeof topicData]) {
      const levelQuestions = topicData[level as keyof typeof topicData];
      const questionIndex = (questionNum - 1) % levelQuestions.length;
      return levelQuestions[questionIndex];
    }

    // Fallback for unknown topics
    return {
      prompt: `What is a key concept in ${topic} at level ${level}?`,
      options: [
        `Basic understanding of ${topic}`,
        `Advanced features of ${topic}`,
        `Common mistakes in ${topic}`,
        `Best practices for ${topic}`
      ],
      answer: 0,
      solution: `This question tests your understanding of ${topic} at level ${level}.`
    };
  };

  // Generate short answer questions
  const generateShortQuestion = (topic: string, level: number, questionNum: number) => {
    const shortTemplates = {
      "Introduction to Linux": {
        1: [
          { prompt: "Explain what makes Linux different from Windows.", answer: "Linux is open-source, free, more secure, and highly customizable compared to Windows.", solution: "Linux is open-source (source code is freely available), free to use, generally more secure due to fewer viruses, and highly customizable for different needs." },
          { prompt: "Describe the benefits of using Linux.", answer: "Linux offers cost savings, security, customization, and stability.", solution: "Benefits include: no licensing costs, better security, high customization, stability, and access to powerful command-line tools." },
          { prompt: "What is a Linux distribution?", answer: "A Linux distribution is a complete operating system built around the Linux kernel.", solution: "A Linux distribution (distro) is a complete operating system that includes the Linux kernel plus software packages, desktop environment, and package manager." }
        ]
      }
    };

    const topicData = shortTemplates[topic as keyof typeof shortTemplates];
    if (topicData && topicData[level as keyof typeof topicData]) {
      const levelQuestions = topicData[level as keyof typeof topicData];
      const questionIndex = (questionNum - 1) % levelQuestions.length;
      return levelQuestions[questionIndex];
    }

    // Fallback
    return {
      prompt: `Explain a key aspect of ${topic} at level ${level}.`,
      answer: `Key aspect of ${topic} involves understanding the fundamental concepts.`,
      solution: `This question requires you to demonstrate your understanding of ${topic} concepts.`
    };
  };

  // Generate deep learning questions
  const generateDeepQuestion = (topic: string, level: number, questionNum: number) => {
    const deepTemplates = {
      "Introduction to Linux": {
        1: [
          { prompt: "Create a simple shell script that displays 'Hello, Linux!' and explain each part.", answer: "#!/bin/bash\necho 'Hello, Linux!'", solution: "The script starts with shebang (#!/bin/bash) to specify the interpreter, then uses echo command to display text." },
          { prompt: "Demonstrate how to navigate to your home directory and list hidden files.", answer: "cd ~\nls -la", solution: "Use 'cd ~' to go to home directory and 'ls -la' to list all files including hidden ones (starting with .)." }
        ]
      }
    };

    const topicData = deepTemplates[topic as keyof typeof deepTemplates];
    if (topicData && topicData[level as keyof typeof topicData]) {
      const levelQuestions = topicData[level as keyof typeof topicData];
      const questionIndex = (questionNum - 1) % levelQuestions.length;
      return levelQuestions[questionIndex];
    }

    // Fallback
    return {
      prompt: `Demonstrate your understanding of ${topic} with a practical example.`,
      answer: `Practical example demonstrating ${topic} concepts.`,
      solution: `This question tests your ability to apply ${topic} knowledge practically.`
    };
  };

  // Generate questions from PDF analysis
  const generateQuestionsFromPdfAnalysis = (analysis: string, topic: string): StudyPack => {
    try {
      // Use the existing PDF analysis parser
      const studyPack = parsePdfAnalysisToStudyPack(analysis);
      
      // Filter questions for the selected topic
      const topicQuestions = studyPack.questions.filter(q => 
        q.subtopic.toLowerCase().includes(topic.toLowerCase()) ||
        topic.toLowerCase().includes(q.subtopic.toLowerCase())
      );
      
      if (topicQuestions.length > 0) {
        return {
          topic: topic,
          subtopics: [topic],
          questions: topicQuestions
        };
      }
      
      // If no questions found for the topic, generate some basic ones
      return generateTopicQuestions(topic);
    } catch (error) {
      console.error('Error generating questions from PDF analysis:', error);
      return generateTopicQuestions(topic);
    }
  };

  // Update study pack when topic is selected
  useEffect(() => {
    if (selectedTopic && teachingMode && pdfAnalysis) {
      // Use PDF analysis to generate questions for the selected topic
      const topicPack = generateQuestionsFromPdfAnalysis(pdfAnalysis, selectedTopic);
      setSelectedPack(topicPack);
    } else if (selectedTopic && teachingMode) {
      // Fallback to hardcoded templates if no PDF analysis
      const topicPack = generateTopicQuestions(selectedTopic);
      setSelectedPack(topicPack);
    }
  }, [selectedTopic, teachingMode, pdfAnalysis]);

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setShowPdfUploader(false);
  };

  return (
    <div className="h-fit sticky top-4 space-y-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-xl p-4 text-white">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-6 h-6" />
          <h2 className="text-lg font-bold">
            {teachingMode && selectedTopic ? `Learning: ${selectedTopic}` : "Adaptive Practice"}
          </h2>
        </div>
        <p className="text-orange-100 text-sm">
          {teachingMode && selectedTopic 
            ? `Master ${selectedTopic} with 6 levels of questions` 
            : "Choose a topic to start practicing"}
        </p>
      </div>

      {/* Learning Structure - Only show when in teaching mode */}
      {selectedPack && teachingMode && selectedTopic && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-orange-200 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-orange-600" />
            <span className="font-semibold text-gray-900">Learning Structure</span>
          </div>
          <div className="space-y-3">
            <div className="text-sm text-slate-600">
              <strong>{selectedTopic}</strong> - 6 levels of mastery
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-blue-50 p-2 rounded-lg">
                <div className="font-medium text-blue-800">Per Level:</div>
                <div className="text-blue-600">5 MCQ + 3 Short + 2 Deep</div>
              </div>
              <div className="bg-green-50 p-2 rounded-lg">
                <div className="font-medium text-green-800">Total:</div>
                <div className="text-green-600">60 Questions</div>
              </div>
            </div>
            <div className="text-xs text-slate-500">
              Master each level before advancing to the next!
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center gap-2 text-red-700">
            <span className="text-sm font-medium">Error:</span>
            <span className="text-sm">{error}</span>
          </div>
        </div>
      )}

      {/* PDF Uploader */}
      {showPdfUploader ? (
        <PdfUploader 
          onPdfProcessed={handlePdfProcessed}
          onError={handleError}
        />
      ) : selectedPack ? (
        <StepRunner 
          pack={selectedPack} 
          onPackUpdate={(updatedPack) => setSelectedPack(updatedPack)}
          onTopicCompletion={onTopicCompletion}
          selectedTopic={selectedTopic}
          pdfAnalysis={pdfAnalysis}
        />
      ) : (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-orange-200 p-6 text-center">
          <Zap className="w-12 h-12 text-orange-400 mx-auto mb-3" />
          <h3 className="font-semibold text-gray-900 mb-2">Ready to Practice?</h3>
          <p className="text-gray-600 text-sm mb-4">
            Upload a PDF or use the demo content to start practicing.
          </p>
          <div className="flex gap-2 justify-center">
            <button 
              onClick={() => setShowPdfUploader(true)}
              className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              <Upload className="w-4 h-4" />
              Upload PDF
            </button>
            <button 
              onClick={() => setSelectedPack(demoStudyPack)}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              Use Demo
            </button>
            <button 
              onClick={() => {
                // Test with the Linux analysis you provided
                const linuxAnalysis = `Content Overview The document titled "The Ultimate Linux Newbie Guide" serves as an introductory resource for individuals new to the Linux operating system. It covers essential concepts, commands, and system administration tasks critical for beginners.

Learning Topics
Introduction to Linux
Installing Linux
Navigating the Linux File System
Basic Linux Commands
File Permissions and Ownership
Text Editing in Linux
Package Management
Shell Scripting Basics
System Administration Fundamentals
Networking and Security Basics

Practice Questions
Introduction to Linux
Q1: What is an operating system? (Easy)
Q2: List three benefits of using Linux. (Moderate)
Installing Linux
Q1: Describe the steps to install Linux on a PC. (Easy)
Q2: What considerations should be made before installation? (Moderate)
Basic Linux Commands
Q1: What does the ls command do? (Easy)
Q2: Write a command to create a new directory named "test". (Moderate)`;
                convertPdfAnalysisToStudyPack(linuxAnalysis);
              }}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Test Linux
            </button>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200 p-4">
        <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
          Pro Tips
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Questions adapt to your mastery level</li>
          <li>• Focus on your weakest topics first</li>
          <li>• Review solutions to learn effectively</li>
          <li>• Progress is saved automatically</li>
        </ul>
      </div>
    </div>
  );
}
