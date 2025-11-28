import { NextRequest, NextResponse } from 'next/server';
import webdavService from '@/lib/webdav';

export async function POST(request: NextRequest) {
  try {
    const { action, sessionId, images, filename, data } = await request.json();

    // Validate session ID
    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { error: 'Valid session ID is required' },
        { status: 400 }
      );
    }

    switch (action) {
      case 'test-connection':
        const isConnected = await webdavService.testConnection();
        return NextResponse.json({ connected: isConnected });

      case 'create-session':
        const sessionDir = await webdavService.createSessionDirectory(sessionId);
        return NextResponse.json({ sessionDir });

      case 'upload-images':
        if (!images || !Array.isArray(images)) {
          return NextResponse.json(
            { error: 'Images array is required' },
            { status: 400 }
          );
        }

        const uploadResults = await webdavService.uploadMultipleImages(images, sessionId);
        return NextResponse.json({
          results: uploadResults,
          success: uploadResults.some(r => r.success),
          total: uploadResults.length,
          successful: uploadResults.filter(r => r.success).length
        });

      case 'upload-single':
        if (!filename || !data) {
          return NextResponse.json(
            { error: 'Filename and data are required' },
            { status: 400 }
          );
        }

        const singleResult = await webdavService.uploadImage(data, filename, sessionId);
        return NextResponse.json(singleResult);

      case 'list-directory':
        const path = request.query.path as string || '/';
        const directoryContents = await webdavService.listDirectory(path);
        return NextResponse.json({ contents: directoryContents });

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('WebDAV API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'test-connection':
        const isConnected = await webdavService.testConnection();
        return NextResponse.json({ connected: isConnected });

      case 'list':
        const path = searchParams.get('path') || '/';
        const directoryContents = await webdavService.listDirectory(path);
        return NextResponse.json({ contents: directoryContents });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use ?action=test-connection or ?action=list' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('WebDAV GET API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}