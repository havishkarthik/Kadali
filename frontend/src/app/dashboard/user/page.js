'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { useAuth } from '../../../context/AuthContext'
import ProtectedRoute from '../../../components/ProtectedRoute'
import Navbar from '../../../components/Navbar'
import Sidebar from '../../../components/Sidebar'
import StatsCard from '../../../components/StatsCard'
import AlertCard from '../../../components/AlertCard'
import DeviceCard from '../../../components/DeviceCard'
import MapView from '../../../components/MapView'
import { devices as devicesApi, alerts as alertsApi } from '../../../lib/api'
import { connectSocket, disconnectSocket, onNewAlert, onAlertUpdate, offNewAlert, offAlertUpdate } from '../../../lib/socket'

export default function UserDashboard() {
  return (
    <ProtectedRoute role="user">
      <UserDashboardInner />
    </ProtectedRoute>
  )
}

function UserDashboardInner() {
  const { user, token } = useAuth()
  const router          = useRouter()

  const [myDevices,  setMyDevices]  = useState([])
  const [myAlerts,   setMyAlerts]   = useState([])
  const [loadingD,   setLoadingD]   = useState(true)
  const [loadingA,   setLoadingA]   = useState(true)
  const [triggerMsg, setTriggerMsg] = useState('')
  const [triggering, setTriggering] = useState(false)

  const loadDevices = useCallback(async () => {
    try {
      const res = await devicesApi.getAll()
      setMyDevices(res.data.devices || [])
    } catch { /* silent */ }
    finally { setLoadingD(false) }
  }, [])

  const loadAlerts = useCallback(async () => {
    try {
      const res = await alertsApi.getAll()
      setMyAlerts((res.data.alerts || []).slice(0, 10))
    } catch { /* silent */ }
    finally { setLoadingA(false) }
  }, [])

  useEffect(() => {
    loadDevices()
    loadAlerts()
  }, [loadDevices, loadAlerts])

  /* Real-time socket */
  useEffect(() => {
    if (!token) return
    connectSocket(token)
    const handleNew    = (a) => setMyAlerts(prev => [a, ...prev].slice(0, 10))
    const handleUpdate = (a) => setMyAlerts(prev => prev.map(x => x._id === a._id ? a : x))
    onNewAlert(handleNew)
    onAlertUpdate(handleUpdate)
    return () => {
      offNewAlert(handleNew)
      offAlertUpdate(handleUpdate)
      disconnectSocket()
    }
  }, [token])

  async function triggerEmergency() {
    setTriggering(true)
    setTriggerMsg('')
    try {
      await alertsApi.create({ type: 'manual' })
      setTriggerMsg('✅ Emergency alert triggered! Volunteers have been notified.')
      loadAlerts()
    } catch (err) {
      setTriggerMsg('❌ Failed to trigger alert. Please try again.')
    } finally {
      setTriggering(false)
    }
  }

  /* Map markers from devices */
  const mapMarkers = myDevices
    .filter(d => d.lastLocation?.coordinates)
    .map(d => ({
      lat:   d.lastLocation.coordinates[1],
      lng:   d.lastLocation.coordinates[0],
      type:  'device',
      title: d.name || d.deviceId,
      info:  `Battery: ${d.batteryLevel ?? '?'}%`,
    }))

  const activeCount = myAlerts.filter(a => a.status === 'active').length
  const lastAlert   = myAlerts[0]

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="flex">
        <Sidebar />

        <main className="flex-1 p-6 overflow-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Welcome back, {user?.name?.split(' ')[0]} 👋
              </h1>
              <p className="text-gray-500 text-sm mt-1">{format(new Date(), 'EEEE, MMMM d yyyy')}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <StatsCard title="My Devices"     value={myDevices.length} icon="📱" color="purple" />
            <StatsCard title="Active Alerts"  value={activeCount}      icon="🚨" color="red"    />
            <StatsCard title="Total Alerts"   value={myAlerts.length}  icon="📋" color="blue"   />
          </div>

          {/* Emergency button */}
          <div className="mb-6">
            <button
              onClick={triggerEmergency}
              disabled={triggering}
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-red-600 hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-2xl shadow-red-900/40 transition-all hover:scale-105 active:scale-95"
            >
              🚨 {triggering ? 'Triggering…' : 'TRIGGER EMERGENCY'}
            </button>
            {triggerMsg && (
              <p className="mt-3 text-sm text-gray-300">{triggerMsg}</p>
            )}
          </div>

          {/* Map */}
          {mapMarkers.length > 0 && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
              <h2 className="text-white font-semibold mb-3">Device Locations</h2>
              <div className="h-64">
                <MapView markers={mapMarkers} />
              </div>
            </div>
          )}

          {/* Two-column grid */}
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Devices */}
            <div>
              <h2 className="text-white font-semibold mb-3">My Devices</h2>
              {loadingD ? (
                <p className="text-gray-500 text-sm">Loading…</p>
              ) : myDevices.length === 0 ? (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
                  <p className="text-4xl mb-3">📱</p>
                  <p className="text-gray-400 text-sm">No devices yet.</p>
                  <button onClick={() => router.push('/devices')}
                    className="mt-3 text-xs bg-purple-700 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors">
                    Add Device
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {myDevices.map(d => (
                    <DeviceCard key={d._id} device={d} />
                  ))}
                </div>
              )}
            </div>

            {/* Alerts */}
            <div>
              <h2 className="text-white font-semibold mb-3">Recent Alerts</h2>
              {loadingA ? (
                <p className="text-gray-500 text-sm">Loading…</p>
              ) : myAlerts.length === 0 ? (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
                  <p className="text-4xl mb-3">✅</p>
                  <p className="text-gray-400 text-sm">No alerts — you&apos;re safe!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {myAlerts.map(a => (
                    <AlertCard key={a._id} alert={a} userRole="user" />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
