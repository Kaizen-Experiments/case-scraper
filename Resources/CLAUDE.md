# eCourts Scraper — Project Guide for Claude Code

## What This Project Is

A local web dashboard + scraper system that builds a structured dataset of
Indian High Court cases from judgments.ecourts.gov.in.

The system has two parts:
1. **Frontend** — React dashboard at localhost:8080 (this folder)
2. **Backend** — FastAPI + Playwright scraper at localhost:8000 (to be built)

---

## Current Task: Build the Frontend

There are two spec documents — read BOTH before building:

**`docs/FRONTEND_SPEC.md`** — Design system, colors, fonts, API contract, Dashboard page spec, shared components

**`docs/PAGES_SPEC.md`** — Full visual specs for all other pages:
- Cases page + CaseDrawer (slide-in drawer)
- Jobs page (tabs, failure summary, retry)
- Export page (scope, format, fields, preview)
- Settings page (scraper config, API keys, DB)
- All mock data for every page
- Shared components (Toast, ConfirmDialog, loading states, empty states)
- Build order

The Dashboard is already built. Build the remaining pages using PAGES_SPEC.md.

---

## Project Structure

```
ecourts/
├── CLAUDE.md              ← you are here
├── docs/
│   └── FRONTEND_SPEC.md   ← full frontend specification
├── frontend/              ← React app (build here)
│   └── src/
├── backend/               ← FastAPI + scraper (not started yet)
```

## Rules

- Always use mock data from the spec so the UI works without a backend
- Use Tailwind for all styling — no CSS modules or inline styles
- Keep all API calls inside `src/api/client.js`
- IBM Plex Mono for all numbers, CNRs, dates
- DM Sans for all UI text
- Dark theme only — background #0f1117
- Do not add any dependencies not listed in the spec without asking
