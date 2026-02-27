# eCourts Scraper — Frontend Specification

## Overview

A local web dashboard for managing and monitoring a long-running web scraping operation that builds a structured dataset of Indian High Court cases from judgments.ecourts.gov.in.

The dashboard runs at `localhost:8080`. It is used daily by one operator who needs to:
- See scraping progress at a glance
- Control scraper workers (start/pause/retry)
- Search and browse the collected case data
- Export data to CSV or JSON

---

## Tech Stack

- **Framework:** React (Vite)
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **HTTP client:** Axios
- **Routing:** React Router v6
- **Icons:** Lucide React
- **Fonts:** Use distinctive choices — suggested: `IBM Plex Mono` for data/numbers, `Sora` or `DM Sans` for UI text

---

## Design Direction

**Aesthetic:** Industrial / utilitarian dashboard — this is a serious data tool, not a marketing page. Think terminal meets modern data tooling. Dark theme. Dense but organised. Monospaced numbers. Clean grid. Minimal decoration but precise spacing.

**Color palette:**
```
Background:     #0f1117   (near black)
Surface:        #1a1d27   (card backgrounds)
Border:         #2a2d3a   (subtle dividers)
Primary:        #4f8ef7   (blue — actions, links)
Success:        #22c55e   (green — done/success)
Warning:        #f59e0b   (amber — pending/running)
Danger:         #ef4444   (red — failed/error)
Text primary:   #e2e8f0   (near white)
Text muted:     #64748b   (secondary text)
Text dim:       #374151   (very muted)
```

**Typography:**
- Numbers and CNR codes: `IBM Plex Mono`
- UI labels and body: `DM Sans`
- Dashboard feels like a Bloomberg terminal crossed with Linear

**Motion:**
- Progress bars animate on load (width transition 800ms ease-out)
- Activity log items slide in from bottom
- Page transitions: simple fade (150ms)
- Live polling every 10 seconds — numbers update with a brief highlight flash

---

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── Layout.jsx          ← sidebar + topbar shell
│   │   ├── Sidebar.jsx         ← navigation sidebar
│   │   ├── StatusBadge.jsx     ← ✅ ⏳ ❌ status pill
│   │   ├── ProgressBar.jsx     ← animated progress bar with %
│   │   ├── StatCard.jsx        ← number + label card
│   │   ├── ActivityLog.jsx     ← live scrolling event log
│   │   ├── CourtBreakdown.jsx  ← bar chart of cases per court
│   │   └── WorkerStatus.jsx    ← top-right worker indicator
│   │
│   ├── pages/
│   │   ├── Dashboard.jsx       ← main overview screen
│   │   ├── Cases.jsx           ← search + browse cases table
│   │   ├── CaseDrawer.jsx      ← slide-in case detail panel
│   │   ├── Jobs.jsx            ← scrape jobs table + retry
│   │   ├── Export.jsx          ← export configuration + download
│   │   └── Settings.jsx        ← scraper config + API keys
│   │
│   ├── api/
│   │   └── client.js           ← all API calls in one place
│   │
│   ├── hooks/
│   │   ├── usePolling.js       ← auto-refresh hook (every 10s)
│   │   └── useStats.js         ← stats data + polling
│   │
│   ├── App.jsx
│   └── main.jsx
```

---

## API Contract

The frontend talks to a FastAPI backend at `http://localhost:8000`.
All responses are JSON.

### Stats (used by Dashboard)
```
GET /api/stats

Response:
{
  "index": {
    "listed": 2104500,
    "total_estimated": 16962154,
    "pending": 14857654,
    "failed": 8234,
    "running": 3,
    "pct_complete": 12.4,
    "speed_pages_per_min": 42,
    "est_hours_remaining": 437
  },
  "details": {
    "fetched": 52000,
    "listed_not_fetched": 2052500,
    "failed": 1230,
    "running": 0,
    "pct_complete": 0.3
  },
  "courts": [
    { "name": "Bombay High Court", "listed": 1773285, "details_fetched": 12000 },
    ...
  ],
  "scraper_status": "running",  // idle | running | paused | error
  "active_workers": 3
}
```

### Activity Log (used by Dashboard)
```
GET /api/activity?limit=20

Response:
{
  "events": [
    {
      "id": 1,
      "timestamp": "2024-03-15T14:32:11Z",
      "type": "listed",           // listed | detail_fetched | failed
      "message": "Listed 10 cases — page 45,231",
      "page_number": 45231,
      "cnr": null
    },
    ...
  ]
}
```

### Scraper Control
```
POST /api/scraper/start
Body: { "workers": 3, "mode": "index" }   // mode: index | details | both

POST /api/scraper/pause

POST /api/scraper/retry-failed
Body: { "mode": "index" }                 // mode: index | details | both
```

### Cases (used by Cases page)
```
GET /api/cases?page=1&limit=50&court=Bombay+High+Court&disposal=Pending&from=2020-01-01&to=2024-12-31&q=seenappa

Response:
{
  "total": 45230,
  "page": 1,
  "pages": 905,
  "cases": [
    {
      "cnr": "APHC010460892016",
      "title": "Seenappa vs PRL SECY, Animal Husbandry",
      "court": "Andhra Pradesh High Court",
      "judge": "Tarlada Rajasekhar Rao",
      "date_registered": "2016-04-18",
      "date_decision": "2024-12-01",
      "disposal_nature": "Disposed of No Costs",
      "listed": true,
      "details_fetched": false,
      "detail_status": "pending"   // pending | running | done | failed
    },
    ...
  ]
}
```

### Single Case Detail
```
GET /api/cases/:cnr

Response: full case object including petitioner, respondent,
          case_history array, orders array
```

### Jobs (used by Jobs page)
```
GET /api/jobs?status=failed&mode=index&page=1&limit=50

Response:
{
  "total": 8234,
  "jobs": [
    {
      "page_number": 45229,
      "status": "failed",
      "cases_found": 0,
      "attempts": 3,
      "error": "CAPTCHA solve failed after 3 retries",
      "error_type": "captcha",    // captcha | timeout | parse | unknown
      "started_at": "...",
      "completed_at": "..."
    }
  ],
  "error_summary": {
    "captcha": 6102,
    "timeout": 1544,
    "other": 588
  }
}

POST /api/jobs/retry
Body: { "mode": "index", "error_type": "captcha" }  // error_type optional
```

### Export
```
POST /api/export
Body:
{
  "format": "csv",              // csv | json | jsonl
  "scope": "all",               // all | court | date_range | details_only
  "court": "Bombay High Court", // if scope=court
  "from": "2020-01-01",         // if scope=date_range
  "to":   "2024-12-31",
  "fields": ["cnr", "title", "court", "judge", "date_registered",
             "date_decision", "disposal_nature"]
}

Response: file download (Content-Disposition: attachment)
```

### Settings
```
GET  /api/settings
POST /api/settings
Body:
{
  "workers": 3,
  "delay_ms": 2000,
  "max_retries": 3,
  "headless": true,
  "anthropic_api_key": "sk-ant-...",
  "db_url": "postgresql://localhost/ecourts"
}

POST /api/settings/test-captcha    ← sends test image, returns solved text
POST /api/settings/test-db         ← tests DB connection
```

---

## Screen Specifications

---

### Screen 1 — Dashboard (`/`)

**Purpose:** At-a-glance progress + control center. This is what the operator opens every morning.

**Layout:** Two-column. Left sidebar (fixed, 220px). Right content area (fluid).

**Components on this page:**

#### 1.1 — Case Index Section
```
Label:        "CASE INDEX"
Sublabel:     "Cases discovered from listing pages"
Progress bar: animated, shows pct_complete %
              color: primary blue while running, green when 100%

Stats row:
  [listed]    big monospace number, green
  [pending]   muted number
  [failed]    red number + inline "↻ Retry" link if > 0

Speed row:    "~42 pages/min  ·  Est. 18.2 days remaining"
              only show when scraper is running

Controls:
  If status=idle or paused:   [ ▶ Start Index Scraper ]
  If status=running:          [ ⏸ Pause ]
  Worker count shown as:      "3 workers active"
```

#### 1.2 — Case Details Section
```
Same layout as 1.1 but for details scraper.
Label:        "CASE DETAILS"
Sublabel:     "Full data fetched for listed cases"

Stats:
  [fetched]             big green number
  [listed, not fetched] muted number
  [failed]              red + retry link

Note: both scrapers are independent — can run simultaneously.
      Show a subtle note: "Runs independently from index scraper"
```

#### 1.3 — Cases by Court
```
Horizontal bar chart (Recharts)
Each bar = one court
Show: court name, bar (proportional), listed count
Bars colored in primary blue gradient
Show top 5 courts, with "Show all X courts" toggle to expand
```

#### 1.4 — Activity Log
```
Scrollable list of last 20 events
Each event:
  - timestamp (HH:MM:SS format, monospace)
  - icon: ✅ for listed/fetched, ❌ for failed
  - message text
New events slide in from bottom
Log auto-scrolls to bottom
Max height: 280px, overflow scroll
```

**Auto-refresh:** Poll `/api/stats` and `/api/activity` every 10 seconds.
When new data arrives, numbers update with a 300ms yellow highlight flash.

---

### Screen 2 — Cases (`/cases`)

**Purpose:** Search and browse the collected dataset.

**Components:**

#### 2.1 — Search & Filter Bar
```
[ Search by CNR or party name...     🔍 ]

[ Court ▼ ]  [ Disposal ▼ ]  [ From date ]  [ To date ]  [ Filter ]

Showing X–Y of Z cases                          [ Export filtered ⬇ ]
```

Filters:
- Court: dropdown populated from `/api/stats` courts list
- Disposal: All / Disposed / Pending / Dismissed
- Date range: two date inputs (date_registered)
- Search: free text, searches CNR + title fields

#### 2.2 — Cases Table
```
Columns:
  CNR           monospace font, truncated with tooltip
  Title         truncated to ~60 chars
  Court         pill/badge style
  Date Reg.     monospace date
  Decision      monospace date (or "—" if null)
  Disposal      colored pill: green=disposed, amber=pending, grey=other
  Listed        ✅ always (if in table, it's listed)
  Details       ✅ fetched / ⏳ pending / ❌ failed / [ Fetch Now ] button

Row click → opens CaseDrawer (slides in from right)
Sticky header
Pagination: 50 rows per page, page controls at bottom
```

#### 2.3 — Case Drawer (slides in from right, 420px wide)
```
Header:
  CNR (monospace, large)
  Title (normal weight)
  [ ✕ Close ]

Fields section:
  Court:          value
  Judge:          value
  Registered:     value
  Decision:       value (or — )
  Disposal:       colored pill

Divider

Detail Status:
  If pending:  "⏳ Details not yet fetched"  [ Fetch Now ]
  If running:  "🔄 Fetching..."
  If done:     Shows petitioner, respondent, next hearing,
               case history table, orders list with PDF links
  If failed:   "❌ Failed — [error message]"  [ Retry ]

Snippet section (Phase 1 data):
  Collapsible — shows raw snippet text from listing page
```

---

### Screen 3 — Jobs (`/jobs`)

**Purpose:** See what's happening with individual scrape jobs, understand failures, retry them.

**Components:**

#### 3.1 — Mode Tabs
```
[ Index Jobs ]  [ Detail Jobs ]
```

#### 3.2 — Status Filter
```
[ All ]  [ Pending ]  [ Running ]  [ Done ]  [ Failed ]
```

#### 3.3 — Failed Jobs Summary (shown when Failed tab active)
```
Total failed: 8,234

Error breakdown:
  CAPTCHA errors    ████████ 6,102  (74%)  [ Retry CAPTCHA ]
  Timeout errors    ███       1,544  (19%)  [ Retry Timeouts ]
  Other               588   ( 7%)  [ Retry Other ]

[ ↻ Retry All Failed ]
```

#### 3.4 — Jobs Table
```
Columns (Index jobs):
  Page #      monospace
  Status      colored pill
  Cases found number
  Attempts    number
  Error       truncated error message (tooltip for full)
  Time        how long it took

Columns (Detail jobs):
  CNR         monospace
  Court       
  Status      colored pill
  Attempts    number
  Error       truncated
  Time        
```

---

### Screen 4 — Export (`/export`)

**Purpose:** Download a slice of the dataset.

**Layout:** Single column, form-based. Clean and simple.

**Form sections:**

```
SCOPE
  ○ All cases (2,104,500)
  ○ By court       [ dropdown ]
  ○ By date range  [ from ] — [ to ]
  ○ Details only   (only cases where details are fetched)

FORMAT
  ○ CSV
  ○ JSON
  ○ JSON Lines  (better for large files, one record per line)

FIELDS
  Checkboxes for each field:
  ☑ CNR  ☑ Title  ☑ Court  ☑ Judge
  ☑ Date Registered  ☑ Date Decision  ☑ Disposal
  ☐ Snippet  ☐ Petitioner  ☐ Respondent  (Phase 2 fields, greyed if not fetched)

PREVIEW
  Estimated rows:   2,104,500
  Estimated size:   ~320 MB

[ ⬇ Download Export ]
```

On click: POST to `/api/export`, browser downloads file directly.
Show loading state on button while export is being generated.
For large exports (>100k rows) show a progress indicator.

---

### Screen 5 — Settings (`/settings`)

**Purpose:** Configure the scraper and connections.

**Sections:**

```
SCRAPER
  Workers (1–10):       slider with live number
  Request delay (ms):   number input, default 2000
  Max retries:          number input, default 3
  Headless browser:     toggle (on by default)

API KEYS
  Anthropic API Key:    password input + [ Test ] button
  Test result shows:    "✅ Valid — Claude Haiku responding"
                     or "❌ Invalid key"

DATABASE
  Connection string:    text input (shows current)
  [ Test Connection ]   → "✅ Connected — 2,104,500 rows"
  DB size:              shown after test
  [ Migrate to Cloud… ] → opens modal with instructions

DANGER ZONE
  [ Reset All Failed Jobs ]    with confirm dialog
  [ Clear Activity Log ]       with confirm dialog
```

---

## Component Details

### Sidebar
```
Fixed left sidebar, 220px wide, full height.
Background: slightly lighter than page bg (#1a1d27)
Border-right: 1px solid border color

Top: App logo + name
  🏛️  eCourts
     Scraper

Nav items (with icons):
  📊 Dashboard
  📋 Cases
  ⚙️  Jobs
  ⬇️  Export
  🔧 Settings

Bottom:
  Worker status indicator
  DB status dot (green=connected, red=error)
```

### Worker Status Indicator (top-right of every page)
```
While running:  [● 3 workers]  pulsing green dot
While paused:   [⏸ Paused]     amber
While idle:     [○ Idle]        grey
While error:    [! Error]       red

Clicking it opens a small popover:
  Worker 1:  Page 45,231  — running
  Worker 2:  Page 45,198  — running
  Worker 3:  Page 45,156  — running
```

### Progress Bar
```
Props: value (0–100), color, animated (bool), showLabel (bool)

Appearance:
  Track:    dark background (#2a2d3a)
  Fill:     colored (blue/green/red based on context)
  Height:   8px, rounded
  Label:    right-aligned percentage in monospace

Animation: on mount, fill animates from 0 to value (800ms ease-out)
```

### Status Badge / Pill
```
pending   → amber background, amber text, "⏳ Pending"
running   → blue bg, blue text, "🔄 Running"
done      → green bg, green text, "✅ Done"
failed    → red bg, red text, "❌ Failed"
listed    → subtle green, "Listed"
```

---

## Empty States

Every table/list needs an empty state:

```
Cases table (no results):
  [search icon]
  No cases match your filters
  [ Clear filters ]

Jobs table (no failed jobs):
  [checkmark icon]
  No failed jobs — everything is running smoothly

Activity log (no activity yet):
  [clock icon]
  No activity yet. Start the scraper to see live events.
```

---

## Error States

```
API unreachable:
  Banner at top of page:
  "⚠️  Cannot connect to backend at localhost:8000 — is the server running?"

DB disconnected:
  Red dot on sidebar DB indicator
  Banner: "Database connection lost — scraping paused"

CAPTCHA failure spike:
  If >50% of last 100 jobs are CAPTCHA failures, show warning:
  "⚠️  High CAPTCHA failure rate — check your Anthropic API key in Settings"
```

---

## Responsive Behaviour

This is a local tool used on a laptop/desktop. Minimum supported width: 1024px.
No need for mobile responsiveness — it is a desktop dashboard.

---

## Build Instructions for Claude Code

1. Scaffold with: `npm create vite@latest frontend -- --template react`
2. Install: `npm install tailwindcss @tailwindcss/vite recharts axios react-router-dom lucide-react`
3. Set up Tailwind with the custom color palette defined above
4. Import fonts from Google Fonts: `IBM Plex Mono` + `DM Sans`
5. Build pages in this order:
   - Layout shell (Sidebar + topbar)
   - Dashboard page (most important, builds core components)
   - Cases page + CaseDrawer
   - Jobs page
   - Export page
   - Settings page
6. Wire up API client in `src/api/client.js` pointing to `http://localhost:8000`
7. Use mock data initially for all API calls so UI works without backend
8. The `usePolling` hook should call a function every N seconds and update state

---

## Mock Data (for development without backend)

Use this shape for mock stats while building:

```js
export const mockStats = {
  index: {
    listed: 2104500,
    total_estimated: 16962154,
    pending: 14857654,
    failed: 8234,
    running: 3,
    pct_complete: 12.4,
    speed_pages_per_min: 42,
    est_hours_remaining: 437
  },
  details: {
    fetched: 52000,
    listed_not_fetched: 2052500,
    failed: 1230,
    running: 0,
    pct_complete: 0.3
  },
  courts: [
    { name: "Bombay High Court",          listed: 1773285, details_fetched: 12000 },
    { name: "Allahabad High Court",        listed: 1708021, details_fetched: 8500  },
    { name: "High Court Punjab & Haryana", listed: 1698867, details_fetched: 9200  },
    { name: "Patna High Court",            listed: 1663514, details_fetched: 7100  },
    { name: "Madras High Court",           listed: 1611818, details_fetched: 11000 }
  ],
  scraper_status: "running",
  active_workers: 3
}
```
