import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'API Test Working',
    timestamp: new Date().toISOString(),
    success: true
  });
}