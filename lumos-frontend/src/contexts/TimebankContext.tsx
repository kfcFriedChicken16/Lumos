'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useCredits } from './CreditContext';

// Types
export interface Transaction {
  id: string;
  type: 'earned' | 'spent';
  amount: number;
  activity: string;
  student: string;
  date: string;
  rating: number;
  description?: string;
}

export interface TutoringSession {
  id: string;
  subject: string;
  studentName: string;
  duration: number; // in minutes
  status: 'active' | 'completed' | 'cancelled';
  startTime: string;
  endTime?: string;
  rating?: number;
  feedback?: string;
  creditsEarned?: number;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface TimebankContextType {
  // Credit Management
  creditBalance: number;
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date'>) => void;
  
  // Session Management
  activeSession: TutoringSession | null;
  sessionHistory: TutoringSession[];
  startSession: (subject: string, studentName: string) => void;
  endSession: (rating: number, feedback?: string) => void;
  
  // Notifications
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  
  // Matching System
  isMatching: boolean;
  matchingActivity: string | null;
  startMatching: (activity: string) => Promise<void>;
  cancelMatching: () => void;
  
  // User Skills
  tutorSkills: string[];
  updateTutorSkills: (skills: string[]) => void;
  learningGoals: string[];
  updateLearningGoals: (goals: string[]) => void;
}

const TimebankContext = createContext<TimebankContextType | undefined>(undefined);

export const useTimebank = () => {
  const context = useContext(TimebankContext);
  if (context === undefined) {
    throw new Error('useTimebank must be used within a TimebankProvider');
  }
  return context;
};

// Initial mock data
const initialTransactions: Transaction[] = [
  {
    id: '1',
    type: 'earned',
    amount: 30,
    activity: 'Tutored Calculus',
    student: 'Sarah M.',
    date: '2 hours ago',
    rating: 5,
    description: 'Helped with integration techniques'
  },
  {
    id: '2',
    type: 'spent',
    amount: -15,
    activity: 'Got help with Physics',
    student: 'Ahmad R.',
    date: '1 day ago',
    rating: 4,
    description: 'Quantum mechanics basics'
  },
  {
    id: '3',
    type: 'earned',
    amount: 45,
    activity: 'Led Study Group - Statistics',
    student: '6 students',
    date: '2 days ago',
    rating: 5,
    description: 'Probability distributions workshop'
  }
];

const initialSessionHistory: TutoringSession[] = [
  {
    id: 'session-1',
    subject: 'Calculus',
    studentName: 'Sarah M.',
    duration: 30,
    status: 'completed',
    startTime: '2024-01-15T14:00:00Z',
    endTime: '2024-01-15T14:30:00Z',
    rating: 5,
    feedback: 'Great explanation of integration!',
    creditsEarned: 30
  },
  {
    id: 'session-2',
    subject: 'Statistics',
    studentName: 'Multiple students',
    duration: 45,
    status: 'completed',
    startTime: '2024-01-13T16:00:00Z',
    endTime: '2024-01-13T16:45:00Z',
    rating: 5,
    feedback: 'Very helpful group session',
    creditsEarned: 45
  }
];

export const TimebankProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Use global credit context instead of local state
  const { creditBalance, addCredits } = useCredits();
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [activeSession, setActiveSession] = useState<TutoringSession | null>(null);
  const [sessionHistory, setSessionHistory] = useState<TutoringSession[]>(initialSessionHistory);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isMatching, setIsMatching] = useState(false);
  const [matchingActivity, setMatchingActivity] = useState<string | null>(null);
  const [tutorSkills, setTutorSkills] = useState<string[]>(['Mathematics', 'Physics']);
  const [learningGoals, setLearningGoals] = useState<string[]>(['Advanced Calculus', 'Quantum Physics']);

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const savedBalance = localStorage.getItem('lumos_credit_balance');
      const savedTransactions = localStorage.getItem('lumos_transactions');
      const savedSessions = localStorage.getItem('lumos_sessions');
      const savedSkills = localStorage.getItem('lumos_tutor_skills');
      const savedGoals = localStorage.getItem('lumos_learning_goals');

      // Note: Credit balance is now managed by CreditContext, so we don't load from localStorage here
      if (savedTransactions) setTransactions(JSON.parse(savedTransactions));
      if (savedSessions) setSessionHistory(JSON.parse(savedSessions));
      if (savedSkills) setTutorSkills(JSON.parse(savedSkills));
      if (savedGoals) setLearningGoals(JSON.parse(savedGoals));
    } catch (error) {
      console.error('Error loading timebank data from localStorage:', error);
    }
  }, []);

  // Save to localStorage when data changes
  // Note: Credit balance is now managed by CreditContext

  useEffect(() => {
    localStorage.setItem('lumos_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('lumos_sessions', JSON.stringify(sessionHistory));
  }, [sessionHistory]);

  useEffect(() => {
    localStorage.setItem('lumos_tutor_skills', JSON.stringify(tutorSkills));
  }, [tutorSkills]);

  useEffect(() => {
    localStorage.setItem('lumos_learning_goals', JSON.stringify(learningGoals));
  }, [learningGoals]);

  // Transaction management
  const addTransaction = (transaction: Omit<Transaction, 'id' | 'date'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: `transaction-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      date: new Date().toLocaleString()
    };

    setTransactions(prev => [newTransaction, ...prev]);
    addCredits(transaction.amount);

    // Add notification
    addNotification({
      type: transaction.type === 'earned' ? 'success' : 'info',
      title: transaction.type === 'earned' ? 'Credits Earned!' : 'Credits Spent',
      message: `${transaction.type === 'earned' ? '+' : ''}${transaction.amount} credits for ${transaction.activity}`
    });
  };

  // Session management
  const startSession = (subject: string, studentName: string) => {
    const newSession: TutoringSession = {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      subject,
      studentName,
      duration: 0,
      status: 'active',
      startTime: new Date().toISOString()
    };

    setActiveSession(newSession);
    addNotification({
      type: 'info',
      title: 'Session Started',
      message: `You're now tutoring ${studentName} in ${subject}`
    });
  };

  const endSession = (rating: number, feedback?: string) => {
    if (!activeSession) return;

    const endTime = new Date();
    const startTime = new Date(activeSession.startTime);
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60)); // minutes
    const creditsEarned = Math.max(1, Math.round(duration * 0.8)); // ~0.8 credits per minute

    const completedSession: TutoringSession = {
      ...activeSession,
      status: 'completed',
      endTime: endTime.toISOString(),
      duration,
      rating,
      feedback,
      creditsEarned
    };

    setSessionHistory(prev => [completedSession, ...prev]);
    setActiveSession(null);

    // Add transaction for credits earned
    addTransaction({
      type: 'earned',
      amount: creditsEarned,
      activity: `Tutored ${activeSession.subject}`,
      student: activeSession.studentName,
      rating,
      description: feedback
    });
  };

  // Notification management
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      read: false
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // Keep only 10 recent notifications
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notif => notif.id === id ? { ...notif, read: true } : notif)
    );
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  // Matching system
  const startMatching = async (activity: string): Promise<void> => {
    setIsMatching(true);
    setMatchingActivity(activity);

    // Simulate matching process
    await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000)); // 2-5 seconds

    setIsMatching(false);
    setMatchingActivity(null);

    // Simulate successful match
    const studentNames = ['Emma Chen', 'Ahmad Rahman', 'Priya Patel', 'Jake Smith', 'Sofia Garcia'];
    const randomStudent = studentNames[Math.floor(Math.random() * studentNames.length)];
    
    const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English'];
    const randomSubject = subjects[Math.floor(Math.random() * subjects.length)];

    startSession(randomSubject, randomStudent);
  };

  const cancelMatching = () => {
    setIsMatching(false);
    setMatchingActivity(null);
    addNotification({
      type: 'info',
      title: 'Matching Cancelled',
      message: 'You stopped looking for students to help'
    });
  };

  // Skills management
  const updateTutorSkills = (skills: string[]) => {
    setTutorSkills(skills);
    addNotification({
      type: 'success',
      title: 'Skills Updated',
      message: `You can now tutor in ${skills.length} subjects`
    });
  };

  const updateLearningGoals = (goals: string[]) => {
    setLearningGoals(goals);
    addNotification({
      type: 'success',
      title: 'Learning Goals Updated',
      message: `Added ${goals.length} subjects to your learning goals`
    });
  };

  const value: TimebankContextType = {
    creditBalance,
    transactions,
    addTransaction,
    activeSession,
    sessionHistory,
    startSession,
    endSession,
    notifications,
    addNotification,
    markNotificationRead,
    clearNotifications,
    isMatching,
    matchingActivity,
    startMatching,
    cancelMatching,
    tutorSkills,
    updateTutorSkills,
    learningGoals,
    updateLearningGoals
  };

  return (
    <TimebankContext.Provider value={value}>
      {children}
    </TimebankContext.Provider>
  );
};
