import { useState } from 'react'
import { Save, Loader2, Check, X, Eye, EyeOff, AlertTriangle, ExternalLink } from 'lucide-react'
import { mockSettings, testCaptcha, testDb, updateSettings } from '../api/client'

function workerHint(n) {
  if (n <= 2) return 'Conservative — good for avoiding rate limits'
  if (n <= 5) return 'Balanced — recommended'
  return 'Aggressive — monitor for blocks'
}

export function Settings() {
  const [settings, setSettings] = useState({ ...mockSettings })
  const [showApiKey, setShowApiKey] = useState(false)
  const [testingCaptcha, setTestingCaptcha] = useState(false)
  const [captchaResult, setCaptchaResult] = useState(settings.api_key_valid ? { success: true } : null)
  const [testingDb, setTestingDb] = useState(false)
  const [dbResult, setDbResult] = useState(settings.db_stats?.connected ? { success: true, rows: settings.db_stats.row_count, size_gb: settings.db_stats.size_gb } : null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [showMigrateModal, setShowMigrateModal] = useState(false)
  const [confirmAction, setConfirmAction] = useState(null)

  const update = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleTestCaptcha = async () => {
    setTestingCaptcha(true)
    setCaptchaResult(null)
    try {
      const result = await testCaptcha()
      setCaptchaResult(result)
    } catch {
      setCaptchaResult({ success: false })
    }
    setTestingCaptcha(false)
  }

  const handleTestDb = async () => {
    setTestingDb(true)
    setDbResult(null)
    try {
      const result = await testDb()
      setDbResult(result)
    } catch {
      setDbResult({ success: false })
    }
    setTestingDb(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateSettings(settings)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      // ignore
    }
    setSaving(false)
  }

  const handleConfirm = () => {
    // Mock action
    setConfirmAction(null)
  }

  return (
    <div className="space-y-5 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-text">Settings</h1>
        <p className="text-sm text-text-muted mt-0.5">Configure the scraper and connections</p>
      </div>

      {/* Scraper Section */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-[11px] uppercase tracking-[0.1em] text-text-muted font-medium mb-5">Scraper</h2>

        {/* Workers Slider */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-text">Workers</label>
            <span className="font-mono text-2xl font-semibold text-text">{settings.workers}</span>
          </div>
          <input
            type="range"
            min={1}
            max={10}
            value={settings.workers}
            onChange={e => update('workers', Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-xs text-text-dim mt-1">
            <span>1</span>
            <span>10</span>
          </div>
          <p className="text-xs text-text-muted mt-2">{workerHint(settings.workers)}</p>
        </div>

        {/* Request Delay */}
        <div className="mb-6">
          <label className="text-sm text-text block mb-2">Request delay</label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={500}
              max={10000}
              value={settings.delay_ms}
              onChange={e => update('delay_ms', Number(e.target.value))}
              className="w-32 h-9 bg-bg border border-border rounded-lg px-3 text-sm text-text font-mono focus:outline-none focus:border-primary"
            />
            <span className="text-sm text-text-muted">ms</span>
          </div>
          <p className="text-xs text-text-muted mt-1.5">Recommended: 2000ms minimum for government portals</p>
          {settings.delay_ms < 1000 && (
            <p className="text-xs text-warning mt-1 flex items-center gap-1">
              <AlertTriangle size={12} /> Too low — risk of IP block
            </p>
          )}
        </div>

        {/* Max Retries */}
        <div className="mb-6">
          <label className="text-sm text-text block mb-2">Max retries</label>
          <input
            type="number"
            min={1}
            max={10}
            value={settings.max_retries}
            onChange={e => update('max_retries', Number(e.target.value))}
            className="w-32 h-9 bg-bg border border-border rounded-lg px-3 text-sm text-text font-mono focus:outline-none focus:border-primary"
          />
          <p className="text-xs text-text-muted mt-1.5">Jobs failing more than this are marked as failed</p>
        </div>

        {/* Headless Toggle */}
        <div>
          <div className="flex items-center justify-between">
            <label className="text-sm text-text">Headless browser</label>
            <button
              onClick={() => update('headless', !settings.headless)}
              className={`relative w-11 h-6 rounded-full transition-colors ${settings.headless ? 'bg-primary' : 'bg-border'}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings.headless ? 'left-[22px]' : 'left-0.5'}`} />
            </button>
          </div>
          <p className="text-xs text-text-muted mt-1.5">
            {settings.headless ? 'Browser runs in background' : 'Browser window will open — slower but easier to debug'}
          </p>
        </div>
      </div>

      {/* API Keys Section */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-[11px] uppercase tracking-[0.1em] text-text-muted font-medium mb-1">API Keys</h2>
        <p className="text-xs text-text-muted mb-4">Used for solving CAPTCHAs via Claude Vision (Haiku)</p>

        <label className="text-sm text-text block mb-2">Anthropic API Key</label>
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              type={showApiKey ? 'text' : 'password'}
              value={settings.anthropic_api_key}
              onChange={e => { update('anthropic_api_key', e.target.value); setCaptchaResult(null) }}
              placeholder="sk-ant-..."
              className="w-full h-9 bg-bg border border-border rounded-lg px-3 pr-10 text-sm text-text font-mono focus:outline-none focus:border-primary"
            />
            <button
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text"
            >
              {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>
          <button
            onClick={handleTestCaptcha}
            disabled={testingCaptcha}
            className="h-9 px-4 border border-border rounded-lg text-sm text-text-muted hover:text-text hover:bg-black/5 transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {testingCaptcha ? <><Loader2 size={14} className="animate-spin" /> Testing...</> : 'Test'}
          </button>
        </div>

        {captchaResult && (
          <div className={`flex items-center gap-1.5 mt-2 text-xs ${captchaResult.success ? 'text-success' : 'text-danger'}`}>
            {captchaResult.success ? <><Check size={12} /> Valid — Claude Haiku responding (~$0.0003/solve)</> : <><X size={12} /> Invalid key — check your key at console.anthropic.com</>}
          </div>
        )}

        <p className="text-xs text-text-dim mt-3">At current scraping rate, CAPTCHA solving costs ~$0.35 per 1,000 pages</p>
      </div>

      {/* Database Section */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-sm">
        <h2 className="text-[11px] uppercase tracking-[0.1em] text-text-muted font-medium mb-4">Database</h2>

        <label className="text-sm text-text block mb-2">Connection string</label>
        <input
          type="text"
          value={settings.db_url}
          onChange={e => { update('db_url', e.target.value); setDbResult(null) }}
          className="w-full h-9 bg-bg border border-border rounded-lg px-3 text-sm text-text font-mono focus:outline-none focus:border-primary mb-3"
        />

        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={handleTestDb}
            disabled={testingDb}
            className="h-9 px-4 border border-border rounded-lg text-sm text-text-muted hover:text-text hover:bg-black/5 transition-colors disabled:opacity-50 flex items-center gap-1.5"
          >
            {testingDb ? <><Loader2 size={14} className="animate-spin" /> Testing...</> : 'Test Connection'}
          </button>
          <button
            onClick={() => setShowMigrateModal(true)}
            className="h-9 px-4 border border-border rounded-lg text-sm text-text-muted hover:text-text hover:bg-black/5 transition-colors flex items-center gap-1.5"
          >
            Migrate to Cloud...
          </button>
        </div>

        {dbResult && (
          <div className={`flex items-center gap-1.5 text-xs ${dbResult.success ? 'text-success' : 'text-danger'}`}>
            {dbResult.success ? (
              <><Check size={12} /> Connected — {dbResult.rows?.toLocaleString()} cases — {dbResult.size_gb} GB</>
            ) : (
              <><X size={12} /> Cannot connect — is PostgreSQL running?</>
            )}
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <div className="border border-danger/20 rounded-xl p-6">
        <h2 className="text-[11px] uppercase tracking-[0.1em] text-danger font-medium mb-5">Danger Zone</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text">Reset All Failed Jobs</p>
              <p className="text-xs text-text-muted mt-0.5">Moves all failed jobs back to pending</p>
            </div>
            <button
              onClick={() => setConfirmAction('reset')}
              className="h-9 px-4 border border-danger/30 rounded-lg text-sm text-danger hover:bg-danger/5 transition-colors"
            >
              Reset Failed Jobs
            </button>
          </div>

          <hr className="border-border" />

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-text">Clear Activity Log</p>
              <p className="text-xs text-text-muted mt-0.5">Deletes all activity log entries</p>
            </div>
            <button
              onClick={() => setConfirmAction('clear')}
              className="h-9 px-4 border border-danger/30 rounded-lg text-sm text-danger hover:bg-danger/5 transition-colors"
            >
              Clear Activity Log
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full h-12 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {saving ? (
          <><Loader2 size={18} className="animate-spin" /> Saving...</>
        ) : saved ? (
          <><Check size={18} /> Settings saved</>
        ) : (
          <><Save size={18} /> Save Settings</>
        )}
      </button>

      {/* Confirm Dialog */}
      {confirmAction && (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center animate-modal-in" onClick={() => setConfirmAction(null)}>
          <div className="bg-surface border border-border rounded-xl p-6 w-[400px] shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-text mb-2">Are you sure?</h3>
            <p className="text-sm text-text-muted mb-5">
              {confirmAction === 'reset'
                ? 'This will reset all failed jobs back to pending status.'
                : 'This will permanently delete all activity log entries.'}
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setConfirmAction(null)}
                className="h-9 px-4 border border-border rounded-lg text-sm text-text-muted hover:text-text transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="h-9 px-4 bg-danger text-white rounded-lg text-sm font-medium hover:bg-danger/90 transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Migrate Modal */}
      {showMigrateModal && (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center animate-modal-in" onClick={() => setShowMigrateModal(false)}>
          <div className="bg-surface border border-border rounded-xl p-6 w-[480px] shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-text">Migrate to Cloud</h3>
              <button onClick={() => setShowMigrateModal(false)} className="text-text-muted hover:text-text"><X size={18} /></button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium text-text">Step 1: Create a cloud database</p>
                <p className="text-text-muted mt-0.5">Recommended: Supabase (free tier)</p>
                <a href="#" className="text-primary text-xs flex items-center gap-1 mt-1 hover:text-primary-hover">supabase.com/dashboard/new <ExternalLink size={10} /></a>
              </div>
              <div>
                <p className="font-medium text-text">Step 2: Get your connection string</p>
                <p className="text-text-muted mt-0.5">Settings &rarr; Database &rarr; Connection URI</p>
              </div>
              <div>
                <p className="font-medium text-text">Step 3: Paste it below and test</p>
                <input
                  type="text"
                  placeholder="postgresql://user:pass@host/db"
                  className="w-full h-9 bg-bg border border-border rounded-lg px-3 text-sm text-text font-mono focus:outline-none focus:border-primary mt-2"
                />
                <button className="h-9 px-4 border border-border rounded-lg text-sm text-text-muted hover:text-text hover:bg-black/5 transition-colors mt-2">
                  Test New Connection
                </button>
              </div>
              <div>
                <p className="font-medium text-text">Step 4: Migrate data</p>
                <p className="text-text-muted mt-0.5">This will copy all data to cloud DB. Your local DB remains unchanged.</p>
                <button className="h-9 px-4 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-hover transition-colors mt-2">
                  Start Migration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Settings
