# eCourts Scraper — Pages Spec (Cases, Jobs, Export, Settings)

This document contains the detailed visual specs for all pages except Dashboard.
Read FRONTEND_SPEC.md first for design system, colors, fonts, and component library.

The Dashboard is already built. Build these four pages next, in this order:
1. Cases + CaseDrawer
2. Jobs
3. Export
4. Settings

---

# PAGE 1 — Cases (/cases)

## What It Does
Search and browse all cases that have been listed so far.
Each row shows whether case details have been fetched.
Click a row to open a slide-in drawer with full case info.

## Full Page Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ SIDEBAR │  Cases                                    2,104,500 total  │
│         │  ─────────────────────────────────────────────────────── │
│         │                                                            │
│         │  ┌──────────────────────────────────────────────────────┐ │
│         │  │ 🔍  Search by CNR or party name...                   │ │
│         │  └──────────────────────────────────────────────────────┘ │
│         │                                                            │
│         │  ┌──────────────┐ ┌────────────┐ ┌────────┐ ┌────────┐  │
│         │  │ Court      ▼ │ │ Disposal ▼ │ │  From  │ │   To   │  │
│         │  └──────────────┘ └────────────┘ └────────┘ └────────┘  │
│         │                                                            │
│         │  Showing 1–50 of 2,104,500          [ ⬇ Export filtered ] │
│         │                                                            │
│         │  ┌─────┬──────────────┬──────────────────┬────────────┬──┐│
│         │  │     │ CNR          │ Title            │ Court      │..││
│         │  ├─────┼──────────────┼──────────────────┼────────────┼──┤│
│         │  │  1  │ APHC01046... │ Seenappa vs PRL  │ AP HC  [•] │..││
│         │  │  2  │ JKHC01002... │ Kefayat vs Union │ J&K HC [•] │..││
│         │  │  3  │ BHHC01001... │ Ram vs State     │ Bombay [•] │..││
│         │  │  4  │ MHCC00234... │ Singh vs Corp    │ Madras [•] │..││
│         │  │  5  │ PHHC00891... │ Sharma vs Punjab │ P&H HC [•] │..││
│         │  └─────┴──────────────┴──────────────────┴────────────┴──┘│
│         │                                                            │
│         │  ◀ Prev   Page 1 of 42,090   Next ▶                       │
└─────────┴────────────────────────────────────────────────────────────┘
```

## Search Bar
```jsx
// Full width, prominent input
// Placeholder: "Search by CNR or party name..."
// Has a search icon (lucide: Search) on the left inside the input
// Has a clear button (X) on right when text is typed
// Searches as you type with 400ms debounce
// Searches across: cnr, title fields
// Background: #1a1d27, border: #2a2d3a, focus border: #4f8ef7
```

## Filter Row
```jsx
// Four controls in a row, below the search bar
// Gap between them: 12px
// All same height (36px)

Court dropdown:
  - Default: "All Courts"
  - Options populated from courts list in mock data
  - Shows court name + count: "Bombay High Court (1,773,285)"

Disposal dropdown:
  - Default: "All Disposals"
  - Options: Disposed / Pending / Dismissed / Transferred

From date:
  - Label above: "Registered from"
  - Date input, placeholder: "YYYY-MM-DD"

To date:
  - Label above: "Registered to"  
  - Date input, placeholder: "YYYY-MM-DD"

// Active filters shown as dismissable pills below the row:
// [Bombay High Court ✕]  [Pending ✕]  [Clear all]
```

## Results Count Row
```jsx
// Left: "Showing 1–50 of 2,104,500 cases"
//   - numbers in IBM Plex Mono
//   - When filtered: "Showing 1–50 of 45,230 cases (filtered)"
// Right: "⬇ Export filtered" button (outline style)
//   - Clicking opens Export page with current filters pre-applied
```

## Cases Table

### Column Definitions
```
Col 1: #          Row number. Width: 48px. Muted color. Monospace.

Col 2: CNR        Width: 180px. IBM Plex Mono font. 
                  Truncate if too long, show full on hover tooltip.
                  Color: primary blue. Looks clickable.

Col 3: Title      Width: flex (takes remaining space).
                  Truncate at ~70 chars with ellipsis.
                  Full title on hover tooltip.
                  Two lines allowed if needed.

Col 4: Court      Width: 200px.
                  Small colored pill/badge.
                  Each court gets a consistent color (hash court name to color).
                  Show abbreviated name: "Bombay HC", "AP HC", "J&K HC" etc.

Col 5: Registered Width: 120px. IBM Plex Mono. Format: DD-MM-YYYY.
                  If null: show "—" in muted color.

Col 6: Decision   Width: 120px. IBM Plex Mono. Format: DD-MM-YYYY.
                  If null: show "—" in muted color.

Col 7: Disposal   Width: 160px.
                  Colored pill:
                    "Disposed"   → green pill
                    "Pending"    → amber pill  
                    "Dismissed"  → red pill
                    Other        → grey pill

Col 8: Details    Width: 130px. Center aligned.
                  ✅ Fetched     (green text, no background)
                  ⏳ Pending     (amber text)
                  ❌ Failed      (red text + small "Retry" link)
                  [ Fetch Now ]  (small blue outline button — for pending cases)
```

### Table Styling
```
Header row:
  background: #1a1d27
  border-bottom: 1px solid #2a2d3a
  text: UPPERCASE, 11px, letter-spacing: 0.08em, muted color
  sticky: true (stays at top when scrolling)
  height: 40px

Data rows:
  height: 52px
  border-bottom: 1px solid #2a2d3a (very subtle)
  background: transparent
  hover background: #1a1d27
  cursor: pointer
  transition: background 150ms

Selected row (when drawer is open):
  background: rgba(79, 142, 247, 0.08)
  left border: 2px solid #4f8ef7
```

### Pagination
```
// Centered below table
// Format: ◀  1  2  3  ... 42090  ▶
// Show: prev button, page numbers (max 5 visible), next button
// Current page highlighted with primary color
// Disabled prev on page 1, disabled next on last page
// Also show: "50 per page ▼" dropdown (options: 25, 50, 100)
```

## Case Drawer (slides in from right)

The drawer overlays the right side of the page. The table behind it dims slightly.

### Drawer Structure
```
┌────────────────────────────────────────────────────┐
│ APHC010460892016                              [ ✕ ] │  ← header (sticky)
│ Seenappa vs PRL Secretary, Animal Husbandry Dept    │
├────────────────────────────────────────────────────┤
│                                                     │
│  CASE INFORMATION                                   │
│  ─────────────────────────────────────────          │
│  Court          Andhra Pradesh High Court           │
│  Judge          Tarlada Rajasekhar Rao              │
│  Registered     18 Apr 2016                         │
│  Decision       01 Dec 2024                         │
│  Disposal       ● Disposed of No Costs              │
│                                                     │
│  ─────────────────────────────────────────          │
│                                                     │
│  CASE DETAILS                                       │
│  Status: ⏳ Not yet fetched                         │
│                                                     │
│  [ ▶ Fetch Details Now ]                            │
│                                                     │  
│  ─────────────────────────────────────────          │
│                                                     │
│  SNIPPET  ▼ (expandable)                            │
│  ANDHRA PRADESH AT AMARAVATHI MAIN CASE:            │
│  W.P.No.12923 of 2016...                            │
│                                                     │
└────────────────────────────────────────────────────┘
```

### Drawer — When Details Are Fetched
```
├────────────────────────────────────────────────────┤
│  CASE DETAILS                      ✅ Fetched       │
│  ─────────────────────────────────────────          │
│  Petitioner     M. Seenappa, Chittoor District      │
│  Respondent     PRL Secretary, Animal Husbandry     │
│  Case Type      Writ Petition (Civil)               │
│  Status         Disposed                            │
│  Next Hearing   —                                   │
│  Bench          Justice Tarlada Rajasekhar Rao      │
│                                                     │
│  CASE HISTORY                                       │
│  ─────────────────────────────────────────          │
│  01 Dec 2024   Final hearing — Disposed             │
│  15 Nov 2024   Hearing — Adjourned                  │
│  03 Oct 2024   Hearing — Part heard                 │
│  ... (show last 5, "View all X" link)               │
│                                                     │
│  ORDERS & JUDGMENTS                                 │
│  ─────────────────────────────────────────          │
│  📄 Order — 01 Dec 2024   [ View PDF ↗ ]           │
│  📄 Order — 15 Nov 2024   [ View PDF ↗ ]           │
│                                                     │
└────────────────────────────────────────────────────┘
```

### Drawer Specs
```
Width:          420px
Position:       fixed right-0, full height
Background:     #1a1d27
Border-left:    1px solid #2a2d3a
Shadow:         -8px 0 32px rgba(0,0,0,0.4)
Animation:      slides in from right (translateX 300ms ease-out)
Overlay:        when drawer open, rest of page has rgba(0,0,0,0.3) overlay

Header (sticky):
  padding: 20px 24px
  border-bottom: 1px solid #2a2d3a
  CNR: IBM Plex Mono, 14px, primary blue
  Title: DM Sans, 15px, primary text, mt-1
  Close button: top-right, X icon, 32px hit area

Body (scrollable):
  padding: 0 24px 24px

Section labels:
  UPPERCASE, 11px, letter-spacing 0.1em, muted color
  margin-bottom: 12px

Field rows:
  display: grid, 2 columns (label: 130px, value: rest)
  label: muted, 13px
  value: primary text, 13px
  row gap: 10px

Fetch button:
  full width, primary blue, height 36px
  "▶ Fetch Details Now"

History rows:
  monospace date | description
  font-size: 13px
  border-bottom: 1px solid #2a2d3a (subtle)

Order rows:
  📄 icon + "Order — DD MMM YYYY"  |  [ View PDF ↗ ] link
```

## Mock Data for Cases Page
```js
export const mockCases = [
  {
    id: 1,
    cnr: "APHC010460892016",
    title: "M. Seenappa, Chittoor Dist vs PRL Secretary, Animal Husbandry",
    court: "Andhra Pradesh High Court",
    judge: "Tarlada Rajasekhar Rao",
    date_registered: "2016-04-18",
    date_decision: "2024-12-01",
    disposal_nature: "Disposed of No Costs",
    listed: true,
    detail_status: "done",
    petitioner: "M. Seenappa, Chittoor District",
    respondent: "PRL Secretary, Animal Husbandry Dept",
    case_type: "Writ Petition (Civil)",
    next_hearing: null,
    bench: "Justice Tarlada Rajasekhar Rao",
    case_history: [
      { date: "2024-12-01", event: "Final hearing — Disposed" },
      { date: "2024-11-15", event: "Hearing — Adjourned" },
      { date: "2024-10-03", event: "Hearing — Part heard" }
    ],
    orders: [
      { date: "2024-12-01", pdf_url: "#" },
      { date: "2024-11-15", pdf_url: "#" }
    ]
  },
  {
    id: 2,
    cnr: "JKHC010028062023",
    title: "Kefayat Ahmad Sofi vs Union Territory of J&K and Others (Revenue Department)",
    court: "High Court of Jammu and Kashmir",
    judge: "Justice Rajnesh Oswal",
    date_registered: "2023-06-12",
    date_decision: null,
    disposal_nature: "Pending",
    listed: true,
    detail_status: "pending",
    petitioner: null, respondent: null, case_type: null,
    next_hearing: null, bench: null, case_history: [], orders: []
  },
  {
    id: 3,
    cnr: "BHHC010012342021",
    title: "Ramesh Kumar vs State of Bihar and Ors.",
    court: "Patna High Court",
    judge: "Justice A.K. Singh",
    date_registered: "2021-03-22",
    date_decision: null,
    disposal_nature: "Pending",
    listed: true,
    detail_status: "failed",
    petitioner: null, respondent: null, case_type: null,
    next_hearing: "2025-03-18", bench: null, case_history: [], orders: []
  },
  {
    id: 4,
    cnr: "MHCC002341112019",
    title: "Singh Enterprises vs Municipal Corporation of Greater Mumbai",
    court: "Bombay High Court",
    judge: "Justice P.B. Varale",
    date_registered: "2019-11-11",
    date_decision: "2023-08-14",
    disposal_nature: "Disposed",
    listed: true,
    detail_status: "done",
    petitioner: "Singh Enterprises Pvt Ltd",
    respondent: "Municipal Corporation of Greater Mumbai",
    case_type: "Commercial Suit",
    next_hearing: null,
    bench: "Justice P.B. Varale, Justice M.M. Sathaye",
    case_history: [
      { date: "2023-08-14", event: "Judgment pronounced — Disposed" },
      { date: "2023-07-28", event: "Arguments concluded" }
    ],
    orders: [{ date: "2023-08-14", pdf_url: "#" }]
  },
  {
    id: 5,
    cnr: "PHHC008912342020",
    title: "Sharma vs State of Punjab — Land Acquisition Matter",
    court: "High Court of Punjab and Haryana",
    judge: "Justice G.S. Sandhawalia",
    date_registered: "2020-07-05",
    date_decision: null,
    disposal_nature: "Pending",
    listed: true,
    detail_status: "pending",
    petitioner: null, respondent: null, case_type: null,
    next_hearing: "2025-04-02", bench: null, case_history: [], orders: []
  }
]
```

---

# PAGE 2 — Jobs (/jobs)

## What It Does
Shows every individual scrape job. Two modes: Index Jobs (listing pages) and Detail Jobs (case detail pages). Lets you understand failures and retry them.

## Full Page Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ SIDEBAR │  Jobs                                                       │
│         │  ─────────────────────────────────────────────────────── │
│         │                                                            │
│         │  ┌─────────────────────┐  ┌──────────────────────────┐   │
│         │  │  Index Jobs  (1.7M) │  │  Detail Jobs  (2.1M)     │   │
│         │  └─────────────────────┘  └──────────────────────────┘   │
│         │                                                            │
│         │  [ All ] [ Pending ] [ Running ] [ Done ] [ Failed 8,234 ]│
│         │                                                            │
│         │  ┌────────────────────────────────────────────────────┐   │
│         │  │ ⚠️  8,234 failed jobs                               │   │
│         │  │                                                     │   │
│         │  │  CAPTCHA errors   ████████████  6,102  (74%)       │   │
│         │  │  Timeout errors   ████           1,544  (19%)       │   │
│         │  │  Other               588   ( 7%)                    │   │
│         │  │                                                     │   │
│         │  │  [ ↻ Retry All ]  [ Retry CAPTCHAs ]  [ Retry Timeouts ]│
│         │  └────────────────────────────────────────────────────┘   │
│         │                                                            │
│         │  Showing 1–50 of 8,234 failed jobs                        │
│         │                                                            │
│         │  ┌────────┬──────────┬───────┬──────────┬─────────────┐  │
│         │  │ Page # │ Status   │ Cases │ Attempts │ Error       │  │
│         │  ├────────┼──────────┼───────┼──────────┼─────────────┤  │
│         │  │ 45,229 │ ❌ Failed│   0   │    3     │ CAPTCHA ... │  │
│         │  │ 44,891 │ ❌ Failed│   0   │    3     │ Timeout...  │  │
│         │  │ 43,102 │ ❌ Failed│   0   │    2     │ CAPTCHA ... │  │
│         │  └────────┴──────────┴───────┴──────────┴─────────────┘  │
│         │                                                            │
│         │  ◀ Prev   Page 1 of 165   Next ▶                          │
└─────────┴────────────────────────────────────────────────────────────┘
```

## Mode Tabs
```jsx
// Two tabs at the top — Index Jobs and Detail Jobs
// Shows count in parentheses for each
// Active tab: white text, bottom border in primary blue
// Inactive tab: muted text

Tab 1: Index Jobs     → shows scrape_jobs table (listing pages)
Tab 2: Detail Jobs    → shows detail_jobs table (case detail pages)
```

## Status Filter Tabs
```jsx
// Pill-style filter buttons in a row
// [ All ] [ Pending ] [ Running ] [ Done ] [ Failed ]
// Failed shows the count as a red badge: [ Failed 8,234 ]
// Active filter: solid primary color background
// Default: show Failed when there are failed jobs, else All
```

## Failed Jobs Summary Banner
```jsx
// Only shown when "Failed" filter is active AND there are failed jobs
// Background: rgba(239, 68, 68, 0.08) — very subtle red tint
// Border: 1px solid rgba(239, 68, 68, 0.2)
// Border-radius: 8px
// Padding: 20px

Header: "⚠️ 8,234 failed jobs need attention"

Error breakdown — three rows, each with:
  - Error type label (e.g. "CAPTCHA errors")
  - Mini bar (proportional width, colored)
  - Count + percentage
  - Individual Retry button for that error type

Buttons row:
  [ ↻ Retry All Failed ]     — primary button, retries all
  [ Retry CAPTCHAs Only ]    — outline button
  [ Retry Timeouts Only ]    — outline button

After clicking retry:
  - Button shows spinner + "Retrying..."
  - Banner updates to show 0 failed of that type
```

## Jobs Table — Index Jobs

### Columns
```
Page #      Width: 100px. IBM Plex Mono. Right-aligned number.
            Format: 45,229  (comma separated)

Status      Width: 120px.
            ● Running   — pulsing blue dot
            ✅ Done     — green text
            ❌ Failed   — red text
            ⏳ Pending  — amber text

Cases Found Width: 100px. Center. IBM Plex Mono.
            If failed/pending: "—"
            If done: number (e.g. 10)

Attempts    Width: 90px. Center. IBM Plex Mono.
            Color: green if 1, amber if 2, red if 3+

Duration    Width: 100px. IBM Plex Mono.
            Format: "4.2s" or "—"

Error       Width: flex.
            Truncated to ~60 chars.
            Full error on hover (tooltip).
            Color: red/muted
            If no error: "—"
```

### Row Styling
```
Same as Cases table — subtle hover, 48px height, monospace numbers
No click action on rows (no drawer needed here)
```

## Jobs Table — Detail Jobs

### Columns
```
CNR         Width: 180px. IBM Plex Mono. Primary blue. 
            (same style as Cases table)

Court       Width: 180px. Small pill badge.

Status      Width: 120px. Same pills as above.

Attempts    Width: 90px. Center. Colored by count.

Duration    Width: 100px. IBM Plex Mono.

Error       Width: flex. Truncated. Tooltip.
```

## Mock Data for Jobs Page
```js
export const mockIndexJobs = [
  { page_number: 45231, status: "done",    cases_found: 10, attempts: 1, error: null,                          duration_ms: 4200  },
  { page_number: 45230, status: "done",    cases_found: 9,  attempts: 1, error: null,                          duration_ms: 3800  },
  { page_number: 45229, status: "failed",  cases_found: 0,  attempts: 3, error: "CAPTCHA solve failed after 3 retries — Claude returned empty string", duration_ms: 12000 },
  { page_number: 45228, status: "running", cases_found: 0,  attempts: 1, error: null,                          duration_ms: null  },
  { page_number: 45227, status: "done",    cases_found: 10, attempts: 1, error: null,                          duration_ms: 3500  },
  { page_number: 44891, status: "failed",  cases_found: 0,  attempts: 3, error: "Navigation timeout after 30000ms — site did not respond", duration_ms: 30000 },
  { page_number: 43102, status: "failed",  cases_found: 0,  attempts: 2, error: "CAPTCHA solve failed — image could not be read",           duration_ms: 8000  },
  { page_number: 12000, status: "pending", cases_found: 0,  attempts: 0, error: null,                          duration_ms: null  },
]

export const mockJobSummary = {
  total_failed: 8234,
  error_breakdown: [
    { type: "captcha",  label: "CAPTCHA errors",  count: 6102, pct: 74 },
    { type: "timeout",  label: "Timeout errors",  count: 1544, pct: 19 },
    { type: "other",    label: "Other errors",    count: 588,  pct: 7  },
  ]
}
```

---

# PAGE 3 — Export (/export)

## What It Does
Configure and download a subset of the scraped dataset.
Choose scope (all/filtered), format (CSV/JSON/JSONL), and which fields to include.

## Full Page Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ SIDEBAR │  Export Data                                                │
│         │  ─────────────────────────────────────────────────────── │
│         │                                                            │
│         │  ┌──────────────────────────────────────────────────────┐ │
│         │  │  SCOPE                                                │ │
│         │  │  What data do you want to export?                     │ │
│         │  │                                                       │ │
│         │  │  ◉ All cases               2,104,500 cases           │ │
│         │  │  ○ By court                [ Select court... ▼ ]     │ │
│         │  │  ○ By date range           [From] — [To]             │ │
│         │  │  ○ Details fetched only    52,000 cases              │ │
│         │  └──────────────────────────────────────────────────────┘ │
│         │                                                            │
│         │  ┌──────────────────────────────────────────────────────┐ │
│         │  │  FORMAT                                               │ │
│         │  │                                                       │ │
│         │  │  ◉ CSV         Spreadsheet-compatible, opens in Excel │ │
│         │  │  ○ JSON        Nested structure, good for developers  │ │
│         │  │  ○ JSON Lines  One record per line, best for large    │ │
│         │  │                files (>500k rows)                     │ │
│         │  └──────────────────────────────────────────────────────┘ │
│         │                                                            │
│         │  ┌──────────────────────────────────────────────────────┐ │
│         │  │  FIELDS                                               │ │
│         │  │  Choose which fields to include                       │ │
│         │  │                                                       │ │
│         │  │  LISTING DATA (always available)                      │ │
│         │  │  ☑ CNR number    ☑ Case title   ☑ Court              │ │
│         │  │  ☑ Judge         ☑ Date registered ☑ Date decision   │ │
│         │  │  ☑ Disposal      ☐ Snippet text                      │ │
│         │  │                                                       │ │
│         │  │  DETAILS DATA (only for cases where fetched)          │ │
│         │  │  ☐ Petitioner    ☐ Respondent   ☐ Case type          │ │
│         │  │  ☐ Next hearing  ☐ Bench        ☐ Case history       │ │
│         │  │  ☐ Orders list                                        │ │
│         │  │                                                       │ │
│         │  │  Note: Detail fields will be empty for cases          │ │
│         │  │  where details have not been fetched yet.             │ │
│         │  └──────────────────────────────────────────────────────┘ │
│         │                                                            │
│         │  ┌──────────────────────────────────────────────────────┐ │
│         │  │  PREVIEW                                              │ │
│         │  │                                                       │ │
│         │  │  Estimated rows:    2,104,500                         │ │
│         │  │  Estimated size:    ~320 MB                           │ │
│         │  │  Fields included:   7                                 │ │
│         │  │                                                       │ │
│         │  │  ┌──────────────────────────────────────────────┐    │ │
│         │  │  │ cnr,title,court,judge,date_registered,date... │    │ │
│         │  │  │ APHC010460892016,"Seenappa vs PRL Secy",...   │    │ │
│         │  │  │ JKHC010028062023,"Kefayat Ahmad Sofi vs",...  │    │ │
│         │  │  └──────────────────────────────────────────────┘    │ │
│         │  │                                     (preview only)    │ │
│         │  └──────────────────────────────────────────────────────┘ │
│         │                                                            │
│         │                          [ ⬇ Download Export ]            │
└─────────┴────────────────────────────────────────────────────────────┘
```

## Sections

### SCOPE Section
```jsx
// Card with light border, padding 24px
// Section title: "SCOPE" — uppercase, muted, 11px
// Subtitle: "What data do you want to export?"

Radio options:
  1. "All cases"
     Right side: "2,104,500 cases" in muted monospace
  
  2. "By court"
     When selected: shows court dropdown inline on same row
     Dropdown options: all courts with counts
  
  3. "By date range"
     When selected: shows two date inputs (From, To) inline
  
  4. "Details fetched only"
     Right side: "52,000 cases" in muted monospace
     Subtitle below: "Only cases where full details have been scraped"
```

### FORMAT Section
```jsx
// Card with light border, padding 24px
// Each option is a radio with label + description on right

CSV:        "Spreadsheet-compatible, opens in Excel or Google Sheets"
JSON:       "Nested structure, best for developers and APIs"
JSON Lines: "One record per line — best for files over 500k rows"
```

### FIELDS Section
```jsx
// Card with light border, padding 24px
// Two groups: "LISTING DATA" and "DETAILS DATA"
// Group label: uppercase 11px muted

// Checkboxes in a 3-column grid
// Listing data checkboxes: always enabled
// Details data checkboxes: slightly muted, with note below

// "Select All" and "Clear All" links on the right of each group header
```

### PREVIEW Section
```jsx
// Card with light border, padding 24px
// Shows three key numbers:
//   Estimated rows (updates live as scope changes)
//   Estimated size (rough: rows × 160 bytes for CSV)
//   Fields included count

// CSV preview box:
//   Dark background (#0f1117)
//   Monospace font, 12px
//   Shows header row + 2 sample data rows
//   Truncated to fit — not scrollable
//   Label: "(first 2 rows preview)"
//   Updates live as fields are toggled

// Size estimate logic:
//   CSV: rows × 160 bytes
//   JSON: rows × 280 bytes  
//   JSONL: rows × 260 bytes
//   Format as: "~320 MB" or "~1.2 GB"
```

### Download Button
```jsx
// Full width, height 48px, primary blue
// Icon: Download (lucide)
// Text: "⬇ Download Export"
// When clicked:
//   1. Button shows spinner + "Preparing export..."
//   2. POST to /api/export
//   3. Browser triggers file download
//   4. Button resets after 2 seconds
//   5. If backend not connected: show error toast "Backend not connected — export unavailable"
```

---

# PAGE 4 — Settings (/settings)

## What It Does
Configure the scraper, manage API keys and DB connection.

## Full Page Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│ SIDEBAR │  Settings                                                   │
│         │  ─────────────────────────────────────────────────────── │
│         │                                                            │
│         │  ┌──────────────────────────────────────────────────────┐ │
│         │  │  SCRAPER                                              │ │
│         │  │                                                       │ │
│         │  │  Workers           ○──────●──────────────○   3       │ │
│         │  │                    1                     10          │ │
│         │  │                                                       │ │
│         │  │  Request delay     [ 2000          ]  ms             │ │
│         │  │  (between pages)   Recommended: 2000ms minimum       │ │
│         │  │                                                       │ │
│         │  │  Max retries       [ 3             ]                  │ │
│         │  │                                                       │ │
│         │  │  Headless browser  [●──] On                          │ │
│         │  │                    Turn off to watch browser scrape   │ │
│         │  └──────────────────────────────────────────────────────┘ │
│         │                                                            │
│         │  ┌──────────────────────────────────────────────────────┐ │
│         │  │  API KEYS                                             │ │
│         │  │                                                       │ │
│         │  │  Anthropic API Key                                    │ │
│         │  │  Used for solving CAPTCHAs via Claude Vision (Haiku)  │ │
│         │  │                                                       │ │
│         │  │  [ sk-ant-•••••••••••••••••••••••  ] [ Test ]        │ │
│         │  │                                                       │ │
│         │  │  ✅ Valid — Claude Haiku responding  (~$0.0003/solve) │ │
│         │  └──────────────────────────────────────────────────────┘ │
│         │                                                            │
│         │  ┌──────────────────────────────────────────────────────┐ │
│         │  │  DATABASE                                             │ │
│         │  │                                                       │ │
│         │  │  Connection string                                    │ │
│         │  │  [ postgresql://localhost:5432/ecourts       ]        │ │
│         │  │                                                       │ │
│         │  │  [ Test Connection ]                                  │ │
│         │  │  ✅ Connected — 2,104,500 rows — 1.2 GB              │ │
│         │  │                                                       │ │
│         │  │  [ Migrate to Cloud... ]                              │ │
│         │  └──────────────────────────────────────────────────────┘ │
│         │                                                            │
│         │  ┌──────────────────────────────────────────────────────┐ │
│         │  │  DANGER ZONE                                          │ │
│         │  │  ────────────────────────────────────────────────    │ │
│         │  │  Reset All Failed Jobs                                │ │
│         │  │  Moves all failed jobs back to pending                │ │
│         │  │                              [ Reset Failed Jobs ]    │ │
│         │  │                                                       │ │
│         │  │  Clear Activity Log                                   │ │
│         │  │  Deletes all activity log entries                     │ │
│         │  │                              [ Clear Activity Log ]   │ │
│         │  └──────────────────────────────────────────────────────┘ │
│         │                                                            │
│         │                              [ 💾 Save Settings ]         │
└─────────┴────────────────────────────────────────────────────────────┘
```

## Sections

### SCRAPER Section
```jsx
Workers slider:
  - Range: 1 to 10
  - Shows current value as large number to the right
  - Thumb: white circle
  - Track filled: primary blue
  - Below: helper text changes based on value:
      1–2:  "Conservative — good for avoiding rate limits"
      3–5:  "Balanced — recommended"
      6–10: "Aggressive — monitor for blocks"

Request delay input:
  - Number input, min: 500, max: 10000
  - Unit label "ms" to the right
  - Below: "Recommended: 2000ms minimum for government portals"
  - If value < 1000: shows warning "⚠️ Too low — risk of IP block"

Max retries input:
  - Number input, min: 1, max: 10
  - Below: "Jobs failing more than this are marked as failed"

Headless toggle:
  - Toggle switch (on/off)
  - When OFF: shows note "Browser window will open — slower but easier to debug"
```

### API KEYS Section
```jsx
Anthropic API Key:
  - Password input (text hidden, show/hide toggle button)
  - Placeholder: "sk-ant-..."
  - [ Test ] button next to input
  
  When Test is clicked:
    - Button shows spinner
    - Makes mock API call
    - Shows result below input:
      SUCCESS: "✅ Valid — Claude Haiku responding  (~$0.0003/solve)"
      FAILURE: "❌ Invalid key — check your key at console.anthropic.com"
  
  Cost note below:
    "At current scraping rate, CAPTCHA solving costs ~$0.35 per 1,000 pages"
```

### DATABASE Section
```jsx
Connection string input:
  - Full width text input
  - Default: "postgresql://localhost:5432/ecourts"
  - Monospace font

[ Test Connection ] button:
  - Outline style
  - When clicked:
    SUCCESS: "✅ Connected — 2,104,500 cases — 1.2 GB"
    FAILURE: "❌ Cannot connect — is PostgreSQL running?"

[ Migrate to Cloud... ] button:
  - Opens a modal with step-by-step instructions:
    
    ┌────────────────────────────────────────┐
    │  Migrate to Cloud                  [✕] │
    ├────────────────────────────────────────┤
    │  Step 1: Create a cloud database       │
    │  Recommended: Supabase (free tier)     │
    │  → supabase.com/dashboard/new          │
    │                                        │
    │  Step 2: Get your connection string    │
    │  Settings → Database → Connection URI  │
    │                                        │
    │  Step 3: Paste it below and test       │
    │  [ postgresql://user:pass@host/db ]    │
    │  [ Test New Connection ]               │
    │                                        │
    │  Step 4: Migrate data                  │
    │  [ Start Migration ]                   │
    │  This will copy all data to cloud DB.  │
    │  Your local DB remains unchanged.      │
    └────────────────────────────────────────┘
```

### DANGER ZONE Section
```jsx
// Red-tinted border around section: 1px solid rgba(239,68,68,0.3)
// Section label "DANGER ZONE" in red

Each action:
  - Left: action name (bold) + description (muted, smaller)
  - Right: action button (outline red style)
  
  On click → confirm dialog:
    "Are you sure? This cannot be undone."
    [ Cancel ]  [ Confirm ]
```

### Save Button
```jsx
// Sticky at bottom of page
// Full width, primary blue, height 48px
// "💾 Save Settings"
// When saved: brief success toast "Settings saved"
// Settings persist between page refreshes (stored in localStorage 
// until backend is connected, then POST to /api/settings)
```

## Mock Data for Settings
```js
export const mockSettings = {
  workers: 3,
  delay_ms: 2000,
  max_retries: 3,
  headless: true,
  anthropic_api_key: "sk-ant-••••••••••••••••••••••••",
  db_url: "postgresql://localhost:5432/ecourts",
  db_stats: {
    connected: true,
    row_count: 2104500,
    size_gb: 1.2
  },
  api_key_valid: true
}
```

---

# SHARED COMPONENTS (build once, use everywhere)

## Toast Notifications
```jsx
// Appears in bottom-right corner
// Slides up, auto-dismisses after 3 seconds
// Types:
//   success: green border, checkmark icon
//   error:   red border, X icon
//   warning: amber border, warning icon
//   info:    blue border, info icon
//
// Example usages:
//   showToast("Settings saved", "success")
//   showToast("Backend not connected", "error")
//   showToast("8,234 jobs queued for retry", "info")
```

## Confirm Dialog
```jsx
// Modal overlay
// Props: title, message, onConfirm, onCancel
// Confirm button: red for dangerous actions, primary for normal
// Cancel button: outline
```

## Loading States
```jsx
// Every button that triggers an async action needs a loading state:
//   - Spinner replaces icon
//   - Text changes: "Retrying..." / "Testing..." / "Saving..."
//   - Button disabled while loading
//
// Tables while loading: show 5 skeleton rows (pulsing grey bars)
```

## Empty States (for every table/list)
```jsx
// Cases table, no results:
//   Large: 🔍 icon
//   "No cases match your filters"
//   [ Clear all filters ] link

// Jobs table, no failed jobs:
//   Large: ✅ icon  
//   "No failed jobs"
//   "Everything is running smoothly"

// Jobs table, no jobs at all:
//   Large: ⚙️ icon
//   "No jobs yet"
//   "Run python cli.py init to create scrape jobs"
```

---

# ROUTING (App.jsx)

```jsx
// React Router v6 routes:
<Route path="/"         element={<Dashboard />} />
<Route path="/cases"    element={<Cases />} />
<Route path="/jobs"     element={<Jobs />} />
<Route path="/export"   element={<Export />} />
<Route path="/settings" element={<Settings />} />

// Active route highlighted in Sidebar nav
// Page title updates in browser tab: "Dashboard — eCourts" etc.
```

---

# BUILD ORDER FOR CLAUDE CODE

1. First: make sure Layout.jsx (sidebar + topbar) is complete and working
2. Cases.jsx — table, filters, pagination (use mockCases)
3. CaseDrawer.jsx — slide-in panel (use same mockCases data)
4. Jobs.jsx — tabs, summary banner, table (use mockIndexJobs)
5. Export.jsx — form, live preview, download button
6. Settings.jsx — all four sections, save button
7. Shared: Toast, ConfirmDialog, loading/empty states
8. Wire routing in App.jsx, confirm active nav highlighting works
9. Test all pages with mock data, check empty states and error states
