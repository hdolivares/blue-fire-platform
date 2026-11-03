import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { RATE_LIMIT_KEY, RateLimitOptions } from '../decorators/rate-limit.decorator';

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

  // Lenient global default. Sensitive routes tighten this per-handler with the
  // @RateLimit(...) decorator (e.g. auth endpoints — see AuthController).
  private readonly maxRequests = 100; // requests per window
  private readonly windowMs = 15 * 60 * 1000; // 15 minutes in milliseconds

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const ip = this.getClientIp(request);
    // Key on the route handler, not the raw URL: Express matches case- and
    // trailing-slash-insensitively, so URL variants (/auth/login/, /AUTH/login)
    // would otherwise each get a fresh bucket for the same handler.
    const route = `${context.getClass().name}.${context.getHandler().name}`;
    const key = this.generateKey(ip, route);

    // Per-route override wins over the global default, so one bot can only make
    // a handful of register/login attempts per window regardless of the lenient
    // global budget.
    const override = this.reflector.getAllAndOverride<RateLimitOptions>(
      RATE_LIMIT_KEY,
      [context.getHandler(), context.getClass()],
    );
    const maxRequests = override?.max ?? this.maxRequests;
    const windowMs = override?.windowMs ?? this.windowMs;

    const now = Date.now();

    // Clean up expired entries
    this.cleanupExpiredEntries(now);

    // Get or create rate limit entry
    if (!this.store[key] || this.store[key].resetTime < now) {
      this.store[key] = {
        count: 0,
        resetTime: now + windowMs,
      };
    }

    // Check if rate limit exceeded
    if (this.store[key].count >= maxRequests) {
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
    response.setHeader('X-RateLimit-Limit', maxRequests);
    response.setHeader('X-RateLimit-Remaining', maxRequests - this.store[key].count);
    response.setHeader('X-RateLimit-Reset', new Date(this.store[key].resetTime).toISOString());

    return true;
  }

  private getClientIp(request: Request): string {
    // Use Express's computed client IP. With `trust proxy` configured (see
    // main.ts), req.ip is the real client address derived from the trusted
    // nginx hop — NOT the raw, client-spoofable X-Forwarded-For header. Do not
    // parse forwarding headers directly here or the limiter is trivially
    // bypassable by rotating X-Forwarded-For.
    return (
      request.ip ||
      request.socket?.remoteAddress ||
      'unknown'
    );
  }

  private generateKey(ip: string, route: string): string {
    return `${ip}:${route}`;
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
  getRateLimitStatus(ip: string, route: string): any {
    const key = this.generateKey(ip, route);
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