import { NavLink } from 'react-router-dom'
import { LayoutDashboard, TrendingUp, FileText, Cog, Download, Settings, Database, Bot } from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/coverage', icon: TrendingUp, label: 'Coverage' },
  { to: '/cases', icon: FileText, label: 'Cases' },
  { to: '/jobs', icon: Cog, label: 'Jobs' },
  { to: '/scrapers', icon: Bot, label: 'Scrapers' },
  { to: '/export', icon: Download, label: 'Export' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar({ dbConnected = true }) {
  return (
    <aside className="fixed left-0 top-0 h-screen w-[220px] bg-surface border-r border-border flex flex-col z-50 shadow-sm">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="text-2xl">⚖️</div>
          <div>
            <div className="font-semibold text-text text-sm tracking-wide">LexScraper</div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-primary/10 text-primary border border-primary/20'
                      : 'text-text-muted hover:text-text hover:bg-black/5'
                  }`
                }
              >
                <item.icon size={18} strokeWidth={1.5} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer - DB Status */}
      <div className="p-4 border-t border-border">
        <div className="flex items-center gap-2 text-xs text-text-muted">
          <Database size={14} />
          <span>Database</span>
          <span
            className={`ml-auto w-2 h-2 rounded-full ${
              dbConnected ? 'bg-success' : 'bg-danger'
            }`}
          />
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
