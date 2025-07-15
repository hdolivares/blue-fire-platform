import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

@Injectable()
export class RateLimitGuard implements CanActivate {
  private readonly logger = new Logger(RateLimitGuard.name);
  private readonly store: RateLimitStore = {};
  
  // Rate limit configuration
  private readonly maxRequests = 100; // requests per window
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes in milliseconds

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const ip = this.getClientIp(request);
    const key = this.generateKey(ip, request.url);

    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Clean up expired entries
    this.cleanupExpiredEntries(now);

    // Get or create rate limit entry
    if (!this.store[key] || this.store[key].resetTime < now) {
      this.store[key] = {
        count: 0,
        resetTime: now + this.windowMs,
      };
    }

    // Check if rate limit exceeded
    if (this.store[key].count >= this.maxRequests) {
      this.logger.warn(`Rate limit exceeded for IP: ${ip}, URL: ${request.url}`);
      
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Rate limit exceeded. Please try again later.',
          error: 'Too Many Requests',
          retryAfter: Math.ceil((this.store[key].resetTime - now) / 1000),
        },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    // Increment request count
    this.store[key].count++;

    // Add rate limit headers to response
    const response = context.switchToHttp().getResponse();
    response.setHeader('X-RateLimit-Limit', this.maxRequests);
    response.setHeader('X-RateLimit-Remaining', this.maxRequests - this.store[key].count);
    response.setHeader('X-RateLimit-Reset', new Date(this.store[key].resetTime).toISOString());

    return true;
  }

  private getClientIp(request: Request): string {
    // Check for forwarded IP headers (for proxy/load balancer scenarios)
    const forwardedFor = request.headers['x-forwarded-for'];
    if (forwardedFor) {
      return Array.isArray(forwardedFor) 
        ? forwardedFor[0].split(',')[0].trim()
        : forwardedFor.split(',')[0].trim();
    }

    const realIp = request.headers['x-real-ip'];
    if (realIp) {
      return Array.isArray(realIp) ? realIp[0] : realIp;
    }

    // Fallback to connection remote address
    return request.ip || 
           request.connection.remoteAddress || 
           request.socket.remoteAddress || 
           'unknown';
  }

  private generateKey(ip: string, url: string): string {
    // Create a key based on IP and URL path
    const path = url.split('?')[0]; // Remove query parameters
    return `${ip}:${path}`;
  }

  private cleanupExpiredEntries(now: number): void {
    // Remove expired entries to prevent memory leaks
    Object.keys(this.store).forEach(key => {
      if (this.store[key].resetTime < now) {
        delete this.store[key];
      }
    });
  }

  // Method to get current rate limit status (for debugging)
  getRateLimitStatus(ip: string, url: string): any {
    const key = this.generateKey(ip, url);
    const entry = this.store[key];
    
    if (!entry) {
      return {
        count: 0,
        remaining: this.maxRequests,
        resetTime: null,
        isLimited: false,
      };
    }

    return {
      count: entry.count,
      remaining: Math.max(0, this.maxRequests - entry.count),
      resetTime: new Date(entry.resetTime).toISOString(),
      isLimited: entry.count >= this.maxRequests,
    };
  }
} 