"use client";

import React, { useState, useEffect } from 'react';
import { Preferences } from '@/contexts/PreferencesContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  GraduationCap, 
  BookOpen, 
  Brain, 
  MessageCircle, 
  Clock, 
  Heart, 
  Settings,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface PreferencesFormProps {
  initial?: Preferences | null;
  onSave: (prefs: Preferences) => void;
  onCancel?: () => void;
}

// University subjects options
const SUBJECT_OPTIONS = [
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
  'Engineering', 'Business', 'Economics', 'Accounting', 'Marketing',
  'Medicine', 'Nursing', 'Psychology', 'Sociology', 'English',
  'Bahasa Malaysia', 'History', 'Geography', 'Art', 'Music',
  'Sports Science', 'Law', 'Architecture', 'Design', 'Other'
];

// Malaysian universities
const UNIVERSITIES = [
  'UM', 'USM', 'UTM', 'UPM', 'UUM', 'UTAR', 'MMU', 'Taylor\'s', 'Sunway', 'Other'
];

// Majors
const MAJORS = [
  'Engineering', 'Business', 'Medicine', 'Arts', 'Science', 
  'Computer Science', 'Law', 'Architecture', 'Design', 'Other'
];

export default function PreferencesForm({ initial, onSave, onCancel }: PreferencesFormProps) {
  const [prefs, setPrefs] = useState<Preferences>({
    year: "Year 1",
    major: "Computer Science",
    university: "UM",
    studyGoals: "exam_prep",
    subjects: [],
    explanationStyle: "step-by-step",
    difficultyStart: "beginner",
    responseStyle: "encouraging",
    language: "English",
    studyTime: "evening",
    sessionLength: "30min",
    confidenceLevel: "medium",
    needEncouragement: true,
    preferStepByStep: true,
    likeExamples: true,
    voiceEnabled: false,
    notifications: true,
    darkMode: false,
    ...initial
  });

  // State for custom "Other" inputs
  const [customMajor, setCustomMajor] = useState(initial?.major && !MAJORS.includes(initial.major) ? initial.major : "");
  const [customUniversity, setCustomUniversity] = useState(initial?.university && !UNIVERSITIES.includes(initial.university) ? initial.university : "");

  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 6;

  const handleSave = () => {
    // Use custom values if "Other" is selected
    const finalPrefs = {
      ...prefs,
      major: prefs.major === "Other" && customMajor ? customMajor : prefs.major,
      university: prefs.university === "Other" && customUniversity ? customUniversity : prefs.university,
    };
    onSave(finalPrefs);
  };

  const handleSubjectToggle = (subject: string) => {
    setPrefs(prev => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter(s => s !== subject)
        : [...prev.subjects, subject]
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: 
        return prefs.year && prefs.major && prefs.university && 
               (prefs.major !== "Other" || customMajor.trim()) &&
               (prefs.university !== "Other" || customUniversity.trim());
      case 1: return prefs.subjects.length > 0 && prefs.studyGoals;
      case 2: return prefs.explanationStyle && prefs.difficultyStart;
      case 3: return prefs.responseStyle && prefs.language;
      case 4: return prefs.studyTime && prefs.sessionLength;
      case 5: return true; // Final step is just confirmation
      default: return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <GraduationCap className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900">Academic Information</h3>
              <p className="text-gray-600">Tell us about your university background</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
                <select
                  value={prefs.year}
                  onChange={(e) => setPrefs(prev => ({ ...prev, year: e.target.value as any }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="Year 1">Year 1</option>
                  <option value="Year 2">Year 2</option>
                  <option value="Year 3">Year 3</option>
                  <option value="Year 4">Year 4</option>
                  <option value="Postgrad">Postgraduate</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Major/Field of Study</label>
                <select
                  value={prefs.major}
                  onChange={(e) => setPrefs(prev => ({ ...prev, major: e.target.value as any }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  {MAJORS.map(major => (
                    <option key={major} value={major}>{major}</option>
                  ))}
                </select>
                {prefs.major === "Other" && (
                  <div className="mt-2">
                    <Input
                      type="text"
                      placeholder="Please specify your major/field of study"
                      value={customMajor}
                      onChange={(e) => setCustomMajor(e.target.value)}
                      className={`w-full ${!customMajor.trim() ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {!customMajor.trim() && (
                      <p className="text-red-500 text-xs mt-1">Please specify your major/field of study</p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">University</label>
                <select
                  value={prefs.university}
                  onChange={(e) => setPrefs(prev => ({ ...prev, university: e.target.value as any }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  {UNIVERSITIES.map(uni => (
                    <option key={uni} value={uni}>{uni}</option>
                  ))}
                </select>
                {prefs.university === "Other" && (
                  <div className="mt-2">
                    <Input
                      type="text"
                      placeholder="Please specify your university"
                      value={customUniversity}
                      onChange={(e) => setCustomUniversity(e.target.value)}
                      className={`w-full ${!customUniversity.trim() ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {!customUniversity.trim() && (
                      <p className="text-red-500 text-xs mt-1">Please specify your university</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <BookOpen className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900">Study Focus</h3>
              <p className="text-gray-600">What subjects do you need help with?</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Subjects (Select all that apply)</label>
                <div className="grid grid-cols-2 gap-2">
                  {SUBJECT_OPTIONS.map(subject => (
                    <button
                      key={subject}
                      onClick={() => handleSubjectToggle(subject)}
                      className={`p-3 text-sm rounded-lg border transition-all ${
                        prefs.subjects.includes(subject)
                          ? 'bg-orange-50 border-orange-300 text-orange-700'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {subject}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Primary Study Goal</label>
                <select
                  value={prefs.studyGoals}
                  onChange={(e) => setPrefs(prev => ({ ...prev, studyGoals: e.target.value as any }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="exam_prep">Exam Preparation</option>
                  <option value="assignment_help">Assignment Help</option>
                  <option value="research">Research Support</option>
                  <option value="career_prep">Career Preparation</option>
                  <option value="skill_building">Skill Building</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Brain className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900">Learning Style</h3>
              <p className="text-gray-600">How do you prefer to learn?</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Explanation Style</label>
                <div className="space-y-2">
                  {[
                    { value: "step-by-step", label: "Step-by-step", desc: "Detailed, sequential explanations" },
                    { value: "conceptual", label: "Conceptual", desc: "Focus on understanding principles" },
                    { value: "examples-heavy", label: "Examples-heavy", desc: "Lots of practical examples" },
                    { value: "quick-reference", label: "Quick Reference", desc: "Concise, to-the-point answers" }
                  ].map(option => (
                    <label key={option.value} className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="explanationStyle"
                        value={option.value}
                        checked={prefs.explanationStyle === option.value}
                        onChange={(e) => setPrefs(prev => ({ ...prev, explanationStyle: e.target.value as any }))}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-600">{option.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Starting Difficulty Level</label>
                <div className="space-y-2">
                  {[
                    { value: "beginner", label: "Beginner", desc: "I'm new to this topic" },
                    { value: "intermediate", label: "Intermediate", desc: "I have some background knowledge" },
                    { value: "advanced", label: "Advanced", desc: "I'm quite familiar with this topic" }
                  ].map(option => (
                    <label key={option.value} className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="difficultyStart"
                        value={option.value}
                        checked={prefs.difficultyStart === option.value}
                        onChange={(e) => setPrefs(prev => ({ ...prev, difficultyStart: e.target.value as any }))}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-600">{option.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <MessageCircle className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900">Communication Style</h3>
              <p className="text-gray-600">How should Lumos communicate with you?</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Response Style</label>
                <div className="space-y-2">
                  {[
                    { value: "academic", label: "Academic", desc: "Formal, scholarly tone" },
                    { value: "casual", label: "Casual", desc: "Friendly, relaxed tone" },
                    { value: "encouraging", label: "Encouraging", desc: "Supportive and motivating" },
                    { value: "direct", label: "Direct", desc: "Straightforward and concise" }
                  ].map(option => (
                    <label key={option.value} className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="responseStyle"
                        value={option.value}
                        checked={prefs.responseStyle === option.value}
                        onChange={(e) => setPrefs(prev => ({ ...prev, responseStyle: e.target.value as any }))}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-600">{option.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Language</label>
                <select
                  value={prefs.language}
                  onChange={(e) => setPrefs(prev => ({ ...prev, language: e.target.value as any }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="English">English</option>
                  <option value="Bahasa Malaysia">Bahasa Malaysia</option>
                  <option value="Mixed">Mixed (Both)</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Clock className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900">Study Habits</h3>
              <p className="text-gray-600">When and how do you prefer to study?</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Study Time</label>
                <select
                  value={prefs.studyTime}
                  onChange={(e) => setPrefs(prev => ({ ...prev, studyTime: e.target.value as any }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="morning">Morning (6AM - 12PM)</option>
                  <option value="afternoon">Afternoon (12PM - 6PM)</option>
                  <option value="evening">Evening (6PM - 12AM)</option>
                  <option value="night">Night (12AM - 6AM)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Session Length</label>
                <select
                  value={prefs.sessionLength}
                  onChange={(e) => setPrefs(prev => ({ ...prev, sessionLength: e.target.value as any }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="15min">15 minutes</option>
                  <option value="30min">30 minutes</option>
                  <option value="45min">45 minutes</option>
                  <option value="60min">1 hour</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <Heart className="h-12 w-12 text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900">Personality & Support</h3>
              <p className="text-gray-600">How can Lumos best support you?</p>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Confidence Level</label>
                <div className="space-y-2">
                  {[
                    { value: "low", label: "Low", desc: "I often doubt myself and need extra support" },
                    { value: "medium", label: "Medium", desc: "I'm generally confident but sometimes need encouragement" },
                    { value: "high", label: "High", desc: "I'm confident and prefer direct feedback" }
                  ].map(option => (
                    <label key={option.value} className="flex items-start space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                      <input
                        type="radio"
                        name="confidenceLevel"
                        value={option.value}
                        checked={prefs.confidenceLevel === option.value}
                        onChange={(e) => setPrefs(prev => ({ ...prev, confidenceLevel: e.target.value as any }))}
                        className="mt-1"
                      />
                      <div>
                        <div className="font-medium text-gray-900">{option.label}</div>
                        <div className="text-sm text-gray-600">{option.desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={prefs.needEncouragement}
                    onChange={(e) => setPrefs(prev => ({ ...prev, needEncouragement: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">I need extra encouragement and motivation</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={prefs.preferStepByStep}
                    onChange={(e) => setPrefs(prev => ({ ...prev, preferStepByStep: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">I prefer step-by-step explanations</span>
                </label>

                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={prefs.likeExamples}
                    onChange={(e) => setPrefs(prev => ({ ...prev, likeExamples: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">I learn better with examples</span>
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Learning Preferences
          </CardTitle>
          <CardDescription>
            Step {currentStep + 1} of {totalSteps} - Personalize your Lumos experience
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {renderStep()}
          
          <div className="flex justify-between items-center mt-8">
            <div className="flex space-x-2">
              {Array.from({ length: totalSteps }).map((_, i) => (
                <div
                  key={i}
                  className={`h-2 w-8 rounded-full ${
                    i <= currentStep ? 'bg-orange-500' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            
            <div className="flex space-x-3">
              {currentStep > 0 && (
                <Button variant="outline" onClick={prevStep}>
                  Previous
                </Button>
              )}
              
              {currentStep < totalSteps - 1 ? (
                <Button 
                  onClick={nextStep} 
                  disabled={!canProceed()}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSave}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Save Preferences
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
