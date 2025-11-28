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

    this.client = createClient(`${url}${username}`, {
      password: password,
      httpsAgent: new https.Agent({
        rejectUnauthorized: isProduction, // Production에서는 true, Development에서는 false
        // 필요한 경우 유효한 CA 인증서 추가
        ...(isProduction && {
          // Production 환경에서 추가적인 보안 설정
          secureProtocol: 'TLSv1_2_method'
        })
      })
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