import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for issue search endpoints.
 * @returns {import('express-rate-limit').RateLimitRequestHandler}
 */
export function issueSearchRateLimit() {
  return rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
      error: {
        message: 'Too many requests, please try again later.',
        code: 'RATE_LIMITED'
      }
    }
  });
}
