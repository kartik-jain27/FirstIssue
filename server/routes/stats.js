import { Router } from 'express';
import { cacheMiddleware } from '../middleware/cache.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { readStats } from '../services/statsService.js';

const router = Router();

router.get(
  '/',
  cacheMiddleware(30 * 60, () => 'stats:summary'),
  asyncHandler(async (req, res) => {
    const stats = await readStats();
    res.json(stats);
  })
);

export default router;
