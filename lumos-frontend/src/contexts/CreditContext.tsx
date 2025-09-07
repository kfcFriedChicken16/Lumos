"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface CreditContextType {
  creditBalance: number;
  setCreditBalance: (balance: number) => void;
  deductCredits: (amount: number) => void;
  addCredits: (amount: number) => void;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

export function CreditProvider({ children }: { children: ReactNode }) {
  const [creditBalance, setCreditBalance] = useState(25); // Demo: starting with 25 credits

  const deductCredits = (amount: number) => {
    setCreditBalance(prev => Math.max(0, prev - amount));
  };

  const addCredits = (amount: number) => {
    setCreditBalance(prev => prev + amount);
  };

  return (
    <CreditContext.Provider value={{
      creditBalance,
      setCreditBalance,
      deductCredits,
      addCredits,
    }}>
      {children}
    </CreditContext.Provider>
  );
}

export function useCredits() {
  const context = useContext(CreditContext);
  if (context === undefined) {
    throw new Error('useCredits must be used within a CreditProvider');
  }
  return context;
}
