import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_KEY = 'rateLimit';

export interface RateLimitOptions {
  /** Max requests allowed per client IP within the window. */
  max: number;
  /** Rolling window length in milliseconds. */
  windowMs: number;
}

/**
 * Override the lenient global rate limit for a single route. Apply to
 * abuse-prone endpoints (auth, password reset) so one IP gets a tight per-route
 * budget instead of the shared global default. Enforced by {@link RateLimitGuard}.
 */
export const RateLimit = (options: RateLimitOptions) =>
  SetMetadata(RATE_LIMIT_KEY, options);
