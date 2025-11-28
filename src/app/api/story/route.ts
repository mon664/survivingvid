import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '@/lib/logger';
import webdavService from '@/lib/webdav';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface StoryRequest {
  story: string;
  protagonist: string; // Base64 image
  partner?: string; // Base64 image
  persona?: string;
  sceneCount: number;
  aspectRatio: '16:9' | '9:16' | '1:1';
}

interface StoryScene {
  id: string;
  description: string;
  imagePrompt: string;
  audioText: string;
  duration: number;
}

interface StoryResponse {
  success: boolean;
  title: string;
  script: string;
  scenes: StoryScene[];
  protagonistAnalysis?: string;
  partnerAnalysis?: string;
  sessionId: string;
  webdavPaths?: string[];
  imageUrls?: string[];
}

class StoryGenerationService {
  /**
   * Analyze face from uploaded image
   */
  async analyzeFace(imageBase64: string, role: 'protagonist' | 'partner'): Promise<string> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `
Analyze this ${role} face image and provide a detailed description for story generation.

Include:
- Age range (20s, 30s, 40s, etc.)
- Gender
- General appearance (hair style, facial features)
- Style/clothing hints
- Personality traits that can be inferred
- Suitable character archetype for storytelling

Respond in Korean with a natural, descriptive paragraph that would help generate a personalized story.
`;

      // Remove data URL prefix if present
      const base64Data = imageBase64.split(',')[1] || imageBase64;

      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: "image/jpeg"
        }
      };

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error(`Error analyzing ${role} face:`, error);
      return `${role === 'protagonist' ? '주인공' : '파트너'}의 얼굴 분석에 실패했습니다.`;
    }
  }

  /**
   * Generate story script based on input and face analysis
   */
  async generateStoryScript(
    story: string,
    protagonistAnalysis: string,
    partnerAnalysis?: string,
    persona?: string,
    sceneCount: number = 8
  ): Promise<{ title: string; script: string; scenes: StoryScene[] }> {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `
You are an expert storyteller specializing in creating engaging, viral story content for Korean audiences.

**Story Topic:** "${story}"
**Protagonist Description:** ${protagonistAnalysis}
${partnerAnalysis ? `**Partner Description:** ${partnerAnalysis}` : ''}
${persona ? `**Persona/Style:** ${persona}` : ''}

**Requirements:**
- Create ${sceneCount} scenes
- Each scene should have compelling dialogue/action
- Include emotional moments and twists
- Make it shareable and engaging
- Total duration suitable for short-form video (2-5 minutes)
- Korean language with natural dialogue

**Output Format (JSON):**
{
  "title": "Catchy story title in Korean",
  "script": "Complete story script with scene transitions",
  "scenes": [
    {
      "id": "scene_1",
      "description": "Visual scene description",
      "imagePrompt": "Detailed prompt for image generation including character appearance",
      "audioText": "Dialogue or narration for this scene",
      "duration": 15
    }
  ]
}

Make each scene visually distinctive and emotionally engaging.
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
      return parsed;
    } catch (error) {
      console.error('Error generating story script:', error);
      throw new Error(`Story generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate story images with consistent characters
   */
  async generateStoryImages(
    scenes: StoryScene[],
    protagonistImage: string,
    partnerImage?: string,
    aspectRatio: '16:9' | '9:16' | '1:1' = '16:9'
  ): Promise<string[]> {
    const imageUrls: string[] = [];

    // Set image dimensions based on aspect ratio
    const dimensions = {
      '16:9': { width: 1024, height: 576 },
      '9:16': { width: 576, height: 1024 },
      '1:1': { width: 768, height: 768 }
    };

    const { width, height } = dimensions[aspectRatio];

    for (let i = 0; i < scenes.length; i++) {
      const scene = scenes[i];
      try {
        // Enhanced prompt with character consistency
        let prompt = scene.imagePrompt;

        // Add style and quality
        prompt += `, cinematic lighting, high quality, detailed, ${aspectRatio} aspect ratio, storytelling style`;

        // Add character references for consistency
        if (protagonistImage) {
          prompt += `, main character matching the protagonist's appearance`;
        }
        if (partnerImage && i > scenes.length / 2) {
          prompt += `, include partner character matching their appearance`;
        }

        const imageUrl = await this.generateImage(prompt, width, height);
        imageUrls.push(imageUrl);
      } catch (error) {
        console.error(`Error generating image for scene ${scene.id}:`, error);
        // Add placeholder
        imageUrls.push(`data:image/svg+xml,${encodeURIComponent(`<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em">Scene ${i + 1}</text></svg>`)}`);
      }
    }

    return imageUrls;
  }

  /**
   * Generate image with specific dimensions
   */
  private async generateImage(prompt: string, width: number, height: number): Promise<string> {
    try {
      const response = await fetch(
        `https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: {
              width,
              height,
              num_inference_steps: 20,
              guidance_scale: 7.5,
            },
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`Hugging Face API error: ${response.statusText}`);
      }

      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Error generating image:', error);
      throw error;
    }
  }

  /**
   * Upload story assets to WebDAV
   */
  async uploadStoryAssets(
    images: string[],
    sessionId: string,
    aspectRatio: string
  ): Promise<string[]> {
    const uploadedPaths: string[] = [];

    // Create session directory with aspect ratio info
    const sessionDir = `/story_sessions/${sessionId}_${aspectRatio}`;
    await webdavService.createSessionDirectory(sessionId);

    for (let i = 0; i < images.length; i++) {
      const imageUrl = images[i];
      const filename = `story_scene_${i + 1}.jpg`;

      try {
        const result = await webdavService.uploadBase64Image(imageUrl, filename, sessionId);
        if (result.success && result.path) {
          uploadedPaths.push(result.path);
        }
      } catch (error) {
        console.error(`Failed to upload story image ${i + 1}:`, error);
      }
    }

    return uploadedPaths;
  }
}

// Main API handler
export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = `story_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    // Handle form data (for file uploads)
    let reqData: StoryRequest;

    if (request.headers.get('content-type')?.includes('multipart/form-data')) {
      const formData = await request.formData();
      reqData = {
        story: formData.get('story') as string,
        protagonist: formData.get('protagonist') as string,
        partner: formData.get('partner') as string,
        persona: formData.get('persona') as string,
        sceneCount: Number(formData.get('sceneCount') || 8),
        aspectRatio: (formData.get('aspectRatio') as string) || '16:9'
      };

      // Handle file uploads
      const protagonistFile = formData.get('protagonistFile') as File;
      if (protagonistFile) {
        const bytes = await protagonistFile.arrayBuffer();
        const base64 = Buffer.from(bytes).toString('base64');
        reqData.protagonist = `data:${protagonistFile.type};base64,${base64}`;
      }

      const partnerFile = formData.get('partnerFile') as File;
      if (partnerFile) {
        const bytes = await partnerFile.arrayBuffer();
        const base64 = Buffer.from(bytes).toString('base64');
        reqData.partner = `data:${partnerFile.type};base64,${base64}`;
      }
    } else {
      // Handle JSON data
      reqData = await request.json();
    }

    const {
      story,
      protagonist,
      partner,
      persona,
      sceneCount,
      aspectRatio
    } = reqData;

    // Validate input
    if (!story || !protagonist) {
      return NextResponse.json(
        { error: 'Story and protagonist image are required' },
        { status: 400 }
      );
    }

    if (sceneCount < 3 || sceneCount > 15) {
      return NextResponse.json(
        { error: 'Scene count must be between 3 and 15' },
        { status: 400 }
      );
    }

    logger.info('Starting story generation', {
      requestId,
      storyLength: story.length,
      sceneCount,
      aspectRatio,
      hasPartner: !!partner
    });

    const storyService = new StoryGenerationService();
    const sessionId = `story_${requestId}`;

    // Step 1: Analyze protagonist face
    logger.info('Analyzing protagonist face', { requestId });
    const protagonistAnalysis = await storyService.analyzeFace(protagonist, 'protagonist');

    // Step 2: Analyze partner face if provided
    let partnerAnalysis: string | undefined;
    if (partner) {
      logger.info('Analyzing partner face', { requestId });
      partnerAnalysis = await storyService.analyzeFace(partner, 'partner');
    }

    // Step 3: Generate story script
    logger.info('Generating story script', { requestId });
    const { title, script, scenes } = await storyService.generateStoryScript(
      story,
      protagonistAnalysis,
      partnerAnalysis,
      persona,
      sceneCount
    );

    // Step 4: Generate images
    logger.info('Generating story images', { requestId, sceneCount: scenes.length });
    const imageUrls = await storyService.generateStoryImages(
      scenes,
      protagonist,
      partner,
      aspectRatio
    );

    // Step 5: Upload to WebDAV
    logger.info('Uploading story assets to WebDAV', { requestId });
    const webdavPaths = await storyService.uploadStoryAssets(
      imageUrls,
      sessionId,
      aspectRatio
    );

    const response: StoryResponse = {
      success: true,
      title,
      script,
      scenes: scenes.map((scene, index) => ({
        ...scene
      })),
      protagonistAnalysis,
      partnerAnalysis,
      sessionId,
      webdavPaths,
      imageUrls
    };

    logger.info('Story generation completed', {
      requestId,
      totalTime: Date.now() - startTime,
      sceneCount: scenes.length,
      imagesUploaded: webdavPaths.length,
      title
    });

    return NextResponse.json(response);

  } catch (error) {
    logger.error('Story generation failed', {
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
    service: 'story-generation',
    timestamp: new Date().toISOString(),
    capabilities: {
      faceAnalysis: true,
      storyGeneration: true,
      imageGeneration: true,
      characterConsistency: true,
      webdavUpload: true,
      multipleAspectRatios: true
    }
  });
}