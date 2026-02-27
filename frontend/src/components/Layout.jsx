import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { WorkerStatus } from './WorkerStatus'
import { DialRoot } from 'dialkit'
import 'dialkit/styles.css'

export function Layout({ scraperStatus = 'running', activeWorkers = 3 }) {
  return (
    <div className="min-h-screen bg-bg">
      <Sidebar dbConnected={true} />

      {/* Main content area */}
      <div className="ml-[220px] min-h-screen">
        {/* Top bar */}
        <header className="sticky top-0 z-40 h-14 bg-bg/80 backdrop-blur-sm border-b border-border shadow-sm flex items-center justify-between px-6">
          <div className="text-sm text-text-muted">
            {/* Breadcrumb or page title will go here */}
          </div>
          <WorkerStatus status={scraperStatus} workerCount={activeWorkers} />
        </header>

        {/* Page content */}
        <main className="p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
      <DialRoot />
    </div>
  )
}

export default Layout
