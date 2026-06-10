import os
from pathlib import Path

from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parents[1]
load_dotenv(ROOT_DIR / "server" / ".env")

DATABASE_URL = os.getenv("DATABASE_URL", "postgres://postgres:postgres@localhost:5432/good_first_issues")
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")

GITHUB_API_BASE = "https://api.github.com"
REQUEST_TIMEOUT_SECONDS = 30
SEARCH_PER_PAGE = 50
TARGET_LABELS = ["good first issue", "help wanted"]

TARGET_REPOSITORIES = [
    {"owner": "nodejs", "repo": "node", "language": "JavaScript"},
    {"owner": "expressjs", "repo": "express", "language": "JavaScript"},
    {"owner": "facebook", "repo": "react", "language": "JavaScript"},
    {"owner": "vercel", "repo": "next.js", "language": "TypeScript"},
    {"owner": "django", "repo": "django", "language": "Python"},
    {"owner": "pallets", "repo": "flask", "language": "Python"},
    {"owner": "ansible", "repo": "ansible", "language": "Python"},
    {"owner": "scikit-learn", "repo": "scikit-learn", "language": "Python"},
    {"owner": "kubernetes", "repo": "kubernetes", "language": "Go"},
    {"owner": "prometheus", "repo": "prometheus", "language": "Go"},
]
