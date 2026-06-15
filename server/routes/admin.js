import { spawn } from 'node:child_process';
import { Router } from 'express';

const router = Router();

router.post('/refresh', (req, res) => {
  const adminSecret = process.env.ADMIN_SECRET;
  const providedSecret = req.get('x-admin-secret');

  if (!adminSecret || providedSecret !== adminSecret) {
    return res.status(401).json({ error: { message: 'Unauthorized' } });
  }

  const pythonBin = process.env.PYTHON_BIN || 'python';
  const worker = spawn(pythonBin, ['worker/fetch_issues.py'], {
    cwd: process.cwd(),
    detached: true,
    stdio: ['ignore', 'pipe', 'pipe']
  });

  worker.stdout.on('data', (chunk) => {
    console.log(`[worker stdout] ${chunk.toString().trim()}`);
  });

  worker.stderr.on('data', (chunk) => {
    console.error(`[worker stderr] ${chunk.toString().trim()}`);
  });

  worker.on('error', (error) => {
    console.error('Failed to start worker:', error.message);
  });

  worker.on('close', (code) => {
    console.log(`Worker exited with code ${code}`);
  });

  worker.unref();

  return res.status(202).json({ message: 'Worker started' });
});

export default router;
