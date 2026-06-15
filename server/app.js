import cors from 'cors';
import express from 'express';
import { checkDbConnection } from './db/pool.js';
import { checkRedisConnection } from './middleware/cache.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import adminRouter from './routes/admin.js';
import issuesRouter from './routes/issues.js';
import reposRouter from './routes/repos.js';
import statsRouter from './routes/stats.js';

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json());

app.get('/health', async (req, res) => {
  const checks = await Promise.allSettled([checkDbConnection(), checkRedisConnection()]);
  const database = checks[0].status === 'fulfilled';
  const redis = checks[1].status === 'fulfilled';
  const healthy = database;

  res.status(healthy ? 200 : 503).json({
    status: database && redis ? 'ok' : 'degraded',
    checks: {
      database,
      redis
    }
  });
});

app.use('/api/admin', adminRouter);
app.use('/api/issues', issuesRouter);
app.use('/api/repos', reposRouter);
app.use('/api/stats', statsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
