import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { logger, createApiHandler } from '@/lib/logger';

interface AssemblyRequest {
  script: {
    segments: Array<{
      id: number;
      narrative: string;
      imagePrompt: string;
    }>;
    title: string;
    description: string;
  };
  template: {
    id: string;
    name: string;
    directory: string;
    backgroundColor: string;
    isDefault: boolean;
  };
  images: string[];
  audioUrl: string;
}

// Internal handler function
async function handleVideoAssembly(request: NextRequest, context: { requestId: string, startTime: number }) {
  try {
    const body: AssemblyRequest = await request.json();

    logger.info('Starting video assembly', {
      requestId: context.requestId,
      segmentsCount: body.script.segments.length,
      templateName: body.template.name,
      hasImages: body.images.length > 0,
      hasAudio: !!body.audioUrl
    });

    // Validate input
    if (!body.script || !body.template || !body.images || !body.audioUrl) {
      logger.warn('Invalid assembly request', {
        requestId: context.requestId,
        hasScript: !!body.script,
        hasTemplate: !!body.template,
        hasImages: !!body.images,
        hasAudio: !!body.audioUrl
      });
      return NextResponse.json(
        { error: 'Missing required fields: script, template, images, and audioUrl are required' },
        { status: 400 }
      );
    }

    // Validate images array
    if (body.images.length !== body.script.segments.length) {
      logger.warn('Images count mismatch', {
        requestId: context.requestId,
        imagesCount: body.images.length,
        segmentsCount: body.script.segments.length
      });
      return NextResponse.json(
        { error: 'Number of images must match number of script segments' },
        { status: 400 }
      );
    }

    // For now, create a mock video URL
    // In a real implementation, this would:
    // 1. Download images and audio
    // 2. Use FFmpeg to assemble the video
    // 3. Apply template effects
    // 4. Add text overlays and transitions
    // 5. Upload to storage and return URL

    logger.info('Assembling video components', {
      requestId: context.requestId,
      step: 'component_preparation'
    });

    // Simulate video assembly process
    const assemblySteps = [
      { name: 'Processing images', duration: 2000 },
      { name: 'Processing audio', duration: 1500 },
      { name: 'Applying template', duration: 1000 },
      { name: 'Adding text overlays', duration: 1500 },
      { name: 'Rendering video', duration: 3000 },
      { name: 'Finalizing', duration: 500 }
    ];

    let totalDuration = 0;
    for (const step of assemblySteps) {
      totalDuration += step.duration;
      logger.debug(`Assembly step: ${step.name}`, {
        requestId: context.requestId,
        step: step.name,
        duration: step.duration
      });
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, Math.min(totalDuration, 5000)));

    // Generate mock video URL
    const videoId = `video_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const mockVideoUrl = `https://example.com/videos/${videoId}.mp4`;

    logger.info('Video assembly completed', {
      requestId: context.requestId,
      videoId,
      videoUrl: mockVideoUrl,
      totalDuration,
      segmentsCount: body.script.segments.length
    });

    // In a real implementation, you would return the actual video URL
    // For now, we'll return a mock response with the generated video URL
    return NextResponse.json({
      success: true,
      data: {
        videoUrl: mockVideoUrl,
        metadata: {
          title: body.script.title,
          description: body.script.description,
          template: body.template.name,
          duration: body.script.segments.length * 5, // Estimate 5 seconds per segment
          resolution: '1920x1080',
          format: 'mp4',
          size: '15.2MB', // Estimated size
          segmentsCount: body.script.segments.length,
          createdAt: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    const errorObj = error instanceof Error ? error : new Error('Unknown error');

    logger.error('Video assembly failed', {
      requestId: context.requestId,
      error: errorObj.message,
      stack: errorObj.stack
    });

    // Handle specific errors
    if (errorObj.message.includes('invalid format')) {
      return NextResponse.json(
        { error: 'Invalid file format provided' },
        { status: 400 }
      );
    }

    if (errorObj.message.includes('corrupted')) {
      return NextResponse.json(
        { error: 'File appears to be corrupted' },
        { status: 400 }
      );
    }

    if (errorObj.message.includes('timeout')) {
      return NextResponse.json(
        { error: 'Video assembly timed out. Please try with shorter content.' },
        { status: 408 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to assemble video. Please try again.' },
      { status: 500 }
    );
  }
}

// Export wrapped handlers
export const POST = createApiHandler(async (request: NextRequest, context: { requestId: string, startTime: number }) => {
  return await handleVideoAssembly(request, context);
});

export async function GET() {
  return NextResponse.json({
    message: 'Video assembly API',
    version: '1.0.0',
    description: 'Assembles images and audio into a video using FFmpeg',
    endpoints: {
      POST: {
        path: '/api/video/assemble',
        description: 'Assemble video from script, template, images, and audio',
        requestBody: {
          script: 'Script object with segments',
          template: 'Template object with styling information',
          images: 'Array of image URLs (one per segment)',
          audioUrl: 'URL of the generated audio file'
        },
        response: {
          videoUrl: 'URL of the assembled video',
          metadata: 'Video metadata including duration, resolution, etc.'
        }
      }
    }
  });
}