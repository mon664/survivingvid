import { NextRequest, NextResponse } from 'next/server';
import { logger, createApiHandler } from '@/lib/logger';

// For now, use a mock image generation approach until we set up proper Vertex AI authentication
function generateMockImageBase64(prompt: string): string {
  // Create a simple SVG placeholder based on the prompt
  const color = prompt.toLowerCase().includes('hospital') ? '#4A90E2' :
                prompt.toLowerCase().includes('ai') ? '#7B68EE' : '#50C878';

  const svg = `
    <svg width="1920" height="1080" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:${color};stop-opacity:0.8" />
          <stop offset="100%" style="stop-color:${color};stop-opacity:0.3" />
        </linearGradient>
      </defs>
      <rect width="1920" height="1080" fill="url(#grad)" />
      <text x="960" y="540" font-family="Arial, sans-serif" font-size="48" fill="white" text-anchor="middle">
        ${prompt.substring(0, 100)}${prompt.length > 100 ? '...' : ''}
      </text>
      <text x="960" y="600" font-family="Arial, sans-serif" font-size="24" fill="white" text-anchor="middle" opacity="0.8">
        AI Generated Image Placeholder
      </text>
    </svg>
  `.trim();

  // Convert SVG to base64
  return Buffer.from(svg).toString('base64');
}

// Internal handler function
async function handleImageGeneration(request: NextRequest, context: { requestId: string, startTime: number }) {
  try {
    const { script, style = 'realistic' } = await request.json();

    logger.info('Starting image generation', {
      requestId: context.requestId,
      segmentsCount: script?.segments?.length || 0,
      style
    });

    // Validate input
    if (!script || !script.segments || !Array.isArray(script.segments)) {
      logger.warn('Invalid script format', {
        requestId: context.requestId,
        error: 'Segments array is required'
      });
      return NextResponse.json(
        { error: 'Invalid script format: segments array is required' },
        { status: 400 }
      );
    }

    if (script.segments.length === 0) {
      logger.warn('Empty script', {
        requestId: context.requestId,
        error: 'Script must contain at least one segment'
      });
      return NextResponse.json(
        { error: 'Script must contain at least one segment' },
        { status: 400 }
      );
    }

    if (script.segments.length > 10) {
      logger.warn('Too many segments', {
        requestId: context.requestId,
        segmentsCount: script.segments.length
      });
      return NextResponse.json(
        { error: 'Too many segments. Maximum 10 segments allowed.' },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!process.env.VERTEX_AI_API_KEY) {
      logger.error('Vertex AI API key not configured', {
        requestId: context.requestId
      });
      return NextResponse.json(
        { error: 'Vertex AI API key is not configured' },
        { status: 500 }
      );
    }

    const images = [];

    // Generate images for each segment
    for (let i = 0; i < script.segments.length; i++) {
      const segment = script.segments[i];

      logger.debug(`Generating image for segment ${i + 1}`, {
        requestId: context.requestId,
        segmentId: segment.id || i + 1,
        promptLength: segment.imagePrompt?.length || 0
      });

      // Enhance the image prompt with style and quality specifications
      const enhancedPrompt = `${segment.imagePrompt}. ${style === 'cartoon' ? 'Digital illustration, cartoon style, bright colors' : style === 'artistic' ? 'Artistic rendering, painterly style, creative interpretation' : 'Photorealistic, high quality, detailed, professional lighting'}. 16:9 aspect ratio suitable for video.`;

      try {
        // Generate mock image for now - in production this would call Vertex AI Imagen
        const mockImageBase64 = generateMockImageBase64(enhancedPrompt);

        images.push({
          segmentId: segment.id || i + 1,
          image: `data:image/svg+xml;base64,${mockImageBase64}`,
          prompt: enhancedPrompt,
          metadata: {
            generationMethod: 'mock_svg_placeholder',
            generationParameters: {
              aspectRatio: '16:9',
              style: style
            },
            note: 'This is a placeholder image. In production, Vertex AI Imagen would generate actual images.'
          }
        });

        logger.info(`Successfully generated mock image for segment ${i + 1}`, {
          requestId: context.requestId,
          segmentId: segment.id || i + 1
        });

      } catch (segmentError) {
        logger.error(`Error generating image for segment ${i + 1}`, {
          requestId: context.requestId,
          segmentId: segment.id || i + 1,
          error: segmentError instanceof Error ? segmentError.message : 'Unknown error'
        });

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
      logger.error('No images generated successfully', {
        requestId: context.requestId,
        totalSegments: script.segments.length
      });
      return NextResponse.json(
        { error: 'Failed to generate any images. Please check your API configuration and try again.' },
        { status: 500 }
      );
    }

    logger.info('Image generation completed', {
      requestId: context.requestId,
      totalSegments: script.segments.length,
      successfulGenerations: successfulImages.length,
      failedGenerations: script.segments.length - successfulImages.length
    });

    // Return success response
    logger.logApiSuccess(request, context.requestId, {
      segmentsCount: script.segments.length,
      successfulGenerations: successfulImages.length,
      generatedAt: new Date().toISOString()
    });

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
    const errorObj = error instanceof Error ? error : new Error('Unknown error');

    logger.error('Image generation failed', {
      requestId: context.requestId,
      error: errorObj.message,
      stack: errorObj.stack
    });

    // Handle specific Vertex AI errors
    if (errorObj.message.includes('quota') || errorObj.message.includes('limit')) {
      return NextResponse.json(
        { error: 'API quota exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    if (errorObj.message.includes('permission') || errorObj.message.includes('authentication')) {
      return NextResponse.json(
        { error: 'Invalid API credentials or insufficient permissions' },
        { status: 401 }
      );
    }

    if (errorObj.message.includes('safety')) {
      return NextResponse.json(
        { error: 'Image generation blocked by safety filters. Please modify your content and try again.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate images. Please try again later.' },
      { status: 500 }
    );
  }
}

// Export wrapped handlers
export const POST = createApiHandler(async (request: NextRequest, context: { requestId: string, startTime: number }) => {
  return await handleImageGeneration(request, context);
});

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