import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const startTime = Date.now();

    // Check system status
    const checks = {
      server: {
        status: 'healthy',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version,
        platform: process.platform
      },
      nextjs: {
        version: process.env.npm_package_version || 'unknown',
        environment: process.env.NODE_ENV || 'development'
      },
      apis: {
        gemini: !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 10,
        googleCloud: !!process.env.GOOGLE_CLOUD_PROJECT_ID && process.env.GOOGLE_CLOUD_PROJECT_ID.length > 0,
        vertexAI: !!process.env.VERTEX_AI_API_KEY && process.env.VERTEX_AI_API_KEY.length > 10,
        textToSpeech: !!process.env.GOOGLE_APPLICATION_CREDENTIALS || !!process.env.GOOGLE_CLOUD_PROJECT_ID,
        firebase: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY && process.env.NEXT_PUBLIC_FIREBASE_API_KEY.length > 10
      },
      templates: {
        available: 0,
        error: null
      },
      dependencies: {
        nextjs: true,
        react: true,
        typescript: true
      }
    };

    // Check if templates directory exists and count templates
    try {
      const templatesDir = path.join(process.cwd(), 'public', 'assets', 'templates');
      const templateDirs = await fs.readdir(templatesDir);
      checks.templates.available = templateDirs.length;
    } catch (error) {
      checks.templates.error = 'Templates directory not accessible';
    }

    // Calculate overall status
    const allAPIsHealthy = Object.values(checks.apis).every(Boolean);
    const templatesHealthy = checks.templates.error === null && checks.templates.available > 0;

    const overallStatus = allAPIsHealthy && templatesHealthy ? 'healthy' : 'degraded';

    const responseTime = Date.now() - startTime;

    return NextResponse.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      checks,
      recommendations: getRecommendations(checks)
    });

  } catch (error) {
    console.error('Health check error:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    );
  }
}

function getRecommendations(checks: any): string[] {
  const recommendations: string[] = [];

  // API Key recommendations
  if (!checks.apis.gemini) {
    recommendations.push('Configure GEMINI_API_KEY for script generation');
  }

  if (!checks.apis.googleCloud) {
    recommendations.push('Configure GOOGLE_CLOUD_PROJECT_ID for cloud services');
  }

  if (!checks.apis.vertexAI) {
    recommendations.push('Configure VERTEX_AI_API_KEY for image generation');
  }

  if (!checks.apis.textToSpeech) {
    recommendations.push('Configure Google Cloud credentials for text-to-speech');
  }

  if (!checks.apis.firebase) {
    recommendations.push('Configure Firebase credentials for authentication');
  }

  // Template recommendations
  if (checks.templates.error) {
    recommendations.push('Check templates directory permissions and structure');
  } else if (checks.templates.available === 0) {
    recommendations.push('Add at least one video template to get started');
  }

  // Environment recommendations
  if (checks.nextjs.environment === 'development') {
    recommendations.push('Consider using environment variables for production deployment');
  }

  return recommendations;
}