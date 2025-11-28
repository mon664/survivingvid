import { NextRequest, NextResponse } from 'next/server';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';

// Initialize Text-to-Speech client
const ttsClient = new TextToSpeechClient();

export async function POST(request: NextRequest) {
  try {
    const { script, voice = 'en-US-Wavenet-D', language = 'en-US' } = await request.json();

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

    // Check if API credentials are configured
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && !process.env.GOOGLE_CLOUD_PROJECT_ID) {
      return NextResponse.json(
        { error: 'Google Cloud credentials are not configured' },
        { status: 500 }
      );
    }

    // Combine all narrative text into one audio file
    let fullText = '';
    script.segments.forEach((segment: any, index: number) => {
      if (segment.narrative) {
        fullText += segment.narrative + ' ';
      }
    });

    if (!fullText.trim()) {
      return NextResponse.json(
        { error: 'No narrative text found in script segments' },
        { status: 400 }
      );
    }

    // Limit text length (Google TTS has limits)
    if (fullText.length > 5000) {
      return NextResponse.json(
        { error: 'Text is too long. Maximum 5000 characters allowed.' },
        { status: 400 }
      );
    }

    // Configure the synthesis request
    const request_data = {
      input: { text: fullText },
      voice: {
        languageCode: language,
        name: voice,
        ssmlGender: 'NEUTRAL',
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 1.0,
        pitch: 0.0,
        sampleRateHertz: 24000,
      },
    };

    // Perform text-to-speech synthesis
    const response = await ttsClient.synthesizeSpeech(request_data as any);

    // Convert audio to base64 for JSON response
    const [audioResponse] = response as any;
    const audioBase64 = audioResponse?.audioContent?.toString('base64');

    if (!audioBase64) {
      return NextResponse.json(
        { error: 'Failed to generate audio content' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      audioUrl: `data:audio/mpeg;base64,${audioBase64}`,
      audioData: audioBase64,
      metadata: {
        textLength: fullText.length,
        voice: voice,
        language: language,
        segmentsCount: script.segments.length,
        audioEncoding: 'MP3',
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Audio generation error:', error);

    // Handle specific TTS errors
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

      if (error.message.includes('voice') || error.message.includes('language')) {
        return NextResponse.json(
          { error: 'Invalid voice or language selection' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate audio. Please try again later.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Video audio generation API',
    version: '1.0.0',
    endpoints: {
      POST: '/api/video/audio - Generate audio from script narrative'
    },
    supportedVoices: [
      {
        name: 'en-US-Wavenet-D',
        language: 'en-US',
        gender: 'NEUTRAL',
        description: 'English US Male voice'
      },
      {
        name: 'en-US-Wavenet-F',
        language: 'en-US',
        gender: 'NEUTRAL',
        description: 'English US Female voice'
      },
      {
        name: 'ko-KR-Wavenet-D',
        language: 'ko-KR',
        gender: 'NEUTRAL',
        description: 'Korean Male voice'
      },
      {
        name: 'ko-KR-Wavenet-A',
        language: 'ko-KR',
        gender: 'NEUTRAL',
        description: 'Korean Female voice'
      }
    ]
  });
}