import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import Redis from 'ioredis';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

export const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
  lazyConnect: true,
  maxRetriesPerRequest: 1
});

let redisReady = false;

redis.on('error', (error) => {
  redisReady = false;
  console.error('Redis error:', error.message);
});

redis.on('ready', () => {
  redisReady = true;
});

async function ensureRedisConnection() {
  if (redisReady) {
    return true;
  }

  if (redis.status === 'wait' || redis.status === 'end') {
    await redis.connect();
  }

  return redis.status === 'ready';
}

function defaultKeyBuilder(req) {
  const entries = Object.entries(req.query).sort(([left], [right]) => left.localeCompare(right));
  const queryString = new URLSearchParams(entries).toString();
  return `cache:${req.originalUrl.split('?')[0]}:${queryString}`;
}

/**
 * Builds a Redis-backed response cache middleware.
 * @param {number} ttlSeconds Cache TTL in seconds.
 * @param {(req: import('express').Request) => string} [keyBuilder] Cache key builder.
 * @returns {import('express').RequestHandler}
 */
export function cacheMiddleware(ttlSeconds, keyBuilder = defaultKeyBuilder) {
  return async (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = keyBuilder(req);

    try {
      await ensureRedisConnection();
      const cached = await redis.get(key);

      if (cached) {
        res.setHeader('X-Cache', 'HIT');
        return res.json(JSON.parse(cached));
      }

      const originalJson = res.json.bind(res);
      res.json = (body) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redis.set(key, JSON.stringify(body), 'EX', ttlSeconds).catch((error) => {
            console.error('Redis cache set failed:', error.message);
          });
        }

        res.setHeader('X-Cache', 'MISS');
        return originalJson(body);
      };
    } catch (error) {
      console.error('Redis cache bypassed:', error.message);
    }

    return next();
  };
}

/**
 * Deletes known response cache keys and matching cache key patterns.
 * @param {string[]} keys Exact Redis keys to delete.
 * @param {string[]} patterns Redis SCAN patterns to delete.
 * @returns {Promise<number>} Number of deleted keys.
 */
export async function clearResponseCache(keys = [], patterns = []) {
  await ensureRedisConnection();
  let deleted = 0;

  if (keys.length > 0) {
    deleted += await redis.del(...keys);
  }

  for (const pattern of patterns) {
    let cursor = '0';

    do {
      const [nextCursor, matchedKeys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', 100);
      cursor = nextCursor;

      if (matchedKeys.length > 0) {
        deleted += await redis.del(...matchedKeys);
      }
    } while (cursor !== '0');
  }

  return deleted;
}

/**
 * Verifies Redis connectivity.
 * @returns {Promise<boolean>}
 */
export async function checkRedisConnection() {
  await ensureRedisConnection();
  await redis.ping();
  return true;
}
