'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../../../context/AuthContext'
import ProtectedRoute from '../../../components/ProtectedRoute'
import Navbar from '../../../components/Navbar'
import Sidebar from '../../../components/Sidebar'
import AlertCard from '../../../components/AlertCard'
import MapView from '../../../components/MapView'
import { alerts as alertsApi } from '../../../lib/api'
import { connectSocket, disconnectSocket, onNewAlert, onAlertUpdate, offNewAlert, offAlertUpdate } from '../../../lib/socket'

export default function VolunteerDashboard() {
  return (
    <ProtectedRoute role="volunteer">
      <VolunteerDashboardInner />
    </ProtectedRoute>
  )
}

function VolunteerDashboardInner() {
  const { token }          = useAuth()
  const [activeAlerts, setActiveAlerts] = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')
  const pollRef = useRef(null)

  const loadAlerts = useCallback(async () => {
    try {
      const res = await alertsApi.getActive()
      setActiveAlerts(res.data.alerts || [])
      setError('')
    } catch (err) {
      setError('Failed to load alerts. Retrying…')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAlerts()
    pollRef.current = setInterval(loadAlerts, 30_000)
    return () => clearInterval(pollRef.current)
  }, [loadAlerts])

  /* Socket for real-time updates */
  useEffect(() => {
    if (!token) return
    connectSocket(token)
    const handleNew    = (a) => setActiveAlerts(prev => [a, ...prev])
    const handleUpdate = (a) => setActiveAlerts(prev =>
      prev.map(x => x._id === a._id ? a : x).filter(x => x.status !== 'resolved' && x.status !== 'false_alarm')
    )
    onNewAlert(handleNew)
    onAlertUpdate(handleUpdate)
    return () => {
      offNewAlert(handleNew)
      offAlertUpdate(handleUpdate)
      disconnectSocket()
    }
  }, [token])

  async function handleAcknowledge(id) {
    try {
      const res = await alertsApi.acknowledge(id)
      setActiveAlerts(prev => prev.map(a => a._id === id ? res.data.alert : a))
    } catch { /* silent */ }
  }

  async function handleRespond(id) {
    try {
      const res = await alertsApi.respond(id)
      setActiveAlerts(prev => prev.map(a => a._id === id ? res.data.alert : a))
    } catch { /* silent */ }
  }

  async function handleResolve(id) {
    try {
      const res = await alertsApi.resolve(id)
      setActiveAlerts(prev =>
        prev.map(a => a._id === id ? res.data.alert : a).filter(a => a.status !== 'resolved')
      )
    } catch { /* silent */ }
  }

  const mapMarkers = activeAlerts
    .filter(a => a.location?.coordinates)
    .map(a => ({
      lat:   a.location.coordinates[1],
      lng:   a.location.coordinates[0],
      type:  a.type,
      title: `${a.type.toUpperCase()} Alert`,
      info:  `User: ${a.user?.name || '?'} | Status: ${a.status}`,
    }))

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Volunteer Dashboard</h1>
              <p className="text-gray-500 text-sm mt-1">
                {activeAlerts.length > 0
                  ? <span className="text-red-400 font-medium">{activeAlerts.length} active alert{activeAlerts.length !== 1 ? 's' : ''} need attention</span>
                  : 'No active alerts right now'
                }
              </p>
            </div>
            <button onClick={loadAlerts}
              className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-lg transition-colors">
              ↻ Refresh
            </button>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-300 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {/* Large map */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
            <h2 className="text-white font-semibold mb-3">
              Active Alert Locations
              {mapMarkers.length > 0 && (
                <span className="ml-2 text-xs bg-red-700 text-white px-2 py-0.5 rounded-full">
                  {mapMarkers.length}
                </span>
              )}
            </h2>
            <div className="h-96">
              <MapView markers={mapMarkers} />
            </div>
          </div>

          {/* Alert cards */}
          <h2 className="text-white font-semibold mb-3">Active Alerts</h2>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activeAlerts.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
              <p className="text-4xl mb-3">✅</p>
              <p className="text-gray-400">No active alerts — all is well!</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeAlerts.map(a => (
                <AlertCard
                  key={a._id}
                  alert={a}
                  userRole="volunteer"
                  onAcknowledge={handleAcknowledge}
                  onRespond={handleRespond}
                  onResolve={handleResolve}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
