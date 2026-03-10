'use client'

import { useState, useEffect, useCallback } from 'react'
import { formatDistanceToNow, format } from 'date-fns'
import ProtectedRoute from '../../components/ProtectedRoute'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import MapView from '../../components/MapView'
import { alerts as alertsApi } from '../../lib/api'
import { useAuth } from '../../context/AuthContext'

export default function AlertsPage() {
  return (
    <ProtectedRoute>
      <AlertsInner />
    </ProtectedRoute>
  )
}

const ALERT_TYPES   = ['all', 'emergency', 'sos', 'fall_detected', 'geofence', 'manual']
const ALERT_STATUSES = ['all', 'active', 'acknowledged', 'responding', 'resolved', 'false_alarm']
const PAGE_SIZE = 15

function TypeBadge({ type }) {
  const map = {
    emergency:     'bg-red-900/60 text-red-300',
    sos:           'bg-orange-900/60 text-orange-300',
    fall_detected: 'bg-yellow-900/60 text-yellow-300',
    geofence:      'bg-blue-900/60 text-blue-300',
    manual:        'bg-purple-900/60 text-purple-300',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${map[type] || 'bg-gray-700 text-gray-300'}`}>
      {type.replace('_', ' ')}
    </span>
  )
}

function StatusBadge({ status }) {
  const map = {
    active:       'bg-red-900/50 text-red-300',
    acknowledged: 'bg-yellow-900/50 text-yellow-300',
    responding:   'bg-blue-900/50 text-blue-300',
    resolved:     'bg-green-900/50 text-green-300',
    false_alarm:  'bg-gray-700 text-gray-400',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[status] || 'bg-gray-700 text-gray-300'}`}>
      {status}
    </span>
  )
}

function AlertsInner() {
  const { user }            = useAuth()
  const [alertList, setAlertList]   = useState([])
  const [filtered,  setFiltered]    = useState([])
  const [loading,   setLoading]     = useState(true)
  const [error,     setError]       = useState('')
  const [selected,  setSelected]    = useState(null)
  const [page,      setPage]        = useState(1)

  const [typeFilter,   setTypeFilter]   = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const loadAlerts = useCallback(async () => {
    try {
      const res = await alertsApi.getAll()
      setAlertList(res.data.alerts || [])
    } catch {
      setError('Failed to load alerts.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadAlerts() }, [loadAlerts])

  /* Apply filters */
  useEffect(() => {
    let list = [...alertList]
    if (typeFilter   !== 'all') list = list.filter(a => a.type   === typeFilter)
    if (statusFilter !== 'all') list = list.filter(a => a.status === statusFilter)
    setFiltered(list)
    setPage(1)
  }, [alertList, typeFilter, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const mapMarker = selected && selected.location?.coordinates
    ? [{
        lat:   selected.location.coordinates[1],
        lng:   selected.location.coordinates[0],
        type:  selected.type,
        title: `${selected.type} Alert`,
        info:  selected.user?.name || '?',
      }]
    : []

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Alert History</h1>
              <p className="text-gray-500 text-sm mt-1">{filtered.length} alert{filtered.length !== 1 ? 's' : ''}</p>
            </div>
            <button onClick={loadAlerts}
              className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-lg transition-colors">
              ↻ Refresh
            </button>
          </div>

          {/* Filter bar */}
          <div className="flex flex-wrap gap-3 mb-5">
            <div>
              <label className="block text-gray-500 text-xs mb-1">Type</label>
              <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 outline-none focus:border-purple-500">
                {ALERT_TYPES.map(t => <option key={t} value={t}>{t === 'all' ? 'All Types' : t.replace('_', ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-gray-500 text-xs mb-1">Status</label>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                className="bg-gray-800 border border-gray-700 text-gray-300 text-sm rounded-lg px-3 py-2 outline-none focus:border-purple-500">
                {ALERT_STATUSES.map(s => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s}</option>)}
              </select>
            </div>
          </div>

          {/* Selected alert map */}
          {selected && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-white font-semibold text-sm">Alert Location</h2>
                <button onClick={() => setSelected(null)} className="text-gray-500 hover:text-white text-xs">✕ Close</button>
              </div>
              <div className="h-48">
                <MapView
                  markers={mapMarker}
                  center={mapMarker[0] ? [mapMarker[0].lat, mapMarker[0].lng] : undefined}
                  zoom={13}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-300 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Table */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-xs uppercase border-b border-gray-800">
                    <th className="px-5 py-3 text-left">Type</th>
                    <th className="px-5 py-3 text-left">User</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left">Location</th>
                    <th className="px-5 py-3 text-left">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && (
                    <tr><td colSpan={5} className="px-5 py-10 text-center">
                      <div className="flex justify-center">
                        <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                      </div>
                    </td></tr>
                  )}
                  {!loading && paginated.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-600">No alerts match your filters</td></tr>
                  )}
                  {paginated.map(a => {
                    const lat = a.location?.coordinates?.[1]
                    const lng = a.location?.coordinates?.[0]
                    return (
                      <tr
                        key={a._id}
                        onClick={() => setSelected(a)}
                        className={`border-b border-gray-800/50 hover:bg-gray-800/40 cursor-pointer transition-colors ${selected?._id === a._id ? 'bg-purple-900/20' : ''}`}
                      >
                        <td className="px-5 py-3"><TypeBadge type={a.type} /></td>
                        <td className="px-5 py-3 text-gray-300">{a.user?.name || '—'}</td>
                        <td className="px-5 py-3"><StatusBadge status={a.status} /></td>
                        <td className="px-5 py-3 text-gray-500 text-xs">
                          {lat != null ? `${lat.toFixed(3)}, ${lng.toFixed(3)}` : '—'}
                        </td>
                        <td className="px-5 py-3 text-gray-500 text-xs">
                          {a.createdAt ? formatDistanceToNow(new Date(a.createdAt), { addSuffix: true }) : '—'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-800">
                <p className="text-gray-500 text-xs">Page {page} of {totalPages}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="text-xs bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-300 px-3 py-1.5 rounded-lg transition-colors">
                    ← Prev
                  </button>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="text-xs bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-300 px-3 py-1.5 rounded-lg transition-colors">
                    Next →
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
