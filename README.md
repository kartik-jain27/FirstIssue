# GitHub Good First Issue Aggregator

Node.js + Express backend with PostgreSQL storage, Redis caching, and a Python worker that fetches beginner-friendly GitHub issues.

## Prerequisites

- Node.js 20+
- Python 3.10+
- PostgreSQL
- Redis
- GitHub personal access token recommended for higher API limits

## Setup

1. Install Node dependencies:

   ```bash
   npm install
   ```

2. Create environment variables:

   ```bash
   cp server/.env.example server/.env
   ```

   Update `DATABASE_URL`, `REDIS_URL`, and `GITHUB_TOKEN`.

3. Create the database schema and optional sample data:

   ```bash
   psql "$DATABASE_URL" -f server/db/schema.sql
   psql "$DATABASE_URL" -f server/db/seed.sql
   ```

4. Start Redis and PostgreSQL, then run the API:

   ```bash
   npm run dev:server
   ```

5. Install Python worker dependencies:

   ```bash
   python -m venv .venv
   source .venv/bin/activate
   pip install -r worker/requirements.txt
   ```

6. Run the worker once:

   ```bash
   python worker/fetch_issues.py
   ```

7. Or run the scheduler, which fetches every 45 minutes:

   ```bash
   python worker/scheduler.py
   ```

## API

- `GET /health` checks API, PostgreSQL, and Redis connectivity.
- `GET /api/issues?language=JavaScript&label=good%20first%20issue&minStars=1000&sortBy=score&page=1&limit=20`
- `GET /api/issues/:id`
- `GET /api/repos/trending`
- `GET /api/stats`

`GET /api/issues` is rate-limited to 100 requests per 15 minutes per IP and cached in Redis for 10 minutes. Trending repos and stats are cached for 30 minutes.

## Frontend

The React frontend is a Vite app at the repo root. The root .env file is set to:

```bash
VITE_API_URL=http://localhost:3000/api
```

Run it in a second terminal after the backend is available:

```bash
npm run dev
```

The frontend consumes the backend camelCase issue shape: githubId, repoName, repoUrl, repoStars, issueUrl, commentsCount, createdAt, updatedAt, and activityScore.
