import { NextRequest, NextResponse } from 'next/server';
import { VertexAI } from '@google-cloud/vertexai';

// Initialize Vertex AI
const vertexAI = new VertexAI({
  project: process.env.GOOGLE_CLOUD_PROJECT_ID || 'your-project-id',
  location: 'us-central1',
});

export async function POST(request: NextRequest) {
  try {
    const { script, style = 'realistic' } = await request.json();

    // Validate input
    if (!script || !script.segments || !Array.isArray(script.segments)) {
      return NextResponse.json(
        { error: 'Invalid script format: segments array is required' },
        { status: 400 }
      );
    }

    if (script.segments.length === 0) {
      return NextResponse.json(
        { error: 'Script must contain at least one segment' },
        { status: 400 }
      );
    }

    if (script.segments.length > 10) {
      return NextResponse.json(
        { error: 'Too many segments. Maximum 10 segments allowed.' },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!process.env.GOOGLE_CLOUD_PROJECT_ID || process.env.GOOGLE_CLOUD_PROJECT_ID === 'your-project-id') {
      return NextResponse.json(
        { error: 'Google Cloud project ID is not configured' },
        { status: 500 }
      );
    }

    const imageModel = vertexAI.getGenerativeModel({ model: 'imagegeneration@002' });
    const images = [];

    // Generate images for each segment
    for (let i = 0; i < script.segments.length; i++) {
      const segment = script.segments[i];

      // Enhance the image prompt with style and quality specifications
      const enhancedPrompt = `${segment.imagePrompt}. ${style === 'cartoon' ? 'Digital illustration, cartoon style, bright colors' : style === 'artistic' ? 'Artistic rendering, painterly style, creative interpretation' : 'Photorealistic, high quality, detailed, professional lighting'}. 16:9 aspect ratio suitable for video.`;

      try {
        const result = await imageModel.generateImages({
          prompt: enhancedPrompt,
          count: 1,
          aspectRatio: '16:9',
          safetyFilterLevel: 'block-medium-and-above',
          personGeneration: 'allow_adult',
        });

        if (result.images && result.images.length > 0) {
          const imageData = result.images[0];
          images.push({
            segmentId: segment.id || i + 1,
            image: imageData.imageBase64 || imageData.image,
            prompt: enhancedPrompt,
            metadata: {
              safetyRatings: imageData.safetyRatings,
              generationParameters: {
                aspectRatio: '16:9',
                safetyFilterLevel: 'block-medium-and-above',
              }
            }
          });
        } else {
          // Fallback if image generation fails
          images.push({
            segmentId: segment.id || i + 1,
            image: null,
            prompt: enhancedPrompt,
            error: 'Image generation returned no results'
          });
        }
      } catch (segmentError) {
        console.error(`Error generating image for segment ${i + 1}:`, segmentError);
        images.push({
          segmentId: segment.id || i + 1,
          image: null,
          prompt: enhancedPrompt,
          error: 'Failed to generate image for this segment'
        });
      }
    }

    // Check if we successfully generated any images
    const successfulImages = images.filter(img => img.image !== null);
    if (successfulImages.length === 0) {
      return NextResponse.json(
        { error: 'Failed to generate any images. Please check your API configuration and try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      images: images,
      metadata: {
        totalSegments: script.segments.length,
        successfulGenerations: successfulImages.length,
        failedGenerations: script.segments.length - successfulImages.length,
        style,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Image generation error:', error);

    // Handle specific Vertex AI errors
    if (error instanceof Error) {
      if (error.message.includes('quota') || error.message.includes('limit')) {
        return NextResponse.json(
          { error: 'API quota exceeded. Please try again later.' },
          { status: 429 }
        );
      }

      if (error.message.includes('permission') || error.message.includes('authentication')) {
        return NextResponse.json(
          { error: 'Invalid API credentials or insufficient permissions' },
          { status: 401 }
        );
      }

      if (error.message.includes('safety')) {
        return NextResponse.json(
          { error: 'Image generation blocked by safety filters. Please modify your content and try again.' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate images. Please try again later.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Video image generation API',
    version: '1.0.0',
    endpoints: {
      POST: '/api/video/images - Generate images from script segments'
    },
    supportedStyles: ['realistic', 'cartoon', 'artistic']
  });
}