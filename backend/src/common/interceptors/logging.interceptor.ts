import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { method, url, body, query, params, headers } = request;
    const userAgent = headers['user-agent'] || '';
    const ip = request.ip || request.connection.remoteAddress;

    const now = Date.now();

    // Log incoming request
    this.logger.log(
      `Incoming Request: ${method} ${url}`,
      {
        method,
        url,
        body: this.sanitizeBody(body),
        query,
        params,
        userAgent,
        ip,
        timestamp: new Date().toISOString(),
      }
    );

    return next.handle().pipe(
      tap((data) => {
        const responseTime = Date.now() - now;
        
        // Log successful response
        this.logger.log(
          `Response: ${method} ${url} - ${response.statusCode} (${responseTime}ms)`,
          {
            method,
            url,
            statusCode: response.statusCode,
            responseTime,
            dataSize: JSON.stringify(data).length,
            timestamp: new Date().toISOString(),
          }
        );
      }),
      catchError((error) => {
        const responseTime = Date.now() - now;
        
        // Log error response
        this.logger.error(
          `Error Response: ${method} ${url} - ${error.status || 500} (${responseTime}ms)`,
          {
            method,
            url,
            statusCode: error.status || 500,
            responseTime,
            error: error.message,
            stack: error.stack,
            timestamp: new Date().toISOString(),
          }
        );
        
        throw error;
      })
    );
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;
    
    const sanitized = { ...body };
    
    // Remove sensitive fields from logging
    const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
    sensitiveFields.forEach(field => {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    });
    
    return sanitized;
  }
} 