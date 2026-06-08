CREATE TABLE IF NOT EXISTS issues (
  id SERIAL PRIMARY KEY,
  github_id BIGINT UNIQUE NOT NULL,
  repo_name TEXT NOT NULL,
  repo_url TEXT NOT NULL,
  repo_stars INT DEFAULT 0,
  title TEXT NOT NULL,
  issue_url TEXT NOT NULL,
  language TEXT,
  labels TEXT[] DEFAULT '{}',
  comments_count INT DEFAULT 0,
  created_at TIMESTAMP,
  updated_at TIMESTAMP,
  activity_score FLOAT DEFAULT 0,
  fetched_at TIMESTAMP DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_language ON issues(language);
CREATE INDEX IF NOT EXISTS idx_labels ON issues USING GIN(labels);
CREATE INDEX IF NOT EXISTS idx_score ON issues(activity_score DESC);
CREATE INDEX IF NOT EXISTS idx_repo_stars ON issues(repo_stars DESC);
