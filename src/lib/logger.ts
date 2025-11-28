import type { NextRequest } from 'next/server';

export interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  context?: {
    endpoint?: string;
    method?: string;
    userAgent?: string;
    ip?: string;
    userId?: string;
    requestId?: string;
    duration?: number;
    [key: string]: any;
  };
  error?: {
    name?: string;
    message?: string;
    stack?: string;
  };
}

class Logger {
  private static instance: Logger;
  private isDevelopment = process.env.NODE_ENV === 'development';

  private constructor() {}

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private createLogEntry(
    level: LogEntry['level'],
    message: string,
    context?: LogEntry['context'],
    error?: Error
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: this.isDevelopment ? error.stack : undefined
      } : undefined
    };
  }

  private log(entry: LogEntry): void {
    const logString = JSON.stringify(entry);

    if (this.isDevelopment) {
      // Color-coded console output for development
      const colors = {
        INFO: '\x1b[36m',    // Cyan
        WARN: '\x1b[33m',    // Yellow
        ERROR: '\x1b[31m',   // Red
        DEBUG: '\x1b[90m'    // Gray
      };
      const reset = '\x1b[0m';

      console.log(`${colors[entry.level]}[${entry.level}]${reset} ${entry.timestamp} - ${entry.message}`);

      if (entry.context) {
        console.log('Context:', entry.context);
      }

      if (entry.error) {
        console.log('Error:', entry.error);
      }
    } else {
      // Structured logging for production
      console.log(logString);
    }
  }

  info(message: string, context?: LogEntry['context']): void {
    const entry = this.createLogEntry('INFO', message, context);
    this.log(entry);
  }

  warn(message: string, context?: LogEntry['context']): void {
    const entry = this.createLogEntry('WARN', message, context);
    this.log(entry);
  }

  error(message: string, context?: LogEntry['context'], error?: Error): void {
    const entry = this.createLogEntry('ERROR', message, context, error);
    this.log(entry);
  }

  debug(message: string, context?: LogEntry['context']): void {
    if (this.isDevelopment) {
      const entry = this.createLogEntry('DEBUG', message, context);
      this.log(entry);
    }
  }

  // API-specific logging helpers
  logApiRequest(request: NextRequest, requestId: string): void {
    const context = {
      endpoint: request.nextUrl.pathname,
      method: request.method,
      userAgent: request.headers.get('user-agent') || undefined,
      ip: request.headers.get('x-forwarded-for') ||
         request.headers.get('x-real-ip') ||
         request.ip ||
         'unknown',
      requestId
    };

    this.info(`API Request: ${request.method} ${request.nextUrl.pathname}`, context);
  }

  logApiResponse(request: NextRequest, requestId: string, duration: number, statusCode: number): void {
    const context = {
      endpoint: request.nextUrl.pathname,
      method: request.method,
      duration,
      statusCode,
      requestId
    };

    const level = statusCode >= 400 ? 'ERROR' : 'INFO';
    const message = `API Response: ${request.method} ${request.nextUrl.pathname} - ${statusCode} (${duration}ms)`;

    if (level === 'ERROR') {
      this.error(message, context);
    } else {
      this.info(message, context);
    }
  }

  logApiError(request: NextRequest, requestId: string, error: Error, statusCode: number = 500): void {
    const context = {
      endpoint: request.nextUrl.pathname,
      method: request.method,
      statusCode,
      requestId
    };

    this.error(`API Error: ${request.method} ${request.nextUrl.pathname}`, context, error);
  }

  logApiSuccess(request: NextRequest, requestId: string, data?: any, duration: number = 0): void {
    const context = {
      endpoint: request.nextUrl.pathname,
      method: request.method,
      duration,
      requestId,
      dataSize: data ? JSON.stringify(data).length : 0
    };

    this.info(`API Success: ${request.method} ${request.nextUrl.pathname}`, context);
  }

  // Performance logging
  logPerformance(operation: string, duration: number, context?: LogEntry['context']): void {
    const logContext = {
      operation,
      duration,
      performance: true,
      ...context
    };

    const level = duration > 5000 ? 'WARN' : duration > 1000 ? 'INFO' : 'DEBUG';
    const message = `Performance: ${operation} completed in ${duration}ms`;

    switch (level) {
      case 'WARN':
        this.warn(message, logContext);
        break;
      case 'INFO':
        this.info(message, logContext);
        break;
      case 'DEBUG':
        this.debug(message, logContext);
        break;
    }
  }

  // Security logging
  logSecurityEvent(event: string, context: LogEntry['context']): void {
    const securityContext = {
      security: true,
      event,
      ...context
    };

    this.warn(`Security Event: ${event}`, securityContext);
  }
}

export const logger = Logger.getInstance();

// Helper function to create API middleware
export function createApiHandler(handler: (request: NextRequest, context: any) => Promise<Response>) {
  return async (request: NextRequest): Promise<Response> => {
    const requestId = `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();

    try {
      logger.logApiRequest(request, requestId);

      const context = { requestId, startTime };
      const response = await handler(request, context);

      const duration = Date.now() - startTime;
      logger.logApiResponse(request, requestId, duration, response.status);

      return response;
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorObj = error instanceof Error ? error : new Error('Unknown error');

      logger.logApiError(request, requestId, errorObj);

      // Return appropriate error response
      if (errorObj.message.includes('quota') || errorObj.message.includes('limit')) {
        return new Response(
          JSON.stringify({ error: 'API quota exceeded. Please try again later.' }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      }

      if (errorObj.message.includes('invalid') || errorObj.message.includes('authentication')) {
        return new Response(
          JSON.stringify({ error: 'Invalid API key or authentication failed' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }

      return new Response(
        JSON.stringify({ error: 'Internal server error. Please try again.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  };
}