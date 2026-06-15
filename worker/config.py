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
    # JavaScript / TypeScript
    {"owner": "nodejs", "repo": "node", "language": "JavaScript"},
    {"owner": "expressjs", "repo": "express", "language": "JavaScript"},
    {"owner": "facebook", "repo": "react", "language": "JavaScript"},
    {"owner": "vercel", "repo": "next.js", "language": "TypeScript"},
    {"owner": "vitejs", "repo": "vite", "language": "TypeScript"},
    {"owner": "vuejs", "repo": "core", "language": "TypeScript"},
    {"owner": "sveltejs", "repo": "svelte", "language": "TypeScript"},
    {"owner": "microsoft", "repo": "TypeScript", "language": "TypeScript"},
    {"owner": "axios", "repo": "axios", "language": "JavaScript"},
    {"owner": "tailwindlabs", "repo": "tailwindcss", "language": "JavaScript"},
    {"owner": "prettier", "repo": "prettier", "language": "JavaScript"},
    {"owner": "eslint", "repo": "eslint", "language": "JavaScript"},
    {"owner": "webpack", "repo": "webpack", "language": "JavaScript"},
    {"owner": "socketio", "repo": "socket.io", "language": "TypeScript"},
    {"owner": "supabase", "repo": "supabase", "language": "TypeScript"},
    # Python
    {"owner": "django", "repo": "django", "language": "Python"},
    {"owner": "pallets", "repo": "flask", "language": "Python"},
    {"owner": "ansible", "repo": "ansible", "language": "Python"},
    {"owner": "scikit-learn", "repo": "scikit-learn", "language": "Python"},
    {"owner": "pandas-dev", "repo": "pandas", "language": "Python"},
    {"owner": "numpy", "repo": "numpy", "language": "Python"},
    {"owner": "matplotlib", "repo": "matplotlib", "language": "Python"},
    {"owner": "fastapi", "repo": "fastapi", "language": "Python"},
    {"owner": "celery", "repo": "celery", "language": "Python"},
    {"owner": "encode", "repo": "django-rest-framework", "language": "Python"},
    {"owner": "python-poetry", "repo": "poetry", "language": "Python"},
    {"owner": "psf", "repo": "requests", "language": "Python"},
    {"owner": "pytest-dev", "repo": "pytest", "language": "Python"},
    {"owner": "pypa", "repo": "pip", "language": "Python"},
    # Go
    {"owner": "kubernetes", "repo": "kubernetes", "language": "Go"},
    {"owner": "prometheus", "repo": "prometheus", "language": "Go"},
    {"owner": "golang", "repo": "go", "language": "Go"},
    {"owner": "grafana", "repo": "grafana", "language": "Go"},
    {"owner": "hashicorp", "repo": "terraform", "language": "Go"},
    {"owner": "docker", "repo": "cli", "language": "Go"},
    {"owner": "cli", "repo": "cli", "language": "Go"},
    {"owner": "go-gitea", "repo": "gitea", "language": "Go"},
    {"owner": "traefik", "repo": "traefik", "language": "Go"},
    {"owner": "etcd-io", "repo": "etcd", "language": "Go"},
    # Rust
    {"owner": "rust-lang", "repo": "rust", "language": "Rust"},
    {"owner": "rust-lang", "repo": "cargo", "language": "Rust"},
    {"owner": "tokio-rs", "repo": "tokio", "language": "Rust"},
    {"owner": "serde-rs", "repo": "serde", "language": "Rust"},
    {"owner": "clap-rs", "repo": "clap", "language": "Rust"},
    # Java
    {"owner": "spring-projects", "repo": "spring-boot", "language": "Java"},
    {"owner": "elastic", "repo": "elasticsearch", "language": "Java"},
    {"owner": "apache", "repo": "kafka", "language": "Java"},
    {"owner": "quarkusio", "repo": "quarkus", "language": "Java"},
    # C++
    {"owner": "opencv", "repo": "opencv", "language": "C++"},
    {"owner": "tensorflow", "repo": "tensorflow", "language": "C++"},
    {"owner": "pytorch", "repo": "pytorch", "language": "C++"},
    # GSoC orgs
    {"owner": "sympy", "repo": "sympy", "language": "Python"},
    {"owner": "networkx", "repo": "networkx", "language": "Python"},
    {"owner": "astropy", "repo": "astropy", "language": "Python"},
    {"owner": "coala", "repo": "coala", "language": "Python"},
    {"owner": "fossasia", "repo": "open-event-server", "language": "Python"},
    {"owner": "processing", "repo": "p5.js", "language": "JavaScript"},
    {"owner": "publiclab", "repo": "plots2", "language": "JavaScript"},
]
