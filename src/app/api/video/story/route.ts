import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger, createApiHandler } from '@/lib/logger';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Internal handler function
async function handleScriptGeneration(request: NextRequest, context: { requestId: string, startTime: number }) {
  try {
    const { topic, style = 'educational' } = await request.json();

    // Log input validation
    logger.debug('Validating script generation input', {
      requestId: context.requestId,
      topicLength: topic?.length || 0,
      style
    });

    // Validate input
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      logger.warn('Invalid topic provided', {
        requestId: context.requestId,
        topic,
        error: 'Topic is required and must be a non-empty string'
      });
      return NextResponse.json(
        { error: 'Topic is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (topic.length > 1000) {
      logger.warn('Topic too long', {
        requestId: context.requestId,
        topicLength: topic.length,
        maxLength: 1000
      });
      return NextResponse.json(
        { error: 'Topic is too long. Maximum 1000 characters allowed.' },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      logger.error('Gemini API key not configured', {
        requestId: context.requestId
      });
      return NextResponse.json(
        { error: 'Gemini API key is not configured' },
        { status: 500 }
      );
    }

    logger.info('Calling Gemini API', {
      requestId: context.requestId,
      topic: topic.substring(0, 50) + (topic.length > 50 ? '...' : ''),
      style
    });

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `Create a 3-5 segment video script about "${topic}" in ${style} style.

For each segment, provide:
1. A narrative text (2-3 sentences)
2. An image generation prompt (detailed description for visual representation)

Format the response as a JSON object with this structure:
{
  "segments": [
    {
      "id": 1,
      "narrative": "Segment narrative text here",
      "imagePrompt": "Detailed image description for AI generation"
    }
  ],
  "title": "Video title",
  "description": "Brief video description"
}

Ensure the response is valid JSON format.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Log API response
    logger.info('Gemini API response received', {
      requestId: context.requestId,
      responseLength: text.length
    });

    // Parse and validate JSON response
    let scriptData;
    try {
      // Clean the response text to ensure it's valid JSON
      const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
      scriptData = JSON.parse(cleanText);

      // Validate structure
      if (!scriptData.segments || !Array.isArray(scriptData.segments)) {
        throw new Error('Invalid script structure: missing segments array');
      }

      if (scriptData.segments.length < 3 || scriptData.segments.length > 5) {
        throw new Error('Invalid segment count: should be 3-5 segments');
      }

      logger.info('Script generated successfully', {
        requestId: context.requestId,
        segmentsCount: scriptData.segments.length,
        hasTitle: !!scriptData.title,
        hasDescription: !!scriptData.description
      });

    } catch (parseError) {
      logger.error('Failed to parse Gemini response', {
        requestId: context.requestId,
        error: parseError instanceof Error ? parseError.message : 'Unknown parsing error',
        rawResponse: text.substring(0, 200)
      });
      return NextResponse.json(
        { error: 'Failed to parse AI response. Please try again.' },
        { status: 500 }
      );
    }

    // Return success response
    logger.logApiSuccess(request, context.requestId, {
      segmentsCount: scriptData.segments.length,
      generatedAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      data: {
        script: scriptData,
        metadata: {
          topic,
          style,
          segmentsCount: scriptData.segments.length,
          generatedAt: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Unknown error');

    logger.error('Script generation failed', {
      requestId: context.requestId,
      error: errorObj.message,
      stack: errorObj.stack
    });

    // Handle specific Gemini API errors
    if (errorObj.message.includes('quota') || errorObj.message.includes('limit')) {
      return NextResponse.json(
        { error: 'API quota exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    if (errorObj.message.includes('invalid') || errorObj.message.includes('authentication')) {
      return NextResponse.json(
        { error: 'Invalid API key or authentication failed' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate script. Please try again.' },
      { status: 500 }
    );
  }
}

// Export wrapped handlers
export const POST = createApiHandler(async (request: NextRequest, context: { requestId: string, startTime: number }) => {
  return await handleScriptGeneration(request, context);
});

export async function GET() {
  return NextResponse.json({
    message: 'Video script generation API',
    version: '1.0.0',
    endpoints: {
      POST: '/api/video/story - Generate video script from topic'
    }
  });
}