import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { title, description, duration, channelTitle } = await request.json();

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    // Create a prompt for the LLM to generate a video summary
              const prompt = `You are a precise learning analyst. Use ALL provided inputs to summarize what THIS specific YouTube video teaches.

          INPUT
          Title: "${title}"
          Channel: "${channelTitle}"
          Duration (ISO 8601): "${duration}"
          Description:
          """
          ${description.substring(0, 2000)}
          """
          Transcript segments (optional JSON array of {start_s, end_s, text}): 
          null
          Tags (optional): null

          TASK
          1) If transcript segments exist OR the description contains content-specific detail, write a SPECIFIC, grounded summary based only on those sources.
          2) If there isn't enough information to be specific, switch to FALLBACK mode:
             - Produce a topic-informed summary based on the title/tags (typical coverage for an intro to that topic).
             - Clearly indicate this in the JSON with "basis": "title_only" and use a lower "confidence" (0.3–0.6).
             - Still keep it practical and student-facing.

          DIFFICULTY HEURISTICS
          - beginner: foundational overview, little prior knowledge.
          - intermediate: applies concepts, assumes some background.
          - advanced: deep/technical or proof/derivation heavy.

          LEARNING TIME
          Return a realistic total time to truly grasp the content (video length + pausing/notes), e.g., "30–45 minutes".

          OUTPUT
          Return ONLY valid JSON (no extra text), matching this schema exactly:

          {
            "keyPoints": ["3–6 concrete concepts covered or likely covered"],
            "learningObjectives": ["3–6 specific learner outcomes"],
            "difficulty": "beginner" | "intermediate" | "advanced",
            "estimatedDuration": "e.g., 30–45 minutes",
            "prerequisites": ["list prior knowledge; [] if none/unknown"],
            "summary": "2–3 sentences. If using FALLBACK, begin with 'Based on the title and tags…'",
            "basis": "transcript" | "description" | "title_only",
            "confidence": 0.0
          }

          VALIDATION
          - If using FALLBACK, do NOT invent precise numbers, names, or scenes—stick to common syllabus items for the topic and label it as such.
          - Always output valid JSON.`;

    // Call OpenRouter API directly
    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    
    if (!openRouterApiKey) {
      console.error('❌ OPENROUTER_API_KEY not found in environment variables');
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      );
    }
    
    console.log('✅ OpenRouter API key loaded successfully');
    
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openRouterApiKey}`,
        'HTTP-Referer': 'http://localhost:3000', // Your frontend URL
        'X-Title': 'Lumos Video Learning',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You are an expert educational content analyzer. Your job is to create accurate, specific learning summaries based on the actual content of YouTube videos. Always analyze the real video content from the title and description, not generic educational advice. Respond only with valid JSON. Be specific and avoid generic responses.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!openRouterResponse.ok) {
      console.error('OpenRouter API error:', openRouterResponse.status, await openRouterResponse.text());
      throw new Error(`OpenRouter API error: ${openRouterResponse.status} - Check your API key`);
    }

    const openRouterData = await openRouterResponse.json();
    
    // Try to parse the JSON response from OpenRouter
    let summary;
    try {
      // Extract the content from OpenRouter response
      const aiResponse = openRouterData.choices?.[0]?.message?.content;
      if (!aiResponse) {
        throw new Error('No response content from OpenRouter');
      }

      // Extract JSON from the response (in case it's wrapped in text)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        summary = JSON.parse(jsonMatch[0]);
      } else {
        // Fallback: create a basic summary structure
        console.warn('OpenRouter response did not contain valid JSON, using fallback');
        summary = {
          keyPoints: ["Content analysis not available - OpenRouter response format issue"],
          learningObjectives: ["Watch the video to learn"],
          difficulty: "beginner",
          estimatedDuration: duration,
          prerequisites: ["No prerequisites listed"],
          summary: "This video covers various topics. Watch to learn more."
        };
      }
    } catch (parseError) {
      console.error('Error parsing OpenRouter response:', parseError);
      // Fallback summary
      summary = {
        keyPoints: ["Content analysis not available - OpenRouter parsing error"],
        learningObjectives: ["Watch the video to learn"],
        difficulty: "beginner",
        estimatedDuration: duration,
        prerequisites: ["No prerequisites listed"],
        summary: "This video covers various topics. Watch to learn more."
      };
    }

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error generating video summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate video summary' },
      { status: 500 }
    );
  }
}
