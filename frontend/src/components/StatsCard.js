export default function StatsCard({ title, value, icon, color = 'purple', trend }) {
  const colorMap = {
    purple: 'border-purple-500 bg-purple-500/10',
    pink:   'border-pink-500   bg-pink-500/10',
    green:  'border-green-500  bg-green-500/10',
    yellow: 'border-yellow-500 bg-yellow-500/10',
    red:    'border-red-500    bg-red-500/10',
    blue:   'border-blue-500   bg-blue-500/10',
  }

  const textMap = {
    purple: 'text-purple-400',
    pink:   'text-pink-400',
    green:  'text-green-400',
    yellow: 'text-yellow-400',
    red:    'text-red-400',
    blue:   'text-blue-400',
  }

  return (
    <div className={`bg-gray-900 border-l-4 rounded-xl p-5 flex items-start gap-4 shadow ${colorMap[color]}`}>
      <div className={`text-3xl mt-0.5`}>{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-gray-400 text-xs font-medium uppercase tracking-wide truncate">{title}</p>
        <p className={`text-3xl font-bold mt-1 ${textMap[color]}`}>{value ?? '—'}</p>
        {trend != null && (
          <p className={`text-xs mt-1 flex items-center gap-1 ${trend >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}% vs last period
          </p>
        )}
      </div>
    </div>
  )
}
