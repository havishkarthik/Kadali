'use client'

import { formatDistanceToNow } from 'date-fns'

const TYPE_CONFIG = {
  emergency:     { label: 'Emergency',     bg: 'bg-red-900/60',    text: 'text-red-300',    border: 'border-red-700'    },
  sos:           { label: 'SOS',           bg: 'bg-orange-900/60', text: 'text-orange-300', border: 'border-orange-700' },
  fall_detected: { label: 'Fall Detected', bg: 'bg-yellow-900/60', text: 'text-yellow-300', border: 'border-yellow-700' },
  geofence:      { label: 'Geofence',      bg: 'bg-blue-900/60',   text: 'text-blue-300',   border: 'border-blue-700'   },
  manual:        { label: 'Manual',        bg: 'bg-purple-900/60', text: 'text-purple-300', border: 'border-purple-700' },
}

const STATUS_CONFIG = {
  active:       { label: 'Active',       dot: 'bg-red-400 animate-pulse'   },
  acknowledged: { label: 'Acknowledged', dot: 'bg-yellow-400'              },
  responding:   { label: 'Responding',   dot: 'bg-blue-400 animate-pulse'  },
  resolved:     { label: 'Resolved',     dot: 'bg-green-400'               },
  false_alarm:  { label: 'False Alarm',  dot: 'bg-gray-400'                },
}

export default function AlertCard({ alert, onAcknowledge, onRespond, onResolve, userRole }) {
  const type   = TYPE_CONFIG[alert.type]   || TYPE_CONFIG.manual
  const status = STATUS_CONFIG[alert.status] || { label: alert.status, dot: 'bg-gray-400' }

  const elapsed = alert.createdAt
    ? formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true })
    : ''

  const lat = alert.location?.coordinates?.[1]
  const lng = alert.location?.coordinates?.[0]

  return (
    <div className={`bg-gray-900 border rounded-xl p-4 shadow-lg ${type.border}`}>
      {/* Header row */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${type.bg} ${type.text}`}>
          {type.label}
        </span>
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${status.dot}`} />
          <span className="text-gray-400 text-xs">{status.label}</span>
        </div>
      </div>

      {/* User & device */}
      <p className="text-white text-sm font-medium mb-1">
        {alert.user?.name || 'Unknown User'}
      </p>
      {alert.device?.name && (
        <p className="text-gray-500 text-xs mb-2">Device: {alert.device.name}</p>
      )}

      {/* Location */}
      {lat != null && lng != null && (
        <p className="text-gray-400 text-xs mb-1">
          📍 {lat.toFixed(4)}, {lng.toFixed(4)}
          {alert.address && ` — ${alert.address}`}
        </p>
      )}

      {/* Time */}
      <p className="text-gray-500 text-xs mb-3">🕐 {elapsed}</p>

      {/* Action buttons */}
      {(userRole === 'volunteer' || userRole === 'admin') && (
        <div className="flex flex-wrap gap-2">
          {alert.status === 'active' && onAcknowledge && (
            <button
              onClick={() => onAcknowledge(alert._id)}
              className="flex-1 text-xs bg-yellow-700 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              Acknowledge
            </button>
          )}
          {(alert.status === 'active' || alert.status === 'acknowledged') && onRespond && (
            <button
              onClick={() => onRespond(alert._id)}
              className="flex-1 text-xs bg-blue-700 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              Respond
            </button>
          )}
          {alert.status !== 'resolved' && alert.status !== 'false_alarm' && onResolve && (
            <button
              onClick={() => onResolve(alert._id)}
              className="flex-1 text-xs bg-green-700 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
              Resolve
            </button>
          )}
        </div>
      )}
    </div>
  )
}
