import axios from 'axios'

const API_BASE = 'http://localhost:8000'

// Mock data for development without backend
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
    pct_complete: 2.5
  },
  courts: [
    { name: "Bombay High Court", listed: 1773285, details_fetched: 12000 },
    { name: "Allahabad High Court", listed: 1708021, details_fetched: 8500 },
    { name: "High Court Punjab & Haryana", listed: 1698867, details_fetched: 9200 },
    { name: "Patna High Court", listed: 1663514, details_fetched: 7100 },
    { name: "Madras High Court", listed: 1611818, details_fetched: 11000 },
    { name: "Calcutta High Court", listed: 1423567, details_fetched: 6200 },
    { name: "Karnataka High Court", listed: 1298456, details_fetched: 5800 },
    { name: "Gujarat High Court", listed: 1156789, details_fetched: 4300 }
  ],
  scraper_status: "running",
  active_workers: 3
}

export const mockActivity = {
  events: [
    { id: 1, timestamp: "2024-03-15T14:32:11Z", type: "listed", message: "Listed 10 cases — page 45,231", page_number: 45231, cnr: null },
    { id: 2, timestamp: "2024-03-15T14:32:09Z", type: "detail_fetched", message: "Fetched details for APHC010460892016", page_number: null, cnr: "APHC010460892016" },
    { id: 3, timestamp: "2024-03-15T14:32:05Z", type: "listed", message: "Listed 10 cases — page 45,230", page_number: 45230, cnr: null },
    { id: 4, timestamp: "2024-03-15T14:32:02Z", type: "failed", message: "CAPTCHA failed — page 45,198 (retry 2/3)", page_number: 45198, cnr: null },
    { id: 5, timestamp: "2024-03-15T14:31:58Z", type: "listed", message: "Listed 10 cases — page 45,229", page_number: 45229, cnr: null },
    { id: 6, timestamp: "2024-03-15T14:31:54Z", type: "detail_fetched", message: "Fetched details for MHHC020567892018", page_number: null, cnr: "MHHC020567892018" },
    { id: 7, timestamp: "2024-03-15T14:31:50Z", type: "listed", message: "Listed 10 cases — page 45,228", page_number: 45228, cnr: null },
    { id: 8, timestamp: "2024-03-15T14:31:46Z", type: "listed", message: "Listed 10 cases — page 45,227", page_number: 45227, cnr: null },
    { id: 9, timestamp: "2024-03-15T14:31:42Z", type: "detail_fetched", message: "Fetched details for DLHC030789102020", page_number: null, cnr: "DLHC030789102020" },
    { id: 10, timestamp: "2024-03-15T14:31:38Z", type: "failed", message: "Timeout — page 45,156", page_number: 45156, cnr: null },
    { id: 11, timestamp: "2024-03-15T14:31:34Z", type: "listed", message: "Listed 10 cases — page 45,226", page_number: 45226, cnr: null },
    { id: 12, timestamp: "2024-03-15T14:31:30Z", type: "listed", message: "Listed 10 cases — page 45,225", page_number: 45225, cnr: null },
  ]
}

export const mockCases = {
  total: 2104500,
  page: 1,
  pages: 42090,
  cases: [
    {
      id: 1, cnr: "APHC010460892016", title: "M. Seenappa, Chittoor Dist vs PRL Secretary, Animal Husbandry",
      court: "Andhra Pradesh High Court", judge: "Tarlada Rajasekhar Rao",
      date_registered: "2016-04-18", date_decision: "2024-12-01",
      disposal_nature: "Disposed of No Costs", listed: true, detail_status: "done",
      petitioner: "M. Seenappa, Chittoor District", respondent: "PRL Secretary, Animal Husbandry Dept",
      case_type: "Writ Petition (Civil)", next_hearing: null, bench: "Justice Tarlada Rajasekhar Rao",
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
      id: 2, cnr: "JKHC010028062023", title: "Kefayat Ahmad Sofi vs Union Territory of J&K and Others (Revenue Department)",
      court: "High Court of Jammu and Kashmir", judge: "Justice Rajnesh Oswal",
      date_registered: "2023-06-12", date_decision: null,
      disposal_nature: "Pending", listed: true, detail_status: "pending",
      petitioner: null, respondent: null, case_type: null,
      next_hearing: null, bench: null, case_history: [], orders: []
    },
    {
      id: 3, cnr: "BHHC010012342021", title: "Ramesh Kumar vs State of Bihar and Ors.",
      court: "Patna High Court", judge: "Justice A.K. Singh",
      date_registered: "2021-03-22", date_decision: null,
      disposal_nature: "Pending", listed: true, detail_status: "failed",
      petitioner: null, respondent: null, case_type: null,
      next_hearing: "2025-03-18", bench: null, case_history: [], orders: []
    },
    {
      id: 4, cnr: "MHCC002341112019", title: "Singh Enterprises vs Municipal Corporation of Greater Mumbai",
      court: "Bombay High Court", judge: "Justice P.B. Varale",
      date_registered: "2019-11-11", date_decision: "2023-08-14",
      disposal_nature: "Disposed", listed: true, detail_status: "done",
      petitioner: "Singh Enterprises Pvt Ltd", respondent: "Municipal Corporation of Greater Mumbai",
      case_type: "Commercial Suit", next_hearing: null, bench: "Justice P.B. Varale, Justice M.M. Sathaye",
      case_history: [
        { date: "2023-08-14", event: "Judgment pronounced — Disposed" },
        { date: "2023-07-28", event: "Arguments concluded" }
      ],
      orders: [{ date: "2023-08-14", pdf_url: "#" }]
    },
    {
      id: 5, cnr: "PHHC008912342020", title: "Sharma vs State of Punjab — Land Acquisition Matter",
      court: "High Court of Punjab and Haryana", judge: "Justice G.S. Sandhawalia",
      date_registered: "2020-07-05", date_decision: null,
      disposal_nature: "Pending", listed: true, detail_status: "pending",
      petitioner: null, respondent: null, case_type: null,
      next_hearing: "2025-04-02", bench: null, case_history: [], orders: []
    }
  ]
}

export const mockIndexJobs = [
  { page_number: 45231, status: "done",    cases_found: 10, attempts: 1, error: null,                                                                  duration_ms: 4200  },
  { page_number: 45230, status: "done",    cases_found: 9,  attempts: 1, error: null,                                                                  duration_ms: 3800  },
  { page_number: 45229, status: "failed",  cases_found: 0,  attempts: 3, error: "CAPTCHA solve failed after 3 retries — Claude returned empty string",  duration_ms: 12000 },
  { page_number: 45228, status: "running", cases_found: 0,  attempts: 1, error: null,                                                                  duration_ms: null  },
  { page_number: 45227, status: "done",    cases_found: 10, attempts: 1, error: null,                                                                  duration_ms: 3500  },
  { page_number: 44891, status: "failed",  cases_found: 0,  attempts: 3, error: "Navigation timeout after 30000ms — site did not respond",              duration_ms: 30000 },
  { page_number: 43102, status: "failed",  cases_found: 0,  attempts: 2, error: "CAPTCHA solve failed — image could not be read",                       duration_ms: 8000  },
  { page_number: 12000, status: "pending", cases_found: 0,  attempts: 0, error: null,                                                                  duration_ms: null  },
]

export const mockDetailJobs = [
  { cnr: "APHC010460892016", court: "Andhra Pradesh High Court", status: "done",    attempts: 1, error: null,                                     duration_ms: 5200  },
  { cnr: "JKHC010028062023", court: "High Court of Jammu and Kashmir", status: "pending", attempts: 0, error: null,                               duration_ms: null  },
  { cnr: "BHHC010012342021", court: "Patna High Court",         status: "failed",  attempts: 3, error: "CAPTCHA solve failed after 3 retries",    duration_ms: 15000 },
  { cnr: "MHCC002341112019", court: "Bombay High Court",        status: "done",    attempts: 1, error: null,                                     duration_ms: 4800  },
  { cnr: "PHHC008912342020", court: "High Court of Punjab and Haryana", status: "running", attempts: 1, error: null,                              duration_ms: null  },
]

export const mockJobSummary = {
  total_failed: 8234,
  error_breakdown: [
    { type: "captcha",  label: "CAPTCHA errors",  count: 6102, pct: 74 },
    { type: "timeout",  label: "Timeout errors",  count: 1544, pct: 19 },
    { type: "other",    label: "Other errors",    count: 588,  pct: 7  },
  ]
}

// Live count mock data — Judgments portal total vs our database
export const mockLiveCount = {
  ecourts_total: 16962154,
  last_checked: "2024-03-15T14:32:11Z",
  pipeline: {
    listed:      2104500,
    scraped:     52000,
    cleaned:     48200,
    structured:  45000,
    rag:         41500,
  },
  status: "stale",
  error: null,
}

export const mockLiveCountHistory = [
  { date: "2024-02-15", ecourts: 16820000, ours: 1620000 },
  { date: "2024-02-16", ecourts: 16824500, ours: 1635000 },
  { date: "2024-02-17", ecourts: 16828200, ours: 1652000 },
  { date: "2024-02-18", ecourts: 16832100, ours: 1668000 },
  { date: "2024-02-19", ecourts: 16836400, ours: 1685000 },
  { date: "2024-02-20", ecourts: 16840800, ours: 1700000 },
  { date: "2024-02-21", ecourts: 16845100, ours: 1718000 },
  { date: "2024-02-22", ecourts: 16849500, ours: 1735000 },
  { date: "2024-02-23", ecourts: 16853800, ours: 1752000 },
  { date: "2024-02-24", ecourts: 16858200, ours: 1770000 },
  { date: "2024-02-25", ecourts: 16862500, ours: 1788000 },
  { date: "2024-02-26", ecourts: 16867000, ours: 1805000 },
  { date: "2024-02-27", ecourts: 16871200, ours: 1822000 },
  { date: "2024-02-28", ecourts: 16875800, ours: 1840000 },
  { date: "2024-02-29", ecourts: 16880100, ours: 1858000 },
  { date: "2024-03-01", ecourts: 16884500, ours: 1875000 },
  { date: "2024-03-02", ecourts: 16889000, ours: 1892000 },
  { date: "2024-03-03", ecourts: 16893200, ours: 1910000 },
  { date: "2024-03-04", ecourts: 16897800, ours: 1925000 },
  { date: "2024-03-05", ecourts: 16902100, ours: 1940000 },
  { date: "2024-03-06", ecourts: 16906500, ours: 1952000 },
  { date: "2024-03-07", ecourts: 16911000, ours: 1960000 },
  { date: "2024-03-08", ecourts: 16915800, ours: 1970000 },
  { date: "2024-03-09", ecourts: 16940200, ours: 1980000 },
  { date: "2024-03-10", ecourts: 16943800, ours: 2005000 },
  { date: "2024-03-11", ecourts: 16947500, ours: 2028000 },
  { date: "2024-03-12", ecourts: 16950100, ours: 2048000 },
  { date: "2024-03-13", ecourts: 16954300, ours: 2068000 },
  { date: "2024-03-14", ecourts: 16958600, ours: 2088000 },
  { date: "2024-03-15", ecourts: 16962154, ours: 2104500 },
]

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

// Use mock data flag
const USE_MOCK = true

const client = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
})

// API functions
export async function getStats() {
  if (USE_MOCK) return mockStats
  const response = await client.get('/api/stats')
  return response.data
}

export async function getActivity(limit = 20) {
  if (USE_MOCK) return mockActivity
  const response = await client.get(`/api/activity?limit=${limit}`)
  return response.data
}

export async function startScraper(workers = 3, mode = 'index') {
  if (USE_MOCK) return { success: true }
  const response = await client.post('/api/scraper/start', { workers, mode })
  return response.data
}

export async function pauseScraper() {
  if (USE_MOCK) return { success: true }
  const response = await client.post('/api/scraper/pause')
  return response.data
}

export async function retryFailed(mode = 'index') {
  if (USE_MOCK) return { success: true }
  const response = await client.post('/api/scraper/retry-failed', { mode })
  return response.data
}

export async function getCases(params = {}) {
  if (USE_MOCK) return mockCases
  const response = await client.get('/api/cases', { params })
  return response.data
}

export async function getCase(cnr) {
  if (USE_MOCK) return mockCases.cases.find(c => c.cnr === cnr) || null
  const response = await client.get(`/api/cases/${cnr}`)
  return response.data
}

export async function getJobs(params = {}) {
  if (USE_MOCK) {
    const mode = params.mode || 'index'
    const jobs = mode === 'details' ? mockDetailJobs : mockIndexJobs
    const status = params.status
    const filtered = status && status !== 'all' ? jobs.filter(j => j.status === status) : jobs
    return { total: filtered.length, jobs: filtered, error_summary: mockJobSummary.error_breakdown }
  }
  const response = await client.get('/api/jobs', { params })
  return response.data
}

export async function retryJobs(mode = 'index', errorType = null) {
  if (USE_MOCK) return { success: true }
  const body = { mode }
  if (errorType) body.error_type = errorType
  const response = await client.post('/api/jobs/retry', body)
  return response.data
}

export async function exportData(options) {
  if (USE_MOCK) {
    // Simulate download delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    return { success: true, message: 'Export started (mock)' }
  }
  const response = await client.post('/api/export', options, { responseType: 'blob' })
  return response.data
}

export async function getSettings() {
  if (USE_MOCK) return mockSettings
  const response = await client.get('/api/settings')
  return response.data
}

export async function updateSettings(settings) {
  if (USE_MOCK) return { ...mockSettings, ...settings }
  const response = await client.post('/api/settings', settings)
  return response.data
}

export async function testCaptcha() {
  if (USE_MOCK) return { success: true, message: 'Valid — Claude Haiku responding' }
  const response = await client.post('/api/settings/test-captcha')
  return response.data
}

export async function testDb() {
  if (USE_MOCK) return { success: true, rows: 2104500, message: 'Connected — 2,104,500 rows' }
  const response = await client.post('/api/settings/test-db')
  return response.data
}

export async function getLiveCount() {
  if (USE_MOCK) return mockLiveCount
  const response = await client.get('/api/live-count')
  return response.data
}

export async function getLiveCountHistory(days = 7) {
  if (USE_MOCK) return mockLiveCountHistory.slice(-days)
  const response = await client.get(`/api/live-count/history?days=${days}`)
  return response.data
}

export async function triggerRefresh() {
  if (USE_MOCK) {
    await new Promise(resolve => setTimeout(resolve, 2000))
    return { ...mockLiveCount, status: 'stale', last_checked: new Date().toISOString() }
  }
  const response = await client.post('/api/live-count/refresh')
  return response.data
}

export default client
