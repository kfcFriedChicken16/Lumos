'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTimebank } from '@/contexts/TimebankContext';
import { 
  ArrowLeft, 
  Check, 
  Plus, 
  X, 
  BookOpen, 
  Brain, 
  Target,
  Award,
  Star,
  Lightbulb
} from 'lucide-react';

const availableSubjects = [
  { id: 'mathematics', name: 'Mathematics', category: 'STEM', difficulty: 'Medium', demand: 'High' },
  { id: 'physics', name: 'Physics', category: 'STEM', difficulty: 'Hard', demand: 'High' },
  { id: 'chemistry', name: 'Chemistry', category: 'STEM', difficulty: 'Hard', demand: 'Medium' },
  { id: 'biology', name: 'Biology', category: 'STEM', difficulty: 'Medium', demand: 'Medium' },
  { id: 'english', name: 'English', category: 'Language', difficulty: 'Easy', demand: 'High' },
  { id: 'essay-writing', name: 'Essay Writing', category: 'Language', difficulty: 'Medium', demand: 'High' },
  { id: 'statistics', name: 'Statistics', category: 'STEM', difficulty: 'Medium', demand: 'High' },
  { id: 'calculus', name: 'Calculus', category: 'STEM', difficulty: 'Hard', demand: 'High' },
  { id: 'computer-science', name: 'Computer Science', category: 'Technology', difficulty: 'Medium', demand: 'Very High' },
  { id: 'programming', name: 'Programming', category: 'Technology', difficulty: 'Medium', demand: 'Very High' },
  { id: 'history', name: 'History', category: 'Humanities', difficulty: 'Easy', demand: 'Low' },
  { id: 'economics', name: 'Economics', category: 'Social Science', difficulty: 'Medium', demand: 'Medium' },
  { id: 'psychology', name: 'Psychology', category: 'Social Science', difficulty: 'Easy', demand: 'Medium' },
  { id: 'study-skills', name: 'Study Skills', category: 'Academic Support', difficulty: 'Easy', demand: 'High' },
  { id: 'test-prep', name: 'Test Preparation', category: 'Academic Support', difficulty: 'Medium', demand: 'High' }
];

export default function SkillsSetupPage() {
  const { tutorSkills, updateTutorSkills, learningGoals, updateLearningGoals } = useTimebank();
  const [selectedTutorSkills, setSelectedTutorSkills] = useState<string[]>(tutorSkills);
  const [selectedLearningGoals, setSelectedLearningGoals] = useState<string[]>(learningGoals);
  const [customSkill, setCustomSkill] = useState('');
  const [activeTab, setActiveTab] = useState<'tutor' | 'learn'>('tutor');

  const handleToggleTutorSkill = (skill: string) => {
    setSelectedTutorSkills(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleToggleLearningGoal = (skill: string) => {
    setSelectedLearningGoals(prev => 
      prev.includes(skill) 
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleAddCustomSkill = () => {
    if (customSkill.trim() && !selectedTutorSkills.includes(customSkill.trim())) {
      setSelectedTutorSkills(prev => [...prev, customSkill.trim()]);
      setCustomSkill('');
    }
  };

  const handleSave = () => {
    updateTutorSkills(selectedTutorSkills);
    updateLearningGoals(selectedLearningGoals);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-700';
      case 'Medium': return 'bg-yellow-100 text-yellow-700';
      case 'Hard': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'Very High': return 'bg-purple-100 text-purple-700';
      case 'High': return 'bg-blue-100 text-blue-700';
      case 'Medium': return 'bg-orange-100 text-orange-700';
      case 'Low': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const categories = Array.from(new Set(availableSubjects.map(s => s.category)));

  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-pink-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-orange-200/50">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4 mb-6">
            <Link 
              href="/web/timebank"
              className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Timebank
            </Link>
          </div>
          
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl text-white shadow-lg">
                <Brain className="w-8 h-8" />
              </div>
              Skills & Interests
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tell us what you can teach and what you want to learn. This helps us match you with the right students!
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center">
            <div className="flex bg-white/70 backdrop-blur-sm rounded-2xl p-2 border border-orange-200">
              <button
                onClick={() => setActiveTab('tutor')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'tutor'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <Award className="w-4 h-4" />
                I Can Teach
              </button>
              <button
                onClick={() => setActiveTab('learn')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                  activeTab === 'learn'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <Target className="w-4 h-4" />
                I Want to Learn
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {activeTab === 'tutor' && (
          <div className="space-y-8">
            {/* Selected Skills Summary */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-orange-200/50 p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-green-500" />
                Selected Teaching Skills ({selectedTutorSkills.length})
              </h2>
              
              {selectedTutorSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedTutorSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-lg font-medium"
                    >
                      {skill}
                      <button
                        onClick={() => handleToggleTutorSkill(skill)}
                        className="hover:bg-green-200 rounded p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No skills selected yet. Choose subjects you're confident teaching!</p>
              )}
            </div>

            {/* Add Custom Skill */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-orange-200/50 p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-500" />
                Add Custom Skill
              </h3>
              
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="e.g., Advanced Linear Algebra"
                  value={customSkill}
                  onChange={(e) => setCustomSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCustomSkill()}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <button
                  onClick={handleAddCustomSkill}
                  disabled={!customSkill.trim()}
                  className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-medium rounded-xl transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Available Subjects */}
            <div className="space-y-6">
              {categories.map((category) => (
                <div key={category} className="bg-white/80 backdrop-blur-sm rounded-3xl border border-orange-200/50 p-6 shadow-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">{category}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availableSubjects
                      .filter(subject => subject.category === category)
                      .map((subject) => {
                        const isSelected = selectedTutorSkills.includes(subject.name);
                        return (
                          <button
                            key={subject.id}
                            onClick={() => handleToggleTutorSkill(subject.name)}
                            className={`p-4 rounded-xl border-2 transition-all hover:scale-[1.02] ${
                              isSelected
                                ? 'border-green-300 bg-green-50'
                                : 'border-gray-200 bg-white/50 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-900">{subject.name}</span>
                              {isSelected && <Check className="w-5 h-5 text-green-600" />}
                            </div>
                            
                            <div className="flex gap-2">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(subject.difficulty)}`}>
                                {subject.difficulty}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDemandColor(subject.demand)}`}>
                                {subject.demand} Demand
                              </span>
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'learn' && (
          <div className="space-y-8">
            {/* Selected Learning Goals Summary */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-orange-200/50 p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-500" />
                Learning Goals ({selectedLearningGoals.length})
              </h2>
              
              {selectedLearningGoals.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedLearningGoals.map((goal) => (
                    <span
                      key={goal}
                      className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-lg font-medium"
                    >
                      {goal}
                      <button
                        onClick={() => handleToggleLearningGoal(goal)}
                        className="hover:bg-blue-200 rounded p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No learning goals set. Choose subjects you want to improve!</p>
              )}
            </div>

            {/* Available Subjects for Learning */}
            <div className="space-y-6">
              {categories.map((category) => (
                <div key={category} className="bg-white/80 backdrop-blur-sm rounded-3xl border border-orange-200/50 p-6 shadow-lg">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">{category}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availableSubjects
                      .filter(subject => subject.category === category)
                      .map((subject) => {
                        const isSelected = selectedLearningGoals.includes(subject.name);
                        const isTeaching = selectedTutorSkills.includes(subject.name);
                        return (
                          <button
                            key={subject.id}
                            onClick={() => handleToggleLearningGoal(subject.name)}
                            disabled={isTeaching}
                            className={`p-4 rounded-xl border-2 transition-all hover:scale-[1.02] ${
                              isTeaching
                                ? 'border-gray-200 bg-gray-100 opacity-50 cursor-not-allowed'
                                : isSelected
                                ? 'border-blue-300 bg-blue-50'
                                : 'border-gray-200 bg-white/50 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium text-gray-900">{subject.name}</span>
                              {isSelected && <Check className="w-5 h-5 text-blue-600" />}
                              {isTeaching && <Award className="w-5 h-5 text-green-600" />}
                            </div>
                            
                            <div className="flex gap-2">
                              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(subject.difficulty)}`}>
                                {subject.difficulty}
                              </span>
                              {isTeaching && (
                                <span className="text-xs px-2 py-1 rounded-full font-medium bg-green-100 text-green-700">
                                  You teach this
                                </span>
                              )}
                            </div>
                          </button>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="sticky bottom-6 mt-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-orange-200/50 p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  Ready to save your skills?
                </p>
                <p className="text-sm text-gray-600">
                  Teaching: {selectedTutorSkills.length} skills • Learning: {selectedLearningGoals.length} goals
                </p>
              </div>
              
              <button
                onClick={handleSave}
                className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all hover:scale-[1.02]"
              >
                Save Skills
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
