import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { clearResponseCache, redis } from '../middleware/cache.js';

const router = Router();
const LOCK_KEY = 'worker:refresh:lock';
const STATUS_KEY = 'worker:refresh:status';
const LOCK_TTL_SECONDS = 60 * 60;
const MAX_LOG_LENGTH = 4000;

function requireAdminSecret(req, res, next) {
  const adminSecret = process.env.ADMIN_SECRET;
  const providedSecret = req.get('x-admin-secret');

  if (!adminSecret || providedSecret !== adminSecret) {
    return res.status(401).json({ error: { message: 'Unauthorized' } });
  }

  return next();
}

function appendOutput(current, chunk) {
  return `${current}${chunk}`.slice(-MAX_LOG_LENGTH);
}

async function readWorkerStatus() {
  const raw = await redis.get(STATUS_KEY);
  return raw ? JSON.parse(raw) : null;
}

async function writeWorkerStatus(status) {
  await redis.set(STATUS_KEY, JSON.stringify(status));
}

async function releaseWorkerLock(runId) {
  const currentRunId = await redis.get(LOCK_KEY);
  if (currentRunId === runId) {
    await redis.del(LOCK_KEY);
  }
}

async function clearIssueCaches() {
  await clearResponseCache(['stats:summary', 'repos:trending'], ['cache:/api/issues:*']);
}

/**
 * Returns the latest background worker refresh status.
 */
router.get('/refresh/status', requireAdminSecret, async (req, res, next) => {
  try {
    const [status, activeRunId] = await Promise.all([readWorkerStatus(), redis.get(LOCK_KEY)]);
    res.json({
      running: Boolean(activeRunId),
      activeRunId,
      status
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Starts the Python issue refresh worker in the background.
 */
router.post('/refresh', requireAdminSecret, async (req, res, next) => {
  const runId = randomUUID();
  const startedAt = new Date().toISOString();

  try {
    const lockAcquired = await redis.set(LOCK_KEY, runId, 'NX', 'EX', LOCK_TTL_SECONDS);

    if (lockAcquired !== 'OK') {
      const status = await readWorkerStatus();
      return res.status(409).json({
        error: { message: 'Worker already running' },
        status
      });
    }

    const initialStatus = {
      runId,
      state: 'running',
      startedAt,
      finishedAt: null,
      exitCode: null,
      durationMs: null,
      stdout: '',
      stderr: '',
      error: null
    };
    await writeWorkerStatus(initialStatus);

    const pythonBin = process.env.PYTHON_BIN || 'python';
    const worker = spawn(pythonBin, ['worker/fetch_issues.py'], {
      cwd: process.cwd(),
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';
    let settled = false;

    async function finishWorker({ state, exitCode = null, error = null }) {
      if (settled) return;
      settled = true;

      const finishedAt = new Date().toISOString();
      const succeeded = state === 'success';

      try {
        if (succeeded) {
          await clearIssueCaches();
        }

        await writeWorkerStatus({
          ...initialStatus,
          state,
          finishedAt,
          exitCode,
          durationMs: Date.parse(finishedAt) - Date.parse(startedAt),
          stdout,
          stderr,
          error
        });
      } catch (statusError) {
        console.error('Failed to persist worker status:', statusError.message);
      } finally {
        await releaseWorkerLock(runId).catch((lockError) => {
          console.error('Failed to release worker lock:', lockError.message);
        });
      }
    }

    worker.stdout.on('data', (chunk) => {
      const output = chunk.toString();
      stdout = appendOutput(stdout, output);
      console.log(`[worker stdout] ${output.trim()}`);
    });

    worker.stderr.on('data', (chunk) => {
      const output = chunk.toString();
      stderr = appendOutput(stderr, output);
      console.error(`[worker stderr] ${output.trim()}`);
    });

    worker.on('error', (error) => {
      console.error('Failed to start worker:', error.message);
      void finishWorker({ state: 'failed', error: error.message });
    });

    worker.on('close', (code) => {
      console.log(`Worker exited with code ${code}`);
      void finishWorker({
        state: code === 0 ? 'success' : 'failed',
        exitCode: code,
        error: code === 0 ? null : `Worker exited with code ${code}`
      });
    });

    worker.unref();

    return res.status(202).json({ message: 'Worker started', runId });
  } catch (error) {
    await releaseWorkerLock(runId).catch(() => {});
    return next(error);
  }
});

export default router;
