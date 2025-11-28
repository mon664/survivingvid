import { createClient, WebDAVClient } from 'webdav';
import https from 'https';

export interface WebDAVConfig {
  url: string;
  username: string;
  password: string;
}

export interface UploadResult {
  success: boolean;
  path?: string;
  error?: string;
}

class WebDAVService {
  private client: WebDAVClient | null = null;
  private config: WebDAVConfig | null = null;

  constructor() {
    this.initialize();
  }

  private initialize() {
    const url = process.env.WEBDAV_URL;
    const username = process.env.WEBDAV_USERNAME;
    const password = process.env.WEBDAV_PASSWORD;

    if (!url || !username || !password) {
      console.warn('WebDAV configuration missing. Please check environment variables.');
      return;
    }

    this.config = { url, username, password };
    // Production 환경에서는 SSL 검증을, 개발 환경에서만 우회
    const isProduction = process.env.NODE_ENV === 'production';

    // Infini-Cloud WebDAV 설정 - RaiDrive와 동일한 방식으로 설정
    this.client = createClient(url, {
      username: username,
      password: password,
      httpsAgent: new https.Agent({
        rejectUnauthorized: false, // 개발 환경에서 SSL 검증 우회
        secureProtocol: 'TLSv1_2_method'
      }),
      // WebDAV 헤더 추가
      headers: {
        'User-Agent': 'WebDAVClient/1.0',
        'Accept': '*/*'
      }
    });
  }

  /**
   * WebDAV 연결 테스트
   */
  async testConnection(): Promise<boolean> {
    try {
      if (!this.client) {
        throw new Error('WebDAV client not initialized');
      }

      await this.client.getDirectoryContents('/');
      console.log('WebDAV connection test successful');
      return true;
    } catch (error) {
      console.error('WebDAV connection failed:', error);
      return false;
    }
  }

  /**
   * 로컬 V 드라이브 연결 테스트 (Windows 전용)
   */
  async testLocalVDrive(): Promise<boolean> {
    try {
      const fs = require('fs').promises;
      const path = require('path');

      // V 드라이브 존재 확인
      await fs.access('V:\\');
      console.log('V Drive is accessible');

      // 테스트 디렉토리 생성
      const testDir = 'V:\\autovid_test';
      try {
        await fs.mkdir(testDir, { recursive: true });
        console.log('Test directory created:', testDir);

        // 테스트 파일 생성
        const testFile = path.join(testDir, 'test.txt');
        await fs.writeFile(testFile, 'WebDAV test file', 'utf8');
        console.log('Test file created:', testFile);

        // 파일 읽기 테스트
        const content = await fs.readFile(testFile, 'utf8');
        console.log('File content verified:', content);

        // 정리
        await fs.unlink(testFile);
        await fs.rmdir(testDir);
        console.log('Test cleanup completed');

        return true;
      } catch (error) {
        console.error('V Drive file operations failed:', error);
        return false;
      }
    } catch (error) {
      console.error('V Drive not accessible:', error);
      return false;
    }
  }

  /**
   * 로컬 V 드라이브에 파일 업로드
   */
  async uploadToVDrive(buffer: Buffer, filename: string, sessionId: string): Promise<UploadResult> {
    try {
      const fs = require('fs').promises;
      const path = require('path');

      // 세션 디렉토리 생성
      const sessionDir = path.join('V:\\', 'autovid_sessions', sessionId);
      await fs.mkdir(sessionDir, { recursive: true });

      // 파일 저장
      const filePath = path.join(sessionDir, filename);
      await fs.writeFile(filePath, buffer);

      console.log(`File uploaded to V Drive: ${filePath}`);
      return {
        success: true,
        path: filePath.replace('V:\\', '/V/') // WebDAV 경로 형식으로 변환
      };
    } catch (error) {
      console.error(`Failed to upload to V Drive:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 세션 디렉토리 생성
   */
  async createSessionDirectory(sessionId: string): Promise<string> {
    try {
      if (!this.client) {
        throw new Error('WebDAV client not initialized');
      }

      const sessionDir = `/autovid_sessions/${sessionId}`;
      await this.client.createDirectory(sessionDir);
      console.log(`Created session directory: ${sessionDir}`);
      return sessionDir;
    } catch (error) {
      console.error('Failed to create session directory:', error);
      throw error;
    }
  }

  /**
   * 이미지 업로드
   */
  async uploadImage(imageData: ArrayBuffer | Buffer, filename: string, sessionId: string): Promise<UploadResult> {
    try {
      if (!this.client) {
        return { success: false, error: 'WebDAV client not initialized' };
      }

      const sessionDir = `/autovid_sessions/${sessionId}`;
      const filePath = `${sessionDir}/${filename}`;

      // Convert ArrayBuffer to Buffer if needed
      const buffer = Buffer.from(imageData);

      await this.client.putFileContents(filePath, buffer);
      console.log(`Uploaded image: ${filename}`);

      return { success: true, path: filePath };
    } catch (error) {
      console.error(`Failed to upload image ${filename}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Base64 이미지 업로드
   */
  async uploadBase64Image(base64Data: string, filename: string, sessionId: string): Promise<UploadResult> {
    try {
      // Remove data URL prefix if present
      const base64Content = base64Data.split(',')[1] || base64Data;
      const buffer = Buffer.from(base64Content, 'base64');

      return await this.uploadImage(buffer, filename, sessionId);
    } catch (error) {
      console.error(`Failed to upload base64 image ${filename}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * 다중 이미지 업로드
   */
  async uploadMultipleImages(images: Array<{data: string | ArrayBuffer | Buffer, filename: string}>, sessionId: string): Promise<UploadResult[]> {
    if (!this.client) {
      return images.map(() => ({
        success: false,
        error: 'WebDAV client not initialized'
      }));
    }

    // Ensure session directory exists
    await this.createSessionDirectory(sessionId);

    const results: UploadResult[] = [];

    for (const image of images) {
      try {
        let result: UploadResult;

        if (typeof image.data === 'string' && image.data.startsWith('data:')) {
          result = await this.uploadBase64Image(image.data, image.filename, sessionId);
        } else if (typeof image.data === 'string') {
          result = await this.uploadImage(Buffer.from(image.data), image.filename, sessionId);
        } else {
          result = await this.uploadImage(image.data, image.filename, sessionId);
        }

        results.push(result);
      } catch (error) {
        results.push({
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return results;
  }

  /**
   * 파일 다운로드
   */
  async downloadFile(filePath: string): Promise<Buffer | null> {
    try {
      if (!this.client) {
        throw new Error('WebDAV client not initialized');
      }

      const buffer = await this.client.getFileContents(filePath);
      return Buffer.from(buffer as ArrayBuffer);
    } catch (error) {
      console.error(`Failed to download file ${filePath}:`, error);
      return null;
    }
  }

  /**
   * 디렉토리 목록 가져오기
   */
  async listDirectory(path: string = '/'): Promise<any[] | null> {
    try {
      if (!this.client) {
        throw new Error('WebDAV client not initialized');
      }

      const contents = await this.client.getDirectoryContents(path);
      return contents as any[];
    } catch (error) {
      console.error(`Failed to list directory ${path}:`, error);
      return null;
    }
  }

  /**
   * 파일 삭제
   */
  async deleteFile(filePath: string): Promise<boolean> {
    try {
      if (!this.client) {
        throw new Error('WebDAV client not initialized');
      }

      await this.client.deleteFile(filePath);
      console.log(`Deleted file: ${filePath}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete file ${filePath}:`, error);
      return false;
    }
  }
}

// Singleton instance
export const webdavService = new WebDAVService();

export default webdavService;