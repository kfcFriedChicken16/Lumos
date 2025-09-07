"use client";

import { useState, useEffect } from "react";
import { StudyPack, QA, StepState, MasteryMap, nextQuestion, updateMastery, fuzzyMatch, loadFromStorage, saveToStorage } from "@/types/study";
import LevelPicker from "./LevelPicker";
import ProgressView from "./ProgressView";
import { CheckCircle, XCircle, ArrowRight, RotateCcw } from "lucide-react";
import { apiClient } from "@/lib/api";

interface StepRunnerProps {
  pack: StudyPack;
  onPackUpdate?: (updatedPack: StudyPack) => void;
  onTopicCompletion?: (topic: string) => void;
  selectedTopic?: string | null;
  pdfAnalysis?: string;
}

export default function StepRunner({ pack, onPackUpdate, onTopicCompletion, selectedTopic, pdfAnalysis }: StepRunnerProps) {
  const [level, setLevel] = useState<1 | 2 | 3 | 4 | 5 | 6>(1);
  const [state, setState] = useState<StepState>("idle");
  const [currentQuestion, setCurrentQuestion] = useState<QA | null>(null);
  const [answer, setAnswer] = useState<string>("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [mastery, setMastery] = useState<MasteryMap>(() => 
    loadFromStorage("mastery", {})
  );
  const [unlockedLevels, setUnlockedLevels] = useState<number[]>([1]); // Start with level 1 unlocked
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false);
  const [currentPackId, setCurrentPackId] = useState<string | null>(null);

  // Save mastery to localStorage whenever it changes
  useEffect(() => {
    saveToStorage("mastery", mastery);
  }, [mastery]);

  // Check if all levels are completed and notify parent
  useEffect(() => {
    if (selectedTopic && onTopicCompletion) {
      // Check if all levels (1-6) are unlocked and have high mastery
      const allLevelsUnlocked = unlockedLevels.length === 6;
      const topicMastery = mastery[selectedTopic] || 0;
      const isFullyMastered = topicMastery >= 0.8; // 80% mastery threshold
      
      if (allLevelsUnlocked && isFullyMastered) {
        // Small delay to ensure UI updates are complete
        setTimeout(() => {
          onTopicCompletion(selectedTopic);
        }, 500);
      }
    }
  }, [unlockedLevels, mastery, selectedTopic, onTopicCompletion]);

  // Reset mastery when a new study pack is loaded
  useEffect(() => {
    const packId = `${pack.topic}-${pack.subtopics.join('-')}`;
    if (currentPackId !== packId) {
      // New study pack detected, reset mastery for this pack
      setMastery({});
      setCurrentPackId(packId);
      setLevel(1);
      setUnlockedLevels([1]);
      setState("idle");
    }
  }, [pack, currentPackId]);

  async function startPractice() {
    // Check if we have enough questions for this level (5 MCQ + 3 Short + 2 Deep = 10 total)
    const levelQuestions = pack.questions.filter(q => q.difficulty === level);
    const mcqCount = levelQuestions.filter(q => q.type === 'mcq').length;
    const shortCount = levelQuestions.filter(q => q.type === 'open').length;
    const deepCount = levelQuestions.filter(q => q.type === 'code').length;
    
    console.log(`Level ${level} questions: ${mcqCount} MCQ, ${shortCount} Short, ${deepCount} Deep`);
    
    // If we don't have the full set of 10 questions for this level, generate them
    if (mcqCount < 5 || shortCount < 3 || deepCount < 2) {
      try {
        setIsGeneratingQuestions(true);
        await generateQuestionsForTopic();
        setIsGeneratingQuestions(false);
      } catch (error) {
        console.error('Error generating questions:', error);
        setIsGeneratingQuestions(false);
        setState("idle");
        return;
      }
    }
    
    // Now get the next question
    let nextQ = nextQuestion(pack, level, mastery);
    
    if (nextQ) {
      setCurrentQuestion(nextQ);
      setAnswer("");
      setIsCorrect(null);
      setState("asking");
    } else {
      // Still no questions available
      setState("idle");
    }
  }

  async function generateQuestionsForTopic() {
    try {
      console.log('🔄 StepRunner: Generating questions for topic:', selectedTopic);
      console.log('📄 StepRunner: Using PDF analysis:', pdfAnalysis ? 'Available' : 'Not available');
      
      // Create a comprehensive prompt using PDF content and selected topic
      const prompt = `Based on the PDF content provided, generate 10 practice questions specifically for the topic "${selectedTopic || pack.topic}" at difficulty level ${level}.

PDF CONTENT CONTEXT:
${pdfAnalysis || 'No PDF content available - generate general questions about the topic.'}

IMPORTANT: Respond with ONLY valid JSON, no other text.

Create EXACTLY 10 questions in this format:
- 5 Multiple Choice Questions (MCQ) - test specific knowledge from the PDF
- 3 Short Answer Questions (type: "open") - require understanding of concepts from the PDF  
- 2 Deep Learning/Code Questions (type: "code") - practical application of PDF content

IMPORTANT: You must generate exactly 5 MCQ, 3 Short Answer, and 2 Deep questions. No more, no less.

For each question, provide:
1. A clear, specific prompt based on the PDF content
2. For MCQ: 4 realistic options based on the PDF material and the correct answer index (0-3)
3. For Short/Code: A sample answer and detailed solution based on the PDF content

Make sure questions are:
- Specific to "${selectedTopic || pack.topic}" content from the PDF
- Appropriate for difficulty level ${level}
- Based on actual concepts, commands, or information from the PDF
- Realistic and practical

Respond with ONLY this JSON format (no markdown, no extra text):
{
  "questions": [
    {
      "id": "q1",
      "type": "mcq", 
      "prompt": "MCQ question 1 about ${selectedTopic || pack.topic} from PDF?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": 1,
      "solution": "Explanation"
    },
    {
      "id": "q2",
      "type": "mcq", 
      "prompt": "MCQ question 2 about ${selectedTopic || pack.topic} from PDF?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": 0,
      "solution": "Explanation"
    },
    {
      "id": "q3",
      "type": "mcq", 
      "prompt": "MCQ question 3 about ${selectedTopic || pack.topic} from PDF?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": 2,
      "solution": "Explanation"
    },
    {
      "id": "q4",
      "type": "mcq", 
      "prompt": "MCQ question 4 about ${selectedTopic || pack.topic} from PDF?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": 3,
      "solution": "Explanation"
    },
    {
      "id": "q5",
      "type": "mcq", 
      "prompt": "MCQ question 5 about ${selectedTopic || pack.topic} from PDF?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": 1,
      "solution": "Explanation"
    },
    {
      "id": "q6",
      "type": "open",
      "prompt": "Short answer question 1 about ${selectedTopic || pack.topic} from PDF?",
      "answer": "Sample answer",
      "solution": "Detailed explanation"
    },
    {
      "id": "q7",
      "type": "open",
      "prompt": "Short answer question 2 about ${selectedTopic || pack.topic} from PDF?",
      "answer": "Sample answer",
      "solution": "Detailed explanation"
    },
    {
      "id": "q8",
      "type": "open",
      "prompt": "Short answer question 3 about ${selectedTopic || pack.topic} from PDF?",
      "answer": "Sample answer",
      "solution": "Detailed explanation"
    },
    {
      "id": "q9", 
      "type": "code",
      "prompt": "Deep learning question 1 about ${selectedTopic || pack.topic} from PDF?",
      "answer": "Code example",
      "solution": "Code explanation"
    },
    {
      "id": "q10", 
      "type": "code",
      "prompt": "Deep learning question 2 about ${selectedTopic || pack.topic} from PDF?",
      "answer": "Code example",
      "solution": "Code explanation"
    }
  ]
}`;

      const { data, error } = await apiClient.generateLLMResponse(prompt);
      
      if (error) {
        throw new Error(error);
      }

      // Extract JSON from the LLM response (it might have extra text)
      let jsonResponse = data.response;
      
      console.log('Raw LLM response:', jsonResponse);
      
      // Try to find JSON object in the response
      const jsonMatch = jsonResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonResponse = jsonMatch[0];
        console.log('Extracted JSON:', jsonResponse);
      }
      
      // Parse the JSON response
      let response;
      try {
        response = JSON.parse(jsonResponse);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        console.error('Failed to parse:', jsonResponse);
        throw new Error('Failed to parse LLM response as JSON');
      }
      const newQuestions: QA[] = response.questions.map((q: any, index: number) => ({
        id: `q-${level}-${index + 1}`,
        subtopic: selectedTopic || pack.topic,
        difficulty: level,
        type: q.type,
        prompt: q.prompt,
        options: q.options,
        answer: q.answer,
        solution: q.solution
      }));

      // Update the pack with new questions
      const updatedPack = {
        ...pack,
        questions: [...pack.questions, ...newQuestions]
      };

      // Notify parent component to update the pack
      if (onPackUpdate) {
        onPackUpdate(updatedPack);
      }
      
      console.log('Generated questions:', newQuestions);
      
    } catch (error) {
      console.error('Error generating questions:', error);
      throw error;
    }
  }

  function checkAnswer() {
    if (!currentQuestion) return;
    
    let correct = false;
    if (currentQuestion.type === "mcq") {
      correct = String(currentQuestion.answer) === String(answer);
    } else {
      correct = fuzzyMatch(answer, currentQuestion.answer as string);
    }
    
    setIsCorrect(correct);
    const newMastery = updateMastery(mastery, currentQuestion.subtopic, correct, currentQuestion.difficulty);
    setMastery(newMastery);
    
    // Check if current level is completed (mastery >= 0.8 for the subtopic)
    const subtopicMastery = newMastery[currentQuestion.subtopic] || 0;
    if (subtopicMastery >= 0.8 && !unlockedLevels.includes(level + 1) && level < 6) {
      setUnlockedLevels(prev => [...prev, level + 1]);
    }
    
    setState("feedback");
  }

  function getNextQuestion() {
    const nextQ = nextQuestion(pack, level, mastery);
    if (nextQ) {
      setCurrentQuestion(nextQ);
      setAnswer("");
      setIsCorrect(null);
      setState("asking");
    } else {
      // No more questions at this level, try next level or show completion
      setState("idle");
    }
  }

  function reviewAgain() {
    setState("asking");
  }

  return (
    <div className="space-y-4">
      <LevelPicker 
        level={level} 
        setLevel={setLevel} 
        unlockedLevels={unlockedLevels}
        onNavigateToLevel={(newLevel) => {
          setLevel(newLevel as 1 | 2 | 3 | 4 | 5 | 6);
          setState("idle");
        }}
      />
      
      {state === "idle" && (
        <div className="text-center">
          <button
            onClick={startPractice}
            disabled={isGeneratingQuestions}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
          >
            {isGeneratingQuestions ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Generating Questions...</span>
              </>
            ) : (
              <>
                <span>Start Practice</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
          <p className="text-sm text-gray-500 mt-2">
            {isGeneratingQuestions 
              ? "Creating personalized questions for you..." 
              : "Questions will adapt to your mastery level"
            }
          </p>
        </div>
      )}

      {state === "asking" && currentQuestion && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-orange-200 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
                {currentQuestion.subtopic}
              </span>
              <span className="px-2 py-1 bg-pink-100 text-pink-700 text-xs font-medium rounded-full">
                Level {currentQuestion.difficulty}
              </span>
            </div>
          </div>
          
          <div className="font-medium text-gray-900">
            {currentQuestion.prompt}
          </div>

          {currentQuestion.type === "mcq" && currentQuestion.options && (
            <div className="space-y-2">
              {currentQuestion.options.map((option, index) => (
                <label key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-orange-300 hover:bg-orange-50 cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name="answer"
                    value={index}
                    checked={answer === String(index)}
                    onChange={(e) => setAnswer(e.target.value)}
                    className="text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-gray-700">{option}</span>
                </label>
              ))}
            </div>
          )}

          {(currentQuestion.type === "open" || currentQuestion.type === "code") && (
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={currentQuestion.type === "code" ? "Write your code here..." : "Type your answer here..."}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
              rows={currentQuestion.type === "code" ? 6 : 3}
            />
          )}

          <button
            onClick={checkAnswer}
            disabled={!answer.trim()}
            className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 disabled:cursor-not-allowed"
          >
            Check Answer
          </button>
        </div>
      )}

      {state === "feedback" && currentQuestion && (
        <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-orange-200 p-4 space-y-4">
          <div className="flex items-center gap-2">
            {isCorrect ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            <span className={`font-semibold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {isCorrect ? "Correct! 🎉" : "Not quite right"}
            </span>
          </div>

          <div className="bg-gray-50 rounded-lg p-3">
            <div className="font-medium text-gray-900 mb-2">Solution:</div>
            <div className="text-gray-700 text-sm">{currentQuestion.solution}</div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={reviewAgain}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Review Again
            </button>
            <button
              onClick={getNextQuestion}
              className="flex-1 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
              Next Question
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <ProgressView mastery={mastery} subtopics={pack.subtopics} />
    </div>
  );
}
