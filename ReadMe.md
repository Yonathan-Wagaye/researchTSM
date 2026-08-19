# Polyglot — Translation Management System for Academic Research

## Description

Polyglot is a lightweight, research-oriented translation management platform designed for multilingual research software. It provides a structured environment to manage phrases, translations, language metadata, and media assets as versioned records, while remaining compatible with existing translation assets and workflows.

The platform bridges the gap between researchers, translators, and developers by offering contextual translation editing, incremental updates, validation pipelines, controlled publishing, and safe application integration — all within a clean, modern interface.

## Goal

Develop a translation management platform tailored for research software that manages multilingual phrases, media assets, and translation workflows as versioned, context-aware, and software-integrated resources. The platform should improve collaboration between researchers, translators, and developers through contextual translation, incremental updates, validation, controlled publishing, and safe application integration.

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 16, React 19, TypeScript, MUI (Material UI v9), Tailwind CSS v4 |
| **Backend** | Python, FastAPI, Uvicorn (ASGI) |
| **Database** | PostgreSQL 17 (async via `asyncpg` + SQLAlchemy) |
| **Caching** | Redis 7 |
| **ORM / Migrations** | SQLAlchemy + Alembic |
| **Auth** | JWT (`PyJWT`), Argon2 password hashing, HttpOnly refresh token cookies |
| **File Parsing** | `openpyxl` for Excel import/export |
| **Containerization** | Docker + Docker Compose |
| **Testing** | Pytest + pytest-asyncio |

## MVP Features

- Create, edit, archive, and view translation projects
- Add or remove supported languages with language metadata (including LTR/RTL direction)
- Configure one source language and multiple target languages per project
- Import Excel and CSV translation files with a two-step preview/confirm workflow
- Preview and validate imported data before saving
- Export approved phrases to Excel, CSV, or JSON
- List, search, add, edit, archive, and restore phrases
- Preserve stable developer keys and prevent duplicates within a project
- Add and edit translations with per-language status tracking (`pending`, `approved`, `rejected`)
- Mark translations as outdated when source text changes
- Filter phrases by translation status and review approvals
- Attach shared media assets to phrases with preview support
- Record basic revision history and restore previous translation values
- Support user authentication with administrator and regular-user roles
- Redis-backed caching for performance
- Structured logging throughout the backend

## Project Structure

```
researchTMS/
├── compose.yaml                  # Docker Compose (api + postgres + redis)
├── .env / .env.test              # Environment configuration
├── backend/
│   ├── app/
│   │   ├── main.py               # FastAPI app, CORS, routers, exception handlers
│   │   ├── config.py             # Pydantic-settings configuration
│   │   ├── database.py           # Async DB session setup
│   │   ├── api/routes/           # auth, projects, phrases, languages
│   │   ├── models/               # SQLAlchemy models: user, project, phrase, translation, language
│   │   ├── schemas/              # Pydantic request/response schemas
│   │   ├── services/             # Business logic: auth, project, phrase, language services
│   │   ├── core/                 # Security, auth middleware, caching, logging
│   │   ├── exceptions/           # Custom exception classes and handlers
│   │   ├── utils/                # File parsers (Excel/CSV)
│   │   └── tests/                # Unit and functional tests
│   └── alembic/                  # Database migration scripts
└── frontend/
    ├── app/
    │   ├── (auth)/               # Login, signup pages
    │   └── (protected)/
    │       ├── (shell)/          # Dashboard, project list, new project, settings
    │       └── (board)/          # Project detail, phrases, translations, versions, edit
    ├── components/
    │   ├── auth/                 # PasswordInput
    │   ├── layout/               # AppShell, BoardShell, PolyglotLogo, ThemeRegistry
    │   ├── phrase/               # AddPhraseDialog, PhraseTranslationsTable, PhraseUploadSummaryDialog
    │   └── ui/                   # Loading spinner, shared UI components
    ├── api/                      # Typed API client functions (auth, project, phrase, language)
    ├── hooks/                    # AuthContext, ThemeContext
    ├── types/                    # TypeScript types for auth, project, phrase, language
    └── lib/                      # Base HTTP client, themes
```

## API Reference

| Method | Path | Description |
|---|---|---|
| `POST` | `/auth/register` | Register a new user |
| `POST` | `/auth/login` | Login — returns access token and sets HttpOnly refresh cookie |
| `POST` | `/auth/refresh` | Refresh the access token |
| `POST` | `/auth/logout` | Logout and clear the refresh cookie |
| `GET` | `/auth/me` | Get the currently authenticated user |
| `POST` | `/projects/create` | Create a new translation project |
| `GET` | `/projects/getProject` | Retrieve a single project |
| `GET` | `/projects/getProjects` | List all projects (paginated) |
| `PUT` | `/projects/updateProject` | Update project details |
| `POST` | `/projects/uploadPhrases` | Upload an Excel/CSV file for phrase preview |
| `POST` | `/projects/confirmPhraseUpload` | Confirm and persist uploaded phrases |
| `POST` | `/phrases/createPhrase` | Add a phrase to a project |
| `PUT` | `/phrases/updatePhrase` | Update an existing phrase |
| `GET` | `/phrases/getPhrase` | Retrieve a single phrase |
| `GET` | `/phrases/getPhraseTranslations` | Get paginated phrase and translation list |
| `GET` | `/languages` | List all supported languages |
| `GET` | `/health` | API health check |
| `GET` | `/health/database` | Database connectivity check |

## Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose (recommended), **or**
- Python 3.11+ and Node.js 20+ for local development

### Running with Docker (recommended)

```bash
# Copy and configure environment variables
cp .env.test .env
# Edit .env to set POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD, SECRET_KEY, etc.

# Build and start all services (API + PostgreSQL + Redis)
docker compose up --build
```

The API will be available at `http://localhost:8000`.

### Running Locally

**Backend:**

```bash
cd backend
pip install -r requirements.txt

# Apply database migrations
alembic upgrade head

# Start the development server
uvicorn app.main:app --reload --port 8000
```

**Frontend:**

```bash
cd frontend
npm install

# Create a local environment file and set the API URL
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

npm run dev
```

The frontend will be available at `http://localhost:3000`.

### Running Tests

```bash
cd backend
pytest
```

## License

This project is licensed under the [Elastic License 2.0 (ELv2)](LICENSE).

You are free to use, copy, modify, and distribute this software for any non-commercial purpose. You may **not** offer it as a hosted or managed service to third parties. See the [LICENSE](LICENSE) file for full terms.

Copyright © 2026 Yonathan Wagaye.
