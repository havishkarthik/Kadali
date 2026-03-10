import { formatDistanceToNow } from 'date-fns'

const STATUS_COLOR = {
  active:      { dot: 'bg-green-400',  label: 'Active'      },
  inactive:    { dot: 'bg-red-400',    label: 'Inactive'    },
  maintenance: { dot: 'bg-yellow-400', label: 'Maintenance' },
}

function BatteryBar({ level }) {
  const pct    = Math.max(0, Math.min(100, level ?? 0))
  const color  = pct > 60 ? 'bg-green-500' : pct > 20 ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-400 w-8 text-right">{pct}%</span>
    </div>
  )
}

export default function DeviceCard({ device, onUpdate }) {
  const st = STATUS_COLOR[device.status] || STATUS_COLOR.inactive
  const lat = device.lastLocation?.coordinates?.[1]
  const lng = device.lastLocation?.coordinates?.[0]

  const lastSeen = device.lastSeen
    ? formatDistanceToNow(new Date(device.lastSeen), { addSuffix: true })
    : 'Never'

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 shadow hover:border-purple-700 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-white font-semibold text-sm">{device.name || 'Unnamed Device'}</h3>
          <p className="text-gray-500 text-xs font-mono mt-0.5">{device.deviceId}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`w-2.5 h-2.5 rounded-full ${st.dot}`} />
          <span className="text-xs text-gray-400">{st.label}</span>
        </div>
      </div>

      {/* Battery */}
      {device.batteryLevel != null && (
        <div className="mb-3">
          <p className="text-gray-500 text-xs mb-1">Battery</p>
          <BatteryBar level={device.batteryLevel} />
        </div>
      )}

      {/* Location */}
      {lat != null && lng != null && (
        <p className="text-gray-500 text-xs mb-2">
          📍 {lat.toFixed(4)}, {lng.toFixed(4)}
        </p>
      )}

      {/* Last seen */}
      <p className="text-gray-600 text-xs">Last seen: {lastSeen}</p>

      {onUpdate && (
        <button
          onClick={() => onUpdate(device)}
          className="mt-3 w-full text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors"
        >
          Manage
        </button>
      )}
    </div>
  )
}
