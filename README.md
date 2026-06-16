# GitHub Good First Issue Aggregator

A full-stack portfolio project for discovering beginner-friendly GitHub issues across active open-source repositories.

The app has a React/Vite frontend, a Node.js/Express REST API, PostgreSQL storage, Redis caching, and a Python worker that fetches live GitHub issues.

## Live Deployment

- Frontend: `https://first-issue-ashen.vercel.app`
- Backend API: `https://firstissue-production.up.railway.app/api`
- Backend health: `https://firstissue-production.up.railway.app/health`

## Current Production Status

The production app is running end to end:

- React frontend is deployed on Vercel.
- Express backend is deployed on Railway.
- PostgreSQL and Redis health checks pass.
- The Python worker runs inside the Railway container.
- Protected admin refresh returns a tracked `runId`.
- Worker refresh status is stored in Redis.
- Redis locking prevents overlapping worker runs.
- Successful worker runs clear issue, stats, and trending repository caches.
- Labels are normalized to lowercase for filtering and stats aggregation.

The latest verified worker run completed successfully with exit code `0` and upserted more than 2,000 issues. The worker currently targets 58 repositories across JavaScript, TypeScript, Python, Go, Rust, Java, C++, and GSoC-relevant organizations. `totalRepos` in stats means repositories that currently have stored matching issues, not the number of repositories configured for crawling.

## Tech Stack

- React 18 + Vite + Tailwind CSS
- Node.js 20+ + Express
- PostgreSQL with `pg`
- Redis with `ioredis`
- Python worker using `requests`, `psycopg`, and APScheduler
- Railway for the backend
- Vercel for the frontend

## Project Structure

```text
server/
  routes/          Express route modules
  services/        API business logic
  middleware/      Cache, rate limit, and error middleware
  db/              PostgreSQL pool, queries, and schema
  app.js           Express app
  server.js        API entrypoint

worker/
  fetch_issues.py  GitHub issue fetcher
  normalize.py     Issue normalization helpers
  scheduler.py     APScheduler runner
  config.py        Target repositories

src/
  api/             Frontend API client
  components/      React UI components
  hooks/           Data and debounce hooks
  pages/           Route pages
  utils/           Bookmark helpers
```

## Local Setup

### 1. Install Node dependencies

```bash
npm install
```

### 2. Configure backend environment

```bash
cp server/.env.example server/.env
```

Update `server/.env`:

```bash
PORT=3000
DATABASE_URL=postgres://postgres:postgres@localhost:5432/good_first_issues
REDIS_URL=redis://localhost:6379
GITHUB_TOKEN=ghp_replace_with_your_token
ADMIN_SECRET=replace_with_admin_refresh_secret
CORS_ORIGIN=http://localhost:5173
```

Use a GitHub token for better API limits when running the worker.

### 3. Configure frontend environment

Create a root `.env` file:

```bash
VITE_API_URL=http://localhost:3000/api
```

For Vercel production, use:

```bash
VITE_API_URL=https://firstissue-production.up.railway.app/api
```

### 4. Create database schema

```bash
psql "$DATABASE_URL" -f server/db/schema.sql
```

If you have local seed data available:

```bash
psql "$DATABASE_URL" -f server/db/seed.sql
```

### 5. Start local services

Make sure PostgreSQL and Redis are running, then start the API:

```bash
npm run dev:server
```

Start the frontend in another terminal:

```bash
npm run dev
```

## Worker

Create and activate a Python virtual environment:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install --upgrade pip setuptools wheel
python -m pip install -r worker/requirements.txt
```

Run one fetch:

```bash
python worker/fetch_issues.py
```

Run the scheduler, which fetches every 45 minutes:

```bash
python worker/scheduler.py
```

## API Endpoints

### Health

```http
GET /health
```

Returns database and Redis status:

```json
{
  "status": "ok",
  "checks": {
    "database": true,
    "redis": true
  }
}
```

### Issues

```http
GET /api/issues
```

Query parameters:

- `language`
- `label`
- `minStars`
- `sortBy`: `score`, `stars`, or `recent`
- `page`
- `limit`: default `20`, max `100`

Example:

```bash
curl "http://localhost:3000/api/issues?language=JavaScript&label=good%20first%20issue&minStars=0&sortBy=score&page=1&limit=20"
```

Response shape:

```json
{
  "data": [
    {
      "id": 1,
      "githubId": "910000001",
      "repoName": "nodejs/node",
      "repoUrl": "https://github.com/nodejs/node",
      "repoStars": 111000,
      "title": "Improve docs for URLSearchParams examples",
      "issueUrl": "https://github.com/nodejs/node/issues/51001",
      "language": "JavaScript",
      "labels": ["good first issue", "doc"],
      "commentsCount": 2,
      "createdAt": "2026-05-05T10:12:00.000Z",
      "updatedAt": "2026-06-09T08:30:00.000Z",
      "activityScore": 1.126,
      "fetchedAt": "2026-06-13T16:35:57.872Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 2102,
    "totalPages": 106
  }
}
```

### Single Issue

```http
GET /api/issues/:id
```

### Trending Repositories

```http
GET /api/repos/trending
```

### Stats

```http
GET /api/stats
```

Returns aggregate issue counts, language distribution, repository count, latest fetch timestamp, and normalized top labels:

```json
{
  "totalIssues": 2102,
  "issuesByLanguage": {
    "Go": 811,
    "TypeScript": 553,
    "Python": 294,
    "JavaScript": 180,
    "Ruby": 138,
    "Java": 126
  },
  "totalRepos": 29,
  "lastUpdated": "2026-06-16T05:19:26.183Z",
  "topLabels": [
    { "label": "help wanted", "count": 1921 },
    { "label": "bug", "count": 457 }
  ]
}
```

## Caching and Rate Limits

- `GET /api/issues` is rate-limited to 100 requests per 15 minutes per IP.
- Issue searches are cached in Redis for 10 minutes.
- Trending repositories and stats are cached in Redis for 30 minutes.
- Responses include `X-Cache: HIT` or `X-Cache: MISS` when cache middleware runs.

## Deployment

### Backend on Railway

The backend deploys from the repo root using `Dockerfile`. The Docker image installs Node.js dependencies, Python, a Python virtual environment, and the worker dependencies so the refresh endpoint can run `worker/fetch_issues.py` in production.

Required Railway variables:

```bash
DATABASE_URL=postgres://...
REDIS_URL=rediss://default:password@host.upstash.io:6379
GITHUB_TOKEN=ghp_replace_with_your_token
ADMIN_SECRET=replace_with_admin_refresh_secret
NODE_ENV=production
```

Optional:

```bash
CORS_ORIGIN=https://first-issue-ashen.vercel.app
```

Railway settings:

```text
Root Directory: empty
Build Command: empty
Start Command: empty
Healthcheck Path: /health
```

Important Redis note: in Railway, the `REDIS_URL` value must be only the URL:

```text
rediss://default:password@host.upstash.io:6379
```

Do not paste:

```text
REDIS_URL="rediss://..."
```


### Production Worker Refresh

The production worker is triggered through a protected admin endpoint. Cron-job.org can call this endpoint every 6 hours.

Start a refresh:

```bash
curl -X POST \
  https://firstissue-production.up.railway.app/api/admin/refresh \
  -H "x-admin-secret: YOUR_ADMIN_SECRET"
```

Successful response:

```json
{
  "message": "Worker started",
  "runId": "9945e5f3-4776-4498-9945-b2a44b621976"
}
```

Check refresh status:

```bash
curl -X GET \
  https://firstissue-production.up.railway.app/api/admin/refresh/status \
  -H "x-admin-secret: YOUR_ADMIN_SECRET"
```

Status response after a successful run:

```json
{
  "running": false,
  "activeRunId": null,
  "status": {
    "state": "success",
    "exitCode": 0,
    "error": null
  }
}
```

Refresh behavior:

- Requests without the correct `x-admin-secret` return `401`.
- If a refresh is already running, the endpoint returns `409`.
- The worker status is stored in Redis.
- A successful run clears cached stats, trending repositories, and issue search results.
- Python logging appears in `stderr` by default; that does not mean the worker failed.

### Frontend on Vercel

Vercel settings:

```text
Framework Preset: Vite
Root Directory: ./
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

Production environment variable:

```bash
VITE_API_URL=https://firstissue-production.up.railway.app/api
```

`vercel.json` contains SPA rewrites so direct refreshes on `/stats`, `/about`, and `/bookmarks` return the React app instead of a Vercel 404.

## Deployment Smoke Tests

Backend:

```bash
curl https://firstissue-production.up.railway.app/health
curl https://firstissue-production.up.railway.app/api/stats
curl "https://firstissue-production.up.railway.app/api/issues?limit=1"
curl "https://firstissue-production.up.railway.app/api/issues?language=JavaScript&label=good%20first%20issue&minStars=0&sortBy=score&page=1&limit=3"
curl https://firstissue-production.up.railway.app/api/repos/trending
curl -X POST https://firstissue-production.up.railway.app/api/admin/refresh
# Expected without secret: 401 Unauthorized
```

Protected worker checks:

```bash
curl -X GET \
  https://firstissue-production.up.railway.app/api/admin/refresh/status \
  -H "x-admin-secret: YOUR_ADMIN_SECRET"
```

Frontend:

```bash
curl -I https://first-issue-ashen.vercel.app/
curl -I https://first-issue-ashen.vercel.app/stats
curl -I https://first-issue-ashen.vercel.app/bookmarks
```

Manual browser checks:

- Issues load on the home page.
- Search updates after typing stops.
- Language, label, stars, and sort filters work.
- Pagination works.
- Stats page loads charts and trending repositories.
- Bookmarks persist after refresh.
- Dark/light mode toggle works.
- Browser console has no API or CORS errors.


## Project Status Report

Claude's recent review was directionally useful but partly stale:

- It correctly identified that production usefulness depends on fresh issue data.
- It was stale about Railway not being able to run Python; the current Dockerfile includes Python and worker dependencies.
- It was stale about the worker not being triggered on Railway; the admin refresh endpoint has been verified with a successful production worker run.
- It was stale about the repository expansion not being committed; `worker/config.py` contains the expanded target list.
- It correctly suggested improving production reliability, which is now handled through worker status tracking, Redis locking, and cache invalidation.

Remaining production improvements worth considering later:

- Rotate any secrets that were pasted into chat or screenshots.
- Add a small admin UI for worker status instead of using curl.
- Mark or remove issues that later close on GitHub.
- Add a user-facing repo suggestion flow.
- Add automated tests for API validation, admin auth, worker normalization, and stats queries.
- Add monitoring or alerts for failed worker runs.

## Security Notes

- Never commit `.env` files.
- Never put real GitHub, Redis, or database credentials in `.env.example`.
- Rotate tokens if they are pasted into chat, screenshots, logs, or commits.
