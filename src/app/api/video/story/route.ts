import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { topic, style = 'educational' } = await request.json();

    // Validate input
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return NextResponse.json(
        { error: 'Topic is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    if (topic.length > 1000) {
      return NextResponse.json(
        { error: 'Topic is too long. Maximum 1000 characters allowed.' },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key is not configured' },
        { status: 500 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

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
  "title": "Video title based on the topic",
  "description": "Brief description of the video content"
}

Make sure the script flows logically from one segment to the next and maintains a consistent ${style} tone throughout.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Try to parse the response as JSON
    let scriptData;
    try {
      // Extract JSON from the response if it contains extra text
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      const jsonText = jsonMatch ? jsonMatch[0] : text;
      scriptData = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response as JSON:', parseError);
      return NextResponse.json(
        { error: 'Failed to generate valid script format', rawResponse: text },
        { status: 500 }
      );
    }

    // Validate the script structure
    if (!scriptData.segments || !Array.isArray(scriptData.segments) || scriptData.segments.length === 0) {
      return NextResponse.json(
        { error: 'Invalid script format: segments array is required' },
        { status: 500 }
      );
    }

    // Validate each segment
    for (const segment of scriptData.segments) {
      if (!segment.narrative || !segment.imagePrompt) {
        return NextResponse.json(
          { error: 'Invalid segment format: each segment must have narrative and imagePrompt' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      script: scriptData,
      metadata: {
        topic,
        style,
        segmentsCount: scriptData.segments.length,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Script generation error:', error);

    // Handle specific Gemini API errors
    if (error instanceof Error) {
      if (error.message.includes('quota') || error.message.includes('limit')) {
        return NextResponse.json(
          { error: 'API quota exceeded. Please try again later.' },
          { status: 429 }
        );
      }

      if (error.message.includes('invalid') || error.message.includes('authentication')) {
        return NextResponse.json(
          { error: 'Invalid API key or authentication failed' },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate script. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Video script generation API',
    version: '1.0.0',
    endpoints: {
      POST: '/api/video/story - Generate video script from topic'
    }
  });
}