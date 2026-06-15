import { Router } from 'express';
import { cacheMiddleware } from '../middleware/cache.js';
import { AppError, asyncHandler } from '../middleware/errorHandler.js';
import { issueSearchRateLimit } from '../middleware/rateLimit.js';
import { findIssue, searchIssues } from '../services/issuesService.js';

const router = Router();
const VALID_SORTS = new Set(['score', 'stars', 'recent']);

function parsePositiveInteger(value, name) {
  if (value === undefined) {
    return undefined;
  }

  if (!/^\d+$/.test(String(value))) {
    throw new AppError(`${name} must be a positive integer`, 400, 'INVALID_QUERY_PARAM');
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 1) {
    throw new AppError(`${name} must be a positive integer`, 400, 'INVALID_QUERY_PARAM');
  }

  return parsed;
}

function parseNonNegativeInteger(value, name) {
  if (value === undefined) {
    return undefined;
  }

  if (!/^\d+$/.test(String(value))) {
    throw new AppError(`${name} must be a non-negative integer`, 400, 'INVALID_QUERY_PARAM');
  }

  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed < 0) {
    throw new AppError(`${name} must be a non-negative integer`, 400, 'INVALID_QUERY_PARAM');
  }

  return parsed;
}

function parseIssueSearchQuery(query) {
  const sortBy = query.sortBy ?? 'score';

  if (!VALID_SORTS.has(sortBy)) {
    throw new AppError('sortBy must be one of: score, stars, recent', 400, 'INVALID_SORT');
  }

  const page = parsePositiveInteger(query.page, 'page') ?? 1;
  const requestedLimit = parsePositiveInteger(query.limit, 'limit') ?? 20;
  const minStars = parseNonNegativeInteger(query.minStars, 'minStars');

  return {
    language: query.language ? String(query.language).trim() : undefined,
    label: query.label ? String(query.label).trim() : undefined,
    minStars,
    sortBy,
    page,
    limit: Math.min(requestedLimit, 100)
  };
}

router.get(
  '/',
  issueSearchRateLimit(),
  cacheMiddleware(10 * 60),
  asyncHandler(async (req, res) => {
    const filters = parseIssueSearchQuery(req.query);
    const result = await searchIssues(filters);
    res.json(result);
  })
);

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = parsePositiveInteger(req.params.id, 'id');
    const issue = await findIssue(id);
    res.json(issue);
  })
);

export default router;
