import express from 'express';
import { supabaseAuthService } from '../services/supabase-auth';
import { academicAIService } from '../services/academic-ai';
import { authenticateUser } from '../middleware/auth';

const router = express.Router();

// Use proper auth middleware for all academic routes
router.use(authenticateUser);

// ===== ACADEMIC PROJECTS =====

// Create a new academic project
router.post('/projects', async (req, res) => {
  try {
    const userId = req.user.id;
    const projectData = req.body;

    const project = await supabaseAuthService.createAcademicProject(userId, projectData);
    
    if (!project) {
      return res.status(500).json({ error: 'Failed to create project' });
    }

    res.json({ success: true, project });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get user's projects
router.get('/projects', async (req, res) => {
  try {
    const userId = req.user.id;
    const status = req.query.status as string;

    const projects = await supabaseAuthService.getUserProjects(userId, status);
    res.json({ success: true, projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a project
router.put('/projects/:projectId', async (req, res) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.projectId;
    const updates = req.body;

    const success = await supabaseAuthService.updateAcademicProject(projectId, userId, updates);
    
    if (!success) {
      return res.status(500).json({ error: 'Failed to update project' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== REAL-TIME AI ANALYSIS =====

// Analyze resource credibility (no database storage)
router.post('/analyze-resource', async (req, res) => {
  try {
    const { content, context, sourceUrl, useCase } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const analysis = await academicAIService.analyzeResource(
      content, 
      context, 
      sourceUrl, 
      useCase || 'general_info'
    );
    res.json({ success: true, analysis });
  } catch (error) {
    console.error('Analyze resource error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Quick URL credibility check
router.post('/quick-check-url', async (req, res) => {
  try {
    const { url, analyzeContent } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }

    const check = await academicAIService.quickCredibilityCheck(url, analyzeContent || false);
    res.json({ success: true, check });
  } catch (error) {
    console.error('Quick URL check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Analyze learning needs from conversation
router.post('/analyze-learning', async (req, res) => {
  try {
    const { conversationHistory, currentProject, userLevel } = req.body;

    if (!conversationHistory || !Array.isArray(conversationHistory)) {
      return res.status(400).json({ error: 'Conversation history is required' });
    }

    const analysis = await academicAIService.analyzeLearningNeeds(
      conversationHistory, 
      currentProject, 
      userLevel
    );
    res.json({ success: true, analysis });
  } catch (error) {
    console.error('Analyze learning error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate AI study plan
router.post('/generate-study-plan', async (req, res) => {
  try {
    const { projectTitle, dueDate, estimatedHours, currentKnowledge } = req.body;

    if (!projectTitle || !dueDate) {
      return res.status(400).json({ error: 'Project title and due date are required' });
    }

    const studyPlan = await academicAIService.generateStudyPlan(
      projectTitle,
      dueDate,
      estimatedHours || 10,
      currentKnowledge
    );
    res.json({ success: true, studyPlan });
  } catch (error) {
    console.error('Generate study plan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== STUDY PLANNING =====

// Create a study plan
router.post('/study-plans', async (req, res) => {
  try {
    const userId = req.user.id;
    const planData = req.body;

    const studyPlan = await supabaseAuthService.createStudyPlan(userId, planData);
    
    if (!studyPlan) {
      return res.status(500).json({ error: 'Failed to create study plan' });
    }

    res.json({ success: true, studyPlan });
  } catch (error) {
    console.error('Create study plan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get upcoming study plans
router.get('/study-plans', async (req, res) => {
  try {
    const userId = req.user.id;
    const days = parseInt(req.query.days as string) || 7;

    const studyPlans = await supabaseAuthService.getUpcomingStudyPlans(userId, days);
    res.json({ success: true, studyPlans });
  } catch (error) {
    console.error('Get study plans error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update a study plan (mark complete, add notes)
router.put('/study-plans/:planId', async (req, res) => {
  try {
    const userId = req.user.id;
    const planId = req.params.planId;
    const updates = req.body;

    const success = await supabaseAuthService.updateStudyPlan(planId, userId, updates);
    
    if (!success) {
      return res.status(500).json({ error: 'Failed to update study plan' });
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Update study plan error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===== COMPREHENSIVE CONTEXT =====

// Get full academic context for AI
router.get('/context', async (req, res) => {
  try {
    const userId = req.user.id;

    const context = await supabaseAuthService.getAcademicContext(userId);
    res.json({ success: true, context });
  } catch (error) {
    console.error('Get academic context error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
