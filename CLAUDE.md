# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

KGI Anti-Gaming Fraud Dashboard & Compliance Auditor — a compliance system for detecting and managing fraudulent behavior in micro-learning platforms (e.g., speed-clicking through FSC-mandated training modules). Built for KGI Securities (凱基證券) regulatory compliance.

Bilingual support: English and Traditional Mandarin (繁體中文), with a custom i18n system.

## Tech Stack

- **Backend:** Python 3 / Flask, raw sqlite3 (no ORM)
- **Database:** SQLite (`compliance.db`, auto-created on first run)
- **Frontend:** Vanilla JS (IIFE module pattern), plain CSS with CSS Variables (dark theme), single-page app via CSS display toggling

## Running the App

```bash
pip3 install -r requirements.txt
python3 app.py
# Serves at http://localhost:5000 (override with PORT env var)
```

First run auto-creates the database with schema + seed data (8 agents, 6 modules, 5 rules, 15 sample sessions).

### Reset Database

```bash
rm compliance.db && python3 app.py
```

## Architecture

### Backend (2 files)

- **`app.py`** — Flask routes and REST API. All endpoints return JSON except `/` which serves the SPA. Flag resolution follows approve/void/escalate workflow with immutable audit logging.
- **`database.py`** — Schema definition (`init_db`), seed data (`_seed`), and the rule evaluation engine (`evaluate_session` / `_evaluate_and_flag`). The rule engine dynamically loads active rules from `ComplianceRules` table and evaluates sessions against JSON-configured thresholds.

### Frontend (3 files)

- **`templates/index.html`** — SPA shell with all views in the DOM (dashboard, rules, audit log, simulate). Views toggle via `.active` CSS class.
- **`static/js/app.js`** — `App` IIFE module containing all logic: API calls via fetch, i18n (`TRANSLATIONS` object + `t()` function + `data-i18n` attributes), debounced search, XSS escaping via `esc()`.
- **`static/css/style.css`** — Dark theme using CSS custom properties (`--bg`, `--surface`, `--high`, `--medium`, `--low`, `--accent`).

### Database Schema (6 tables)

`Agents` → `Sessions` → `FlaggedSessions` → `ComplianceAuditLog`, with `LearningModules`, `ComplianceRules`, and `Managers` as reference tables. Foreign keys enforced via `PRAGMA foreign_keys = ON`.

### Rule Engine

Rules are stored in `ComplianceRules` with a `rule_type` (SPEEDING, PATTERN_GUESSING, DISTRACTION, SPEED_WITH_PERFECT, REPEAT_FAILURE) and `parameter_json` for dynamic thresholds. The engine in `database.py:_evaluate_and_flag` iterates active rules and flags sessions that match. High-severity flags auto-lock the agent's streak shield.

### i18n System

Translation keys live in `TRANSLATIONS` object in `app.js` (en/zh). HTML elements use `data-i18n`, `data-i18n-placeholder`, and `data-i18n-opt` attributes. Language preference persisted in localStorage (`kgi_lang`).

## Key API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/stats` | Dashboard summary stats |
| GET | `/api/flagged-sessions` | List flags (filterable by severity/status/search) |
| GET | `/api/flagged-sessions/<id>` | Flag detail with telemetry timeline + audit history |
| POST | `/api/flagged-sessions/<id>/resolve` | Resolve flag (action: approve/void/escalate) |
| GET/POST/PUT | `/api/rules` | CRUD for compliance rules |
| POST | `/api/sessions/simulate` | Demo: simulate a training session and trigger evaluation |

## Conventions

- DB connections are per-request (open/close pattern, no connection pool)
- `ComplianceAuditLog` is append-only (INSERT only, no UPDATE/DELETE) for FSC audit compliance
- All user-facing strings should go through the `TRANSLATIONS` object for both `en` and `zh` keys
- Frontend HTML escaping via `esc()` for all dynamic content
