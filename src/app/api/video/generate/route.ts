import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import webdavService from '@/lib/webdav';
import { logger } from '@/lib/logger';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface GenerateVideoRequest {
  topic: string;
  style?: 'educational' | 'entertainment' | 'promotional' | 'storytelling';
  duration?: number; // in seconds
  sceneCount?: number;
  imageStyle?: 'realistic' | 'cartoon' | 'anime' | 'artistic';
  includeSubtitles?: boolean;
  includeBGM?: boolean;
}

interface Scene {
  id: string;
  description: string;
  duration: number;
  imagePrompt: string;
  audioText: string;
}

interface GeneratedVideo {
  id: string;
  title: string;
  scenes: Scene[];
  totalDuration: number;
  style: string;
  createdAt: string;
}

class VideoGenerationService {
  /**
   * Generate video script using Gemini AI
   */
  async generateScript(topic: string, style: string, sceneCount: number): Promise<Scene[]> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `
Create a ${sceneCount}-scene video script about "${topic}" in ${style} style.

For each scene, provide:
1. Scene description (visual elements)
2. Duration in seconds (10-30 seconds per scene)
3. Image generation prompt (detailed, for AI image generation)
4. Voiceover text (what the narrator says)

Format as JSON array:
{
  "scenes": [
    {
      "id": "scene_1",
      "description": "Scene description",
      "duration": 15,
      "imagePrompt": "Detailed image prompt for AI generation",
      "audioText": "Voiceover text for this scene"
    }
  ]
}

Make it engaging and suitable for video format. Total duration should be around ${sceneCount * 15} seconds.
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not extract valid JSON from AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.scenes || [];
    } catch (error) {
      console.error('Error generating script:', error);
      throw new Error(`Script generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate images for scenes using Hugging Face or other AI service
   */
  async generateSceneImages(scenes: Scene[], imageStyle: string): Promise<string[]> {
    const imageUrls: string[] = [];

    for (const scene of scenes) {
      try {
        // Modify prompt based on style
        const styledPrompt = `${scene.imagePrompt}, ${imageStyle} style, high quality, detailed`;

        // For now, return placeholder URLs - implement actual image generation
        const imageUrl = await this.generateImage(styledPrompt);
        imageUrls.push(imageUrl);
      } catch (error) {
        console.error(`Error generating image for scene ${scene.id}:`, error);
        // Add placeholder image
        imageUrls.push(`data:image/svg+xml,${encodeURIComponent(`<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em">Scene ${scene.id.split('_')[1]}</text></svg>`)}`);
      }
    }

    return imageUrls;
  }

  /**
   * Generate single image using Vertex AI
   */
  private async generateImage(prompt: string): Promise<string> {
    try {
      // Use Vertex AI for image generation
      if (!process.env.VERTEX_AI_API_KEY) {
        throw new Error('Vertex AI API key not configured');
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImage?key=${process.env.VERTEX_AI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: {
              text: prompt,
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE"
              }
            ],
            aspectRatio: "1:1",
            negativePrompt: "blurry, low quality, distorted, ugly",
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Vertex AI API error: ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();

      if (!result.generatedImages || result.generatedImages.length === 0) {
        throw new Error('No images generated');
      }

      // Return base64 image data
      return result.generatedImages[0].imageBytes;
    } catch (error) {
      console.error('Error generating image:', error);

      // Fallback to placeholder
      return `data:image/svg+xml,${encodeURIComponent(
        `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f0f0f0"/>
          <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="16" fill="#666">
            AI Image Generation Unavailable
          </text>
        </svg>`
      )}`;
    }
  }

  /**
   * Upload images to WebDAV storage
   */
  async uploadImagesToWebDAV(imageUrls: string[], sessionId: string): Promise<string[]> {
    const uploadedPaths: string[] = [];

    // Create session directory
    await webdavService.createSessionDirectory(sessionId);

    for (let i = 0; i < imageUrls.length; i++) {
      const imageUrl = imageUrls[i];
      const filename = `scene_${i + 1}.jpg`;

      try {
        const result = await webdavService.uploadBase64Image(imageUrl, filename, sessionId);
        if (result.success && result.path) {
          uploadedPaths.push(result.path);
        }
      } catch (error) {
        console.error(`Failed to upload image ${i + 1}:`, error);
      }
    }

    return uploadedPaths;
  }

  /**
   * Generate subtitles for scenes
   */
  async generateSubtitles(scenes: Scene[]): Promise<string> {
    let subtitles = '[V4+ Styles]\n';
    subtitles += 'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\n';
    subtitles += 'Style: Title,NanumSquareBold,100,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,1,0,2,10,10,10,1\n';
    subtitles += 'Style: Default,NanumSquareRegular,72,&H00FFFFFF,&H00FFFFFF,&H00000000,&H80000000,0,0,0,0,100,100,0,0,1,1,0,2,10,10,10,1\n\n';

    subtitles += '[Events]\n';
    subtitles += 'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n';

    let currentTime = 0;
    for (const scene of scenes) {
      const startTime = this.formatTime(currentTime);
      const endTime = this.formatTime(currentTime + scene.duration);

      subtitles += `Dialogue: 0,${startTime},${endTime},Default,,0,0,0,,${scene.audioText}\n`;
      currentTime += scene.duration;
    }

    return subtitles;
  }

  /**
   * Format time for subtitles (HH:MM:SS.ms)
   */
  private formatTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    const ms = Math.floor((secs % 1) * 100);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${Math.floor(secs).toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  }
}

// Main API handler
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    const body: GenerateVideoRequest = await request.json();
    const {
      topic,
      style = 'educational',
      duration = 60,
      sceneCount = Math.min(Math.max(Math.floor(duration / 15), 3), 8),
      imageStyle = 'realistic',
      includeSubtitles = true,
      includeBGM = false
    } = body;

    // Validate input
    if (!topic || typeof topic !== 'string') {
      return NextResponse.json(
        { error: 'Topic is required' },
        { status: 400 }
      );
    }

    if (sceneCount < 1 || sceneCount > 10) {
      return NextResponse.json(
        { error: 'Scene count must be between 1 and 10' },
        { status: 400 }
      );
    }

    logger.info('Starting video generation', {
      requestId,
      topic,
      style,
      sceneCount,
      imageStyle
    });

    const videoService = new VideoGenerationService();
    const sessionId = `video_${requestId}`;

    // Step 1: Generate script
    logger.info('Generating script', { requestId });
    const scenes = await videoService.generateScript(topic, style, sceneCount);

    if (!scenes || scenes.length === 0) {
      return NextResponse.json(
        { error: 'Failed to generate script' },
        { status: 500 }
      );
    }

    // Step 2: Generate images
    logger.info('Generating images', { requestId, sceneCount: scenes.length });
    const imageUrls = await videoService.generateSceneImages(scenes, imageStyle);

    // Step 3: Upload to WebDAV
    logger.info('Uploading images to WebDAV', { requestId });
    const uploadedPaths = await videoService.uploadImagesToWebDAV(imageUrls, sessionId);

    // Step 4: Generate subtitles
    let subtitles = '';
    if (includeSubtitles) {
      logger.info('Generating subtitles', { requestId });
      subtitles = await videoService.generateSubtitles(scenes);
    }

    // Create response
    const generatedVideo: GeneratedVideo = {
      id: sessionId,
      title: `${topic} - ${style} video`,
      scenes,
      totalDuration: scenes.reduce((sum, scene) => sum + scene.duration, 0),
      style,
      createdAt: new Date().toISOString()
    };

    const response = {
      success: true,
      video: generatedVideo,
      assets: {
        images: imageUrls,
        uploadedPaths,
        subtitles: includeSubtitles ? subtitles : null,
        sessionId
      },
      processing: {
        totalTime: Date.now() - startTime,
        requestId
      }
    };

    logger.info('Video generation completed', {
      requestId,
      totalTime: Date.now() - startTime,
      sceneCount: scenes.length,
      imagesUploaded: uploadedPaths.length
    });

    return NextResponse.json(response);

  } catch (error) {
    logger.error('Video generation failed', {
      requestId,
      error: error instanceof Error ? error.message : 'Unknown error',
      totalTime: Date.now() - startTime
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        requestId,
        totalTime: Date.now() - startTime
      },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'video-generation',
    timestamp: new Date().toISOString(),
    capabilities: {
      scriptGeneration: true,
      imageGeneration: true,
      webdavUpload: true,
      subtitleGeneration: true
    }
  });
}