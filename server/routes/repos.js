import { Router } from 'express';
import { cacheMiddleware } from '../middleware/cache.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { listTrendingRepos } from '../services/reposService.js';

const router = Router();

router.get(
  '/trending',
  cacheMiddleware(30 * 60, () => 'repos:trending'),
  asyncHandler(async (req, res) => {
    const data = await listTrendingRepos();
    res.json({ data });
  })
);

export default router;
