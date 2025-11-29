import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import webdavService from '@/lib/webdav';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyCNtAw24x9ku6LssRakV70R3XmgH5Qu1fU';

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
  async generateShortsScript(input: string, mode: 'keyword' | 'prompt', sceneCount: number, duration: number): Promise<{ script: string; scenes: Scene[] }> {
    try {
      let prompt = '';
      if (mode === 'keyword') {
        prompt = `Create a viral YouTube Shorts script about "${input}" for ${duration} seconds with ${sceneCount} scenes.\n\nRequirements:\n- Each scene: ${Math.floor(duration / sceneCount)} seconds\n- Hook in first 3 seconds\n- Quick cuts\n- Korean language\n\nFormat as JSON:\n{\n  "script": "Complete script",\n  "scenes": [{"id": "scene_1", "description": "Visual", "duration": ${Math.floor(duration / sceneCount)}, "imagePrompt": "Prompt", "audioText": "Text"}]\n}`;
      } else {
        prompt = `Create YouTube Shorts: "${input}"\n\nDuration: ${duration}s, Scenes: ${sceneCount}\nKorean language\n\nJSON format:\n{"script": "...", "scenes": [{"id": "scene_1", "description": "...", "duration": ${Math.floor(duration / sceneCount)}, "imagePrompt": "...", "audioText": "..."}]}`;
      }

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': GEMINI_API_KEY },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7, topK: 40, topP: 0.95, maxOutputTokens: 8192 } })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Gemini API error (${response.status}): ${errorText}`);
      }

      const result = await response.json();
      const text = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error('Could not extract JSON');
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      throw new Error(`Script generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateShortsImages(scenes: Scene[]): Promise<string[]> {
    return scenes.map((scene, i) => `data:image/svg+xml,${encodeURIComponent(`<svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#1a1a2e"/><text x="50%" y="50%" text-anchor="middle" font-family="Arial" font-size="48" fill="#fff">Scene ${i + 1}</text></svg>`)}`);
  }

  async generateShortsAudio(): Promise<string> {
    return `data:audio/mp3;base64,${btoa('placeholder')}`;
  }

  async uploadShortsAssets(images: string[], sessionId: string): Promise<string[]> {
    const uploadedPaths: string[] = [];
    await webdavService.createSessionDirectory(sessionId);
    for (let i = 0; i < images.length; i++) {
      try {
        const result = await webdavService.uploadBase64Image(images[i], `shorts_scene_${i + 1}.jpg`, sessionId);
        if (result.success && result.path) uploadedPaths.push(result.path);
      } catch (error) { console.error(`Failed upload ${i + 1}:`, error); }
    }
    return uploadedPaths;
  }
}

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
    } else {
      reqData = await request.json();
    }

    const { mode, input, duration, sceneCount, imageStyle, protagonistImage, ttsVoice, ttsSpeed, ttsPitch } = reqData;
    if (!input) return NextResponse.json({ error: 'Input required' }, { status: 400 });
    if (sceneCount < 1 || sceneCount > 10) return NextResponse.json({ error: 'Scene count 1-10' }, { status: 400 });

    logger.info('Starting shorts generation', { requestId, mode, input: input.substring(0, 50) });
    const shortsService = new ShortsGenerationService();
    const sessionId = `shorts_${requestId}`;

    const { script, scenes } = await shortsService.generateShortsScript(input, mode, sceneCount, duration);
    if (!scenes || scenes.length === 0) return NextResponse.json({ error: 'Failed to generate script' }, { status: 500 });

    const imageUrls = await shortsService.generateShortsImages(scenes);
    const audioUrl = await shortsService.generateShortsAudio();
    const webdavPaths = await shortsService.uploadShortsAssets(imageUrls, sessionId);

    const response: ShortsResponse = {
      success: true,
      script,
      scenes: scenes.map((scene, index) => ({ ...scene, imageUrl: imageUrls[index] })),
      audioUrl,
      totalDuration: duration,
      sessionId,
      webdavPaths
    };

    logger.info('Shorts completed', { requestId, totalTime: Date.now() - startTime });
    return NextResponse.json(response);
  } catch (error) {
    logger.error('Shorts failed', { requestId, error: error instanceof Error ? error.message : 'Unknown' });
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown', requestId, totalTime: Date.now() - startTime }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ status: 'healthy', service: 'shorts-generation', timestamp: new Date().toISOString() });
}