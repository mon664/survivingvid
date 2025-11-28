import { NextRequest, NextResponse } from 'next/server';
import webdavService from '@/lib/webdav';

export async function POST(request: NextRequest) {
  try {
    console.log('Testing WebDAV connection...');

    // Test WebDAV connection
    const connectionTest = await webdavService.testConnection();

    // Test V Drive access (Windows)
    let vDriveTest = false;
    if (process.platform === 'win32') {
      vDriveTest = await webdavService.testLocalVDrive();
    }

    if (connectionTest) {
      // Test directory listing
      const directoryList = await webdavService.listDirectory('/');

      return NextResponse.json({
        success: true,
        message: 'WebDAV 연결 성공!',
        webdavConnection: '✅ 성공',
        vDriveConnection: vDriveTest ? '✅ V 드라이브 접근 성공' : '❌ V 드라이브 접근 실패',
        directoryListing: directoryList,
        config: {
          url: process.env.WEBDAV_URL,
          username: process.env.WEBDAV_USERNAME,
          passwordSet: !!process.env.WEBDAV_PASSWORD
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'WebDAV 연결 실패',
        webdavConnection: '❌ 실패',
        vDriveConnection: vDriveTest ? '✅ V 드라이브 접근 성공 (대체 수단)' : '❌ V 드라이브 접근 실패',
        recommendation: vDriveTest ? 'V 드라이브를 통해 WebDAV 기능 사용 가능' : 'WebDAV 설정을 확인하세요',
        config: {
          url: process.env.WEBDAV_URL,
          username: process.env.WEBDAV_USERNAME,
          passwordSet: !!process.env.WEBDAV_PASSWORD
        }
      }, { status: 500 });
    }
  } catch (error) {
    console.error('WebDAV test error:', error);
    return NextResponse.json({
      success: false,
      message: 'WebDAV 테스트 중 오류 발생',
      error: error instanceof Error ? error.message : 'Unknown error',
      config: {
        url: process.env.WEBDAV_URL,
        username: process.env.WEBDAV_USERNAME,
        passwordSet: !!process.env.WEBDAV_PASSWORD
      }
    }, { status: 500 });
  }
}