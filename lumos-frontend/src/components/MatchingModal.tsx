'use client';

import { useEffect, useState } from 'react';
import { useTimebank } from '@/contexts/TimebankContext';
import { X, Users, Clock, Search, Zap } from 'lucide-react';

export default function MatchingModal() {
  const { isMatching, matchingActivity, cancelMatching } = useTimebank();
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('Searching for students...');

  const steps = [
    'Searching for students...',
    'Found 3 potential matches',
    'Checking availability...',
    'Confirming best match...',
    'Match found!'
  ];

  useEffect(() => {
    if (!isMatching) {
      setProgress(0);
      setCurrentStep(steps[0]);
      return;
    }

    const duration = 4000; // 4 seconds total
    const interval = duration / 100;
    let currentProgress = 0;

    const timer = setInterval(() => {
      currentProgress += 1;
      setProgress(currentProgress);

      // Update step based on progress
      if (currentProgress < 20) {
        setCurrentStep(steps[0]);
      } else if (currentProgress < 40) {
        setCurrentStep(steps[1]);
      } else if (currentProgress < 70) {
        setCurrentStep(steps[2]);
      } else if (currentProgress < 95) {
        setCurrentStep(steps[3]);
      } else {
        setCurrentStep(steps[4]);
      }

      if (currentProgress >= 100) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isMatching]);

  if (!isMatching) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-200/30 to-pink-200/30 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-yellow-200/30 to-orange-200/30 rounded-full blur-xl"></div>
        
        {/* Close button */}
        <button
          onClick={cancelMatching}
          className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-xl transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>

        {/* Content */}
        <div className="relative z-10 text-center">
          {/* Icon */}
          <div className="mx-auto mb-6 w-20 h-20 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center relative">
            <Search className="w-8 h-8 text-white animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-pink-500 rounded-2xl animate-ping opacity-20"></div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Finding Students to Help
          </h2>
          
          {/* Activity */}
          <p className="text-lg text-orange-600 font-medium mb-6">
            {matchingActivity}
          </p>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="w-full bg-gray-200 rounded-full h-3 mb-3">
              <div 
                className="bg-gradient-to-r from-orange-500 to-pink-500 h-3 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-gray-600 text-sm font-medium">{currentStep}</p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-center gap-2 text-blue-600 mb-2">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-blue-900">47</div>
              <div className="text-xs text-blue-700">Students online</div>
            </div>
            
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-center justify-center gap-2 text-green-600 mb-2">
                <Clock className="w-5 h-5" />
              </div>
              <div className="text-2xl font-bold text-green-900">2.3</div>
              <div className="text-xs text-green-700">Avg wait time (min)</div>
            </div>
          </div>

          {/* Cancel Button */}
          <button
            onClick={cancelMatching}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-6 rounded-xl transition-colors"
          >
            Cancel Search
          </button>

          {/* Tips */}
          <div className="mt-6 p-4 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl border border-yellow-200">
            <div className="flex items-center gap-2 text-yellow-700 mb-2">
              <Zap className="w-4 h-4" />
              <span className="font-medium text-sm">Pro Tip</span>
            </div>
            <p className="text-xs text-yellow-700">
              Make sure you're available for at least 15 minutes to help your matched student!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
