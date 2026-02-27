import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { ChevronDown, ChevronUp } from 'lucide-react'

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-surface border border-border rounded-lg px-3 py-2 shadow-lg">
        <p className="text-sm font-medium text-text">{data.name}</p>
        <div className="mt-1 space-y-0.5">
          <p className="text-xs text-text-muted">
            Listed: <span className="font-mono text-text">{data.listed.toLocaleString()}</span>
          </p>
          <p className="text-xs text-text-muted">
            Details: <span className="font-mono text-success">{data.details_fetched.toLocaleString()}</span>
          </p>
        </div>
      </div>
    )
  }
  return null
}

export function CourtBreakdown({ courts = [], initialLimit = 5 }) {
  const [showAll, setShowAll] = useState(false)

  const displayedCourts = showAll ? courts : courts.slice(0, initialLimit)
  const maxValue = Math.max(...courts.map(c => c.listed))

  // Prepare data for chart
  const chartData = displayedCourts.map(court => ({
    name: court.name,
    listed: court.listed,
    details_fetched: court.details_fetched,
    // Truncate name for display
    shortName: court.name.length > 25 ? court.name.slice(0, 22) + '...' : court.name
  }))

  return (
    <div>
      <div className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
            barCategoryGap={8}
          >
            <XAxis
              type="number"
              hide
              domain={[0, maxValue]}
            />
            <YAxis
              type="category"
              dataKey="shortName"
              width={180}
              tick={{ fill: '#475569', fontSize: 12, fontFamily: 'DM Sans' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
            <Bar
              dataKey="listed"
              radius={[0, 4, 4, 0]}
              maxBarSize={24}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={`rgba(59, 124, 245, ${0.35 + (0.65 * entry.listed / maxValue)})`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Listed counts on the right */}
      <div className="mt-2 space-y-[13px] pr-1">
        {chartData.map((court, index) => (
          <div key={index} className="flex justify-end">
            <span className="font-mono text-xs text-text-muted">
              {court.listed.toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* Show all toggle */}
      {courts.length > initialLimit && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 flex items-center gap-1 text-xs text-primary hover:text-primary-hover transition-colors"
        >
          {showAll ? (
            <>
              <ChevronUp size={14} />
              Show fewer courts
            </>
          ) : (
            <>
              <ChevronDown size={14} />
              Show all {courts.length} courts
            </>
          )}
        </button>
      )}
    </div>
  )
}

export default CourtBreakdown
