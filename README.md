# AlphaBot

AlphaBot is an AI-powered productivity web application built around two core tools: **AI Chat Assistant** and **CV Creator**. It combines command-based writing and coding help with AI-assisted CV generation and role-specific analysis.

> No public live demo is currently available.

## Contents

- [Features](#features)
- [Technology stack](#technology-stack)
- [Project structure](#project-structure)
- [Getting started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend setup](#backend-setup)
  - [Frontend setup](#frontend-setup)
- [Configuration](#configuration)
- [Daily AI usage limit](#daily-ai-usage-limit)
- [Authentication and email verification](#authentication-and-email-verification)
- [Future improvements](#future-improvements)

## Features

### 1. AI Chat Assistant

A single chat interface with commands for different kinds of assistance:

| Command | Purpose |
| --- | --- |
| `/normal` | General AI assistance |
| `/rewrite` | Rework text for clarity and flow |
| `/humanise` | Make text sound more natural |
| `/code` | Get programming help |
| `/formalise` | Make writing more formal |
| `/script` | Help draft scripts |

Commands can be entered directly in the chat. The assistant also supports general questions, learning, ideas, productivity and problem-solving.

### 2. CV Creator

Create a CV with AI assistance and review it against a target role. The CV workflow includes:

- AI-generated professional CV content
- Role-specific CV analysis
- An ATS compatibility score
- Identified strengths and areas for improvement
- Missing keyword suggestions
- CV editing and preview tools
- Exporting the CV as a PDF

## Technology stack

| Area | Technologies |
| --- | --- |
| Frontend | Next.js, React, TypeScript |
| Styling | Tailwind CSS |
| CV export and rendering | `html2pdf.js`, `react-markdown` |
| Backend | Python, Django, Django REST Framework |
| Database | PostgreSQL in deployment; SQLite can be used for local development when configured |
| AI provider | OpenRouter |
| Email verification | Resend |
| Static files | WhiteNoise |
| Backend server | Gunicorn |
| Frontend development/build | Node.js, npm |

## Project structure

```text
alphabot-live/
├── AI_assistant/          # Django project settings and URL configuration
├── accounts/              # Registration, login and email verification
├── alphabot/              # Chat and CV generation/analysis logic
├── usage/                 # Daily AI usage tracking
├── alphabot-frontend/     # Next.js frontend
│   ├── app/               # App Router pages
│   ├── components/        # UI components
│   └── lib/               # Frontend helpers, including API requests
├── manage.py
├── requirements.txt
└── README.md
```

## Getting started

### Prerequisites

Install the following before starting:

- Python 3.10 or later
- Node.js compatible with the installed Next.js version (Node.js 20.9 or later is recommended)
- npm
- An OpenRouter API key for AI features
- A Resend API key if you want to test real verification emails

### Backend setup

1. Clone the repository and enter its directory:

   ```bash
   git clone https://github.com/Alphiii2005/alphabot-live.git
   cd alphabot-live
   ```

2. Create and activate a virtual environment.

   **Windows PowerShell**
   ```powershell
   python -m venv .venv
   .\.venv\Scripts\Activate.ps1
   ```

   **macOS / Linux**
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

3. Install the Python dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the repository root and add the configuration described below.

5. Apply database migrations and start Django:

   ```bash
   python manage.py migrate
   python manage.py runserver 8000
   ```

The Django development server will run at `http://127.0.0.1:8000`.

### Frontend setup

Open a second terminal from the repository root:

```bash
cd alphabot-frontend
npm ci
npm run dev
```

The Next.js development server will normally run at `http://localhost:3000`.

**API connection note:** the current frontend API helper uses same-origin requests by default. When running the frontend and Django on separate local ports, configure a development proxy/rewrite or the frontend API base URL so requests reach `http://127.0.0.1:8000`. Do not commit machine-specific URLs or secrets. The Django CORS and trusted-origin settings must also match the frontend origin.

## Configuration

Create a `.env` file in the repository root. Use your own secret values and never commit this file.

Example local configuration:

```dotenv
DEBUG=True
SECRET_KEY=replace-with-a-long-random-secret
OPENROUTER_API_KEY=your-openrouter-api-key
RESEND_API_KEY=your-resend-api-key
ALPHABOT_DAILY_AI_LIMIT=20
FRONTEND_URL=http://localhost:3000
DEFAULT_FROM_EMAIL=noreply@example.com
DATABASE_URL=sqlite:///db.sqlite3
```

Configuration notes:

- `SECRET_KEY`: Django secret key. Use a strong, private value.
- `OPENROUTER_API_KEY`: required for AI-powered chat and CV features.
- `RESEND_API_KEY`: used to send verification emails. Use a sender address configured and verified with your email provider.
- `ALPHABOT_DAILY_AI_LIMIT`: maximum number of AI generations available per user per day. The default is `20`.
- `FRONTEND_URL`: frontend origin used when creating verification links and configuring allowed origins.
- `DEFAULT_FROM_EMAIL`: sender address used for verification messages.
- `DATABASE_URL`: database connection string. SQLite is convenient for local development; configure PostgreSQL for a persistent production database.
- `ALLOWED_HOSTS`: set this to a comma-separated list of permitted hostnames when running with `DEBUG=False`.

For production, set `DEBUG=False`, provide a secure `SECRET_KEY`, configure `ALLOWED_HOSTS`, use PostgreSQL, and set `FRONTEND_URL` to the correct frontend origin. Configure all secrets in your hosting provider's environment settings rather than storing them in the repository.

## Daily AI usage limit

AlphaBot tracks AI usage by user and date. The default limit is **20 AI generations per user per day**, configurable through `ALPHABOT_DAILY_AI_LIMIT`.

The quota is shared across AI generation features, including chat and CV workflows. The backend returns usage information such as the amount used, the remaining quota and the daily limit. Requests made after the limit is reached receive an HTTP `429` response. Failed AI requests can release a reserved quota slot.

## Authentication and email verification

The backend provides account registration, login, email verification, verification-email resending, session-based authentication and logout. New accounts must verify their email before logging in. Verification links expire after 24 hours by default.

For local development, make sure the frontend origin and backend CORS/CSRF settings agree. Browser session cookies must be allowed for the chosen development setup. If you change ports or origins, update `FRONTEND_URL` and the corresponding Django origin settings.

## Future improvements

Potential next steps for AlphaBot include:

- Improve the frontend API configuration so local and deployed environments can be selected through environment variables.
- Expand automated tests for authentication, AI commands, quota handling and CV analysis.
- Add clearer loading, retry and error states for AI requests.
- Improve CV templates and provide more control over formatting and exported PDFs.
- Refine accessibility, responsive layouts and keyboard navigation.
- Add more robust deployment and troubleshooting documentation.

These are roadmap ideas, not claims that the features are already implemented.

## Project status

AlphaBot is under active development. There is currently no public live demo.

## Author

Created by [Alphiii2005](https://github.com/Alphiii2005).
