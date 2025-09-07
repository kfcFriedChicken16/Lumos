// Convert PDF analysis to study pack for practice panel
import { StudyPack, QA } from '@/types/study';

export function parsePdfAnalysisToStudyPack(analysis: string): StudyPack {
  // Extract topics from the analysis
  const topics = extractTopicsFromAnalysis(analysis);
  
  // Generate questions for each topic
  const questions = generateQuestionsFromAnalysis(analysis, topics);
  
  return {
    topic: extractMainTopic(analysis),
    subtopics: topics,
    questions: questions
  };
}

function extractMainTopic(analysis: string): string {
  const topicMatch = analysis.match(/Content Overview[^:]*:?\s*([^.\n]+)/i);
  if (topicMatch) {
    return topicMatch[1].trim();
  }
  
  // Fallback: look for document title
  const titleMatch = analysis.match(/document titled "([^"]+)"/i);
  if (titleMatch) {
    return titleMatch[1];
  }
  
  return "PDF Content";
}

function extractTopicsFromAnalysis(analysis: string): string[] {
  const topics: string[] = [];
  
  // Look for "Learning Topics" section
  const topicsMatch = analysis.match(/Learning Topics\s*\n(.*?)(?=\n[A-Z]|\n\n|$)/is);
  if (topicsMatch) {
    const topicsText = topicsMatch[1];
    const topicLines = topicsText.split('\n').filter(line => 
      line.trim() && 
      !line.includes('Prerequisites') && 
      !line.includes('Difficulty') &&
      line.trim().length > 3
    );
    
    topics.push(...topicLines.map(line => line.replace(/^[-•*]\s*/, '').trim()));
  }
  
  return topics.length > 0 ? topics : ["General Topics"];
}

function generateQuestionsFromAnalysis(analysis: string, topics: string[]): QA[] {
  const questions: QA[] = [];
  
  // Look for "Practice Questions" section
  const questionsMatch = analysis.match(/Practice Questions\s*\n(.*?)(?=\n[A-Z]|\n\n|$)/is);
  if (questionsMatch) {
    const questionsText = questionsMatch[1];
    const questionLines = questionsText.split('\n').filter(line => 
      line.trim() && 
      (line.includes('Q1:') || line.includes('Q2:') || line.includes('Q3:'))
    );
    
    let questionId = 1;
    for (const line of questionLines) {
      const qMatch = line.match(/Q\d+:\s*(.+?)\s*\(([^)]+)\)/);
      if (qMatch) {
        const questionText = qMatch[1].trim();
        const difficultyText = qMatch[2].trim();
        
        // Map difficulty text to numbers
        const difficulty = mapDifficultyToNumber(difficultyText);
        
        // Find the topic this question belongs to
        const topic = findTopicForQuestion(questionText, topics);
        
        questions.push({
          id: `q${questionId++}`,
          subtopic: topic,
          difficulty: difficulty,
          type: "open",
          prompt: questionText,
          answer: generateSampleAnswer(questionText),
          solution: generateSolution(questionText)
        });
      }
    }
  }
  
  // If no questions found, generate some basic ones
  if (questions.length === 0) {
    topics.forEach((topic, index) => {
      questions.push({
        id: `q${index + 1}`,
        subtopic: topic,
        difficulty: 2,
        type: "open",
        prompt: `What do you know about ${topic}?`,
        answer: "Sample answer",
        solution: `This is a basic question about ${topic}.`
      });
    });
  }
  
  return questions;
}

function mapDifficultyToNumber(difficulty: string): 1 | 2 | 3 | 4 | 5 | 6 {
  const lower = difficulty.toLowerCase();
  if (lower.includes('easy') || lower.includes('beginner')) return 1;
  if (lower.includes('moderate') || lower.includes('intermediate')) return 3;
  if (lower.includes('hard') || lower.includes('advanced')) return 5;
  return 2; // default
}

function findTopicForQuestion(questionText: string, topics: string[]): string {
  // Try to match question to a topic based on keywords
  for (const topic of topics) {
    const topicWords = topic.toLowerCase().split(' ');
    const questionWords = questionText.toLowerCase().split(' ');
    
    for (const topicWord of topicWords) {
      if (questionWords.some(qWord => qWord.includes(topicWord) || topicWord.includes(qWord))) {
        return topic;
      }
    }
  }
  
  return topics[0] || "General";
}

function generateSampleAnswer(questionText: string): string {
  // Generate a basic sample answer based on the question
  if (questionText.toLowerCase().includes('what is')) {
    return "This is a definition question that requires understanding the concept.";
  }
  if (questionText.toLowerCase().includes('how')) {
    return "This is a procedural question that requires step-by-step explanation.";
  }
  if (questionText.toLowerCase().includes('list') || questionText.toLowerCase().includes('name')) {
    return "This is a listing question that requires enumeration of items.";
  }
  return "This question requires detailed explanation and understanding.";
}

function generateSolution(questionText: string): string {
  return `To answer this question effectively, consider the key concepts and provide specific examples where appropriate.`;
}
