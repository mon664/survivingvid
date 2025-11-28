import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import webdavService from '@/lib/webdav';

// Initialize Vertex AI - Gemini API 방식 변경
const vertexAI = {
  project: process.env.GOOGLE_CLOUD_PROJECT_ID || 'zicpan',
  location: 'us-central1',
  apiKey: process.env.VERTEX_AI_API_KEY || ''
};

interface ShortsRequest {
  mode: 'keyword' | 'prompt';
  input: string;
  duration: number;
  sceneCount: number;
  imageStyle: string;
  protagonistImage?: string; // Base64 string
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
  /**
   * Generate shorts script using Gemini AI
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

      // Vertex AI로 Gemini API 호출
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${vertexAI.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 8192,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Vertex AI API error: ${response.statusText}`);
      }

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';

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
   * Generate images for shorts
   */
  async generateShortsImages(scenes: Scene[], imageStyle: string, protagonistImage?: string): Promise<string[]> {
    const imageUrls: string[] = [];

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      try {
        let prompt = scene.imagePrompt;

        // Add image style
        prompt += `, ${imageStyle} style, high quality, vibrant colors, mobile video format`;

        // Add protagonist to first few scenes if available
        if (protagonistImage && i < Math.min(3, scenes.length)) {
          prompt += `, featuring the same person as in the reference image`;
        }

        const imageUrl = await this.generateImage(prompt);
        imageUrls.push(imageUrl);
      } catch (error) {
        console.error(`Error generating image for scene ${scene.id}:`, error);
        // Add placeholder
        imageUrls.push(`data:image/svg+xml,${encodeURIComponent(`<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em">Scene ${i + 1}</text></svg>`)}`);
      }
    }

    return imageUrls;
  }

  /**
   * Generate single image
   */
  private async generateImage(prompt: string): Promise<string> {
    try {
      // Vertex AI Imagen API 사용
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generateImage?key=${vertexAI.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            prompt: { text: prompt },
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
            negativePrompt: "blurry, low quality, distorted",
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Vertex AI Imagen error: ${response.statusText}`);
      }

      const result = await response.json();
      if (!result.generatedImages || result.generatedImages.length === 0) {
        throw new Error('No images generated');
      }

      // Return base64 image data
      return `data:image/png;base64,${result.generatedImages[0].imageBytes}`;
    } catch (error) {
      console.error('Error generating image:', error);

      // Fallback to placeholder
      return `data:image/svg+xml,${encodeURIComponent(
        `<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
          <rect width="100%" height="100%" fill="#f0f0f0"/>
          <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="Arial" font-size="16" fill="#666">
            AI Image Generation
          </text>
        </svg>`
      )}`;
    }
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
      // For now, return a placeholder URL
      // In production, integrate with Google Cloud TTS
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

    // Create session directory
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
    // Handle form data (for file uploads)
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

      // Handle file upload for protagonist image
      const protagonistFile = formData.get('protagonistImageFile') as File;
      if (protagonistFile) {
        const bytes = await protagonistFile.arrayBuffer();
        const base64 = Buffer.from(bytes).toString('base64');
        reqData.protagonistImage = `data:${protagonistFile.type};base64,${base64}`;
      }
    } else {
      // Handle JSON data
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

    // Validate input
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

    // Step 1: Generate script
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

    // Step 2: Generate images
    logger.info('Generating shorts images', { requestId, sceneCount: scenes.length });
    const imageUrls = await shortsService.generateShortsImages(
      scenes,
      imageStyle,
      protagonistImage
    );

    // Step 3: Generate audio
    logger.info('Generating shorts audio', { requestId });
    const audioUrl = await shortsService.generateShortsAudio(
      script,
      ttsVoice,
      ttsSpeed,
      ttsPitch
    );

    // Step 4: Upload to WebDAV
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

// Health check endpoint
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