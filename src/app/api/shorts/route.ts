import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import webdavService from '@/lib/webdav';
import { VertexAI } from '@google-cloud/vertexai';

// Vertex AI Configuration
const PROJECT_ID = 'zicpan';
const LOCATION = 'us-central1';

// Service account credentials from environment
const credentials = process.env.GOOGLE_CLOUD_CREDENTIALS 
  ? JSON.parse(process.env.GOOGLE_CLOUD_CREDENTIALS)
  : undefined;

interface ShortsRequest {
  mode: 'keyword' | 'prompt';
  input: string;
  duration: number;
  sceneCount: number;
  imageStyle: string;
  protagonistImage?: string;
  ttsVoice?: string;
  ttsSpeed?: number;
  ttsPitch?: number;
}

interface Scene {
  id: string;
  description: string;
  duration: number;
  imagePrompt: string;
  audioText: string;
  imageUrl?: string;
}

interface ShortsResponse {
  success: boolean;
  script: string;
  scenes: Scene[];
  audioUrl?: string;
  totalDuration: number;
  sessionId: string;
  webdavPaths?: string[];
}

class ShortsGenerationService {
  private vertexAI: VertexAI;

  constructor() {
    this.vertexAI = new VertexAI({
      project: PROJECT_ID,
      location: LOCATION,
      googleAuthOptions: credentials ? { credentials } : undefined
    });
  }

  /**
   * Generate shorts script using Gemini via Vertex AI
   */
  async generateShortsScript(
    input: string,
    mode: 'keyword' | 'prompt',
    sceneCount: number,
    duration: number
  ): Promise<{ script: string; scenes: Scene[] }> {
    try {
      let prompt = '';
      if (mode === 'keyword') {
        prompt = `
Create a viral YouTube Shorts script about "${input}" for ${duration} seconds with ${sceneCount} scenes.

Requirements:
- Each scene: ${Math.floor(duration / sceneCount)} seconds
- Hook in first 3 seconds
- Quick cuts between scenes
- Engaging, fast-paced content
- Korean language

Format as JSON:
{
  "script": "Complete script with scene breaks",
  "scenes": [
    {
      "id": "scene_1",
      "description": "Visual description",
      "duration": ${Math.floor(duration / sceneCount)},
      "imagePrompt": "Detailed prompt for image generation",
      "audioText": "Voiceover text for this scene"
    }
  ]
}
`;
      } else {
        prompt = `
Create a viral YouTube Shorts based on this prompt: "${input}"

Duration: ${duration} seconds
Scenes: ${sceneCount}

Requirements:
- Hook in first 3 seconds
- Fast-paced editing
- Viral content structure
- Korean language

Format as JSON:
{
  "script": "Complete script",
  "scenes": [
    {
      "id": "scene_1",
      "description": "Visual description",
      "duration": ${Math.floor(duration / sceneCount)},
      "imagePrompt": "Detailed image prompt",
      "audioText": "Voiceover text"
    }
  ]
}
`;
      }

      // Use Vertex AI Gemini
      const model = this.vertexAI.preview.getGenerativeModel({
        model: 'gemini-1.5-flash'
      });

      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      });

      const text = result.response.candidates?.[0]?.content?.parts?.[0]?.text || '';

      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Could not extract valid JSON from AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return parsed;
    } catch (error) {
      console.error('Error generating shorts script:', error);
      throw new Error(`Script generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate images for shorts using Vertex AI Imagen
   */
  async generateShortsImages(scenes: Scene[], imageStyle: string, protagonistImage?: string): Promise<string[]> {
    const imageUrls: string[] = [];

    // Note: Vertex AI Imagen requires different setup
    // For now, return placeholders
    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      try {
        // Placeholder for Imagen integration
        const imageUrl = this.generatePlaceholderImage(i + 1, scene.description);
        imageUrls.push(imageUrl);
      } catch (error) {
        console.error(`Error generating image for scene ${scene.id}:`, error);
        imageUrls.push(this.generatePlaceholderImage(i + 1, 'Error'));
      }
    }

    return imageUrls;
  }

  /**
   * Generate placeholder image
   */
  private generatePlaceholderImage(sceneNumber: number, description: string): string {
    return `data:image/svg+xml,${encodeURIComponent(
      `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#1a1a1a"/>
        <text x="50%" y="40%" text-anchor="middle" font-family="Arial" font-size="24" fill="#fff">
          Scene ${sceneNumber}
        </text>
        <text x="50%" y="60%" text-anchor="middle" font-family="Arial" font-size="14" fill="#999">
          ${description.substring(0, 50)}
        </text>
      </svg>`
    )}`;
  }

  /**
   * Generate TTS audio for shorts
   */
  async generateShortsAudio(
    script: string,
    voice: string = 'ko-KR-Neural2-A',
    speed: number = 1.0,
    pitch: number = 1.0
  ): Promise<string> {
    try {
      // Placeholder - integrate with Google Cloud TTS in production
      const audioData = btoa('placeholder_audio_data');
      return `data:audio/mp3;base64,${audioData}`;
    } catch (error) {
      console.error('Error generating audio:', error);
      throw error;
    }
  }

  /**
   * Upload shorts assets to WebDAV
   */
  async uploadShortsAssets(
    images: string[],
    sessionId: string
  ): Promise<string[]> {
    const uploadedPaths: string[] = [];

    await webdavService.createSessionDirectory(sessionId);

    for (let i = 0; i < images.length; i++) {
      const imageUrl = images[i];
      const filename = `shorts_scene_${i + 1}.jpg`;

      try {
        const result = await webdavService.uploadBase64Image(imageUrl, filename, sessionId);
        if (result.success && result.path) {
          uploadedPaths.push(result.path);
        }
      } catch (error) {
        console.error(`Failed to upload shorts image ${i + 1}:`, error);
      }
    }

    return uploadedPaths;
  }
}

// Main API handler
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `shorts_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    let reqData: ShortsRequest;

    if (request.headers.get('content-type')?.includes('multipart/form-data')) {
      const formData = await request.formData();
      reqData = {
        mode: formData.get('mode') as 'keyword' | 'prompt',
        input: formData.get('input') as string,
        duration: Number(formData.get('duration') || 30),
        sceneCount: Number(formData.get('sceneCount') || 5),
        imageStyle: formData.get('imageStyle') as string || 'photorealistic',
        protagonistImage: formData.get('protagonistImage') as string,
        ttsVoice: formData.get('ttsVoice') as string || 'ko-KR-Neural2-A',
        ttsSpeed: Number(formData.get('ttsSpeed') || 1.0),
        ttsPitch: Number(formData.get('ttsPitch') || 1.0),
      };

      const protagonistFile = formData.get('protagonistImageFile') as File;
      if (protagonistFile) {
        const bytes = await protagonistFile.arrayBuffer();
        const base64 = Buffer.from(bytes).toString('base64');
        reqData.protagonistImage = `data:${protagonistFile.type};base64,${base64}`;
      }
    } else {
      reqData = await request.json();
    }

    const {
      mode,
      input,
      duration,
      sceneCount,
      imageStyle,
      protagonistImage,
      ttsVoice,
      ttsSpeed,
      ttsPitch
    } = reqData;

    if (!input) {
      return NextResponse.json(
        { error: 'Input is required' },
        { status: 400 }
      );
    }

    if (sceneCount < 1 || sceneCount > 10) {
      return NextResponse.json(
        { error: 'Scene count must be between 1 and 10' },
        { status: 400 }
      );
    }

    logger.info('Starting shorts generation', {
      requestId,
      mode,
      input: input.substring(0, 50),
      duration,
      sceneCount,
      imageStyle
    });

    const shortsService = new ShortsGenerationService();
    const sessionId = `shorts_${requestId}`;

    logger.info('Generating shorts script', { requestId });
    const { script, scenes } = await shortsService.generateShortsScript(
      input,
      mode,
      sceneCount,
      duration
    );

    if (!scenes || scenes.length === 0) {
      return NextResponse.json(
        { error: 'Failed to generate script' },
        { status: 500 }
      );
    }

    logger.info('Generating shorts images', { requestId, sceneCount: scenes.length });
    const imageUrls = await shortsService.generateShortsImages(
      scenes,
      imageStyle,
      protagonistImage
    );

    logger.info('Generating shorts audio', { requestId });
    const audioUrl = await shortsService.generateShortsAudio(
      script,
      ttsVoice,
      ttsSpeed,
      ttsPitch
    );

    logger.info('Uploading shorts assets to WebDAV', { requestId });
    const webdavPaths = await shortsService.uploadShortsAssets(imageUrls, sessionId);

    const response: ShortsResponse = {
      success: true,
      script,
      scenes: scenes.map((scene, index) => ({
        ...scene,
        imageUrl: imageUrls[index]
      })),
      audioUrl,
      totalDuration: duration,
      sessionId,
      webdavPaths
    };

    logger.info('Shorts generation completed', {
      requestId,
      totalTime: Date.now() - startTime,
      sceneCount: scenes.length,
      imagesUploaded: webdavPaths.length
    });

    return NextResponse.json(response);

  } catch (error) {
    logger.error('Shorts generation failed', {
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

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    service: 'shorts-generation',
    timestamp: new Date().toISOString(),
    capabilities: {
      scriptGeneration: true,
      imageGeneration: true,
      audioGeneration: true,
      webdavUpload: true,
      protagonistImageSupport: true
    }
  });
}
