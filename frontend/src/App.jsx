import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ToastProvider } from './components/Toast'
import { Dashboard } from './pages/Dashboard'
import { NewDashboard } from './pages/NewDashboard'
import { Cases } from './pages/Cases'
import { Jobs } from './pages/Jobs'
import { Export } from './pages/Export'
import { Settings } from './pages/Settings'
import { Scrapers } from './pages/Scrapers'

function App() {
  return (
    <ToastProvider>
      <Routes>
        <Route path="/" element={<Layout scraperStatus="running" activeWorkers={3} />}>
          <Route index element={<Dashboard />} />
          <Route path="coverage" element={<NewDashboard />} />
          <Route path="cases" element={<Cases />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="export" element={<Export />} />
          <Route path="scrapers" element={<Scrapers />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </ToastProvider>
  )
}

export default App
