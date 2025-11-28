import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
    }

    // Use REST API to list models
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({
        error: 'Failed to fetch models',
        status: response.status,
        details: errorText
      }, { status: response.status });
    }

    const data = await response.json();

    return NextResponse.json({
      success: true,
      models: data.models || []
    });
  } catch (error) {
    console.error('Error listing models:', error);
    return NextResponse.json(
      { error: 'Failed to list models', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}