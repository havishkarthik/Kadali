'use client'

import { useState, useEffect, useCallback } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { useAuth } from '../../../context/AuthContext'
import ProtectedRoute from '../../../components/ProtectedRoute'
import Navbar from '../../../components/Navbar'
import Sidebar from '../../../components/Sidebar'
import StatsCard from '../../../components/StatsCard'
import MapView from '../../../components/MapView'
import { users as usersApi, devices as devicesApi, alerts as alertsApi } from '../../../lib/api'
import { connectSocket, disconnectSocket, onNewAlert, onAlertUpdate, offNewAlert, offAlertUpdate } from '../../../lib/socket'

export default function AdminDashboard() {
  return (
    <ProtectedRoute role="admin">
      <AdminDashboardInner />
    </ProtectedRoute>
  )
}

function StatusBadge({ status }) {
  const map = {
    active:       'bg-red-900/60 text-red-300',
    acknowledged: 'bg-yellow-900/60 text-yellow-300',
    responding:   'bg-blue-900/60 text-blue-300',
    resolved:     'bg-green-900/60 text-green-300',
    false_alarm:  'bg-gray-700 text-gray-300',
  }
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[status] || 'bg-gray-700 text-gray-300'}`}>
      {status}
    </span>
  )
}

function AdminDashboardInner() {
  const { token }               = useAuth()
  const [allUsers,    setAllUsers]    = useState([])
  const [allDevices,  setAllDevices]  = useState([])
  const [allAlerts,   setAllAlerts]   = useState([])
  const [activeAlerts, setActiveAlerts] = useState([])
  const [stats,       setStats]       = useState(null)
  const [loading,     setLoading]     = useState(true)

  const loadAll = useCallback(async () => {
    try {
      const [uRes, dRes, aRes, acRes] = await Promise.allSettled([
        usersApi.getAll(),
        devicesApi.getAll(),
        alertsApi.getAll(),
        alertsApi.getActive(),
      ])
      if (uRes.status  === 'fulfilled') setAllUsers(uRes.value.data.users    || [])
      if (dRes.status  === 'fulfilled') setAllDevices(dRes.value.data.devices || [])
      if (aRes.status  === 'fulfilled') setAllAlerts(aRes.value.data.alerts   || [])
      if (acRes.status === 'fulfilled') setActiveAlerts(acRes.value.data.alerts || [])
    } catch { /* silent */ }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  useEffect(() => {
    if (!token) return
    connectSocket(token)
    const handleNew    = (a) => setActiveAlerts(prev => [a, ...prev])
    const handleUpdate = (a) => setActiveAlerts(prev => prev.map(x => x._id === a._id ? a : x))
    onNewAlert(handleNew)
    onAlertUpdate(handleUpdate)
    return () => { offNewAlert(handleNew); offAlertUpdate(handleUpdate); disconnectSocket() }
  }, [token])

  async function deactivateUser(id) {
    if (!confirm('Deactivate this user?')) return
    try {
      await usersApi.deactivate(id)
      setAllUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: false } : u))
    } catch { alert('Failed to deactivate user.') }
  }

  async function handleResolve(id) {
    try {
      const res = await alertsApi.resolve(id)
      setAllAlerts(prev => prev.map(a => a._id === id ? res.data.alert : a))
      setActiveAlerts(prev => prev.filter(a => a._id !== id))
    } catch { /* silent */ }
  }

  const resolvedToday = allAlerts.filter(a => {
    if (a.status !== 'resolved' || !a.resolvedAt) return false
    const d = new Date(a.resolvedAt)
    const n = new Date()
    return d.toDateString() === n.toDateString()
  }).length

  const mapMarkers = activeAlerts
    .filter(a => a.location?.coordinates)
    .map(a => ({
      lat:   a.location.coordinates[1],
      lng:   a.location.coordinates[0],
      type:  a.type,
      title: `${a.type} Alert`,
      info:  a.user?.name || '?',
    }))

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <button onClick={loadAll}
              className="text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-2 rounded-lg transition-colors">
              ↻ Refresh
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatsCard title="Total Users"     value={allUsers.length}        icon="👥" color="purple" />
            <StatsCard title="Total Devices"   value={allDevices.length}      icon="📱" color="blue"   />
            <StatsCard title="Active Alerts"   value={activeAlerts.length}    icon="🚨" color="red"    />
            <StatsCard title="Resolved Today"  value={resolvedToday}          icon="✅" color="green"  />
          </div>

          {/* Map */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 mb-6">
            <h2 className="text-white font-semibold mb-3">Active Alert Map</h2>
            <div className="h-72">
              <MapView markers={mapMarkers} />
            </div>
          </div>

          {/* Recent alerts table */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl mb-6 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-800 flex items-center justify-between">
              <h2 className="text-white font-semibold">Recent Alerts</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-xs uppercase border-b border-gray-800">
                    <th className="px-5 py-3 text-left">Type</th>
                    <th className="px-5 py-3 text-left">User</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left">Time</th>
                    <th className="px-5 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allAlerts.slice(0, 10).map(a => (
                    <tr key={a._id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                      <td className="px-5 py-3 text-gray-300 capitalize">{a.type}</td>
                      <td className="px-5 py-3 text-gray-300">{a.user?.name || '—'}</td>
                      <td className="px-5 py-3"><StatusBadge status={a.status} /></td>
                      <td className="px-5 py-3 text-gray-500 text-xs">
                        {a.createdAt ? formatDistanceToNow(new Date(a.createdAt), { addSuffix: true }) : '—'}
                      </td>
                      <td className="px-5 py-3">
                        {a.status !== 'resolved' && a.status !== 'false_alarm' && (
                          <button onClick={() => handleResolve(a._id)}
                            className="text-xs bg-green-800 hover:bg-green-700 text-white px-3 py-1 rounded-lg transition-colors">
                            Resolve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {allAlerts.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-600">No alerts</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Device health table */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl mb-6 overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-800">
              <h2 className="text-white font-semibold">Device Health</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-xs uppercase border-b border-gray-800">
                    <th className="px-5 py-3 text-left">Device</th>
                    <th className="px-5 py-3 text-left">Owner</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left">Battery</th>
                    <th className="px-5 py-3 text-left">Last Seen</th>
                  </tr>
                </thead>
                <tbody>
                  {allDevices.map(d => {
                    const bat = d.batteryLevel ?? null
                    const batColor = bat == null ? 'text-gray-500' : bat > 60 ? 'text-green-400' : bat > 20 ? 'text-yellow-400' : 'text-red-400'
                    const stDot = { active: 'bg-green-400', inactive: 'bg-red-400', maintenance: 'bg-yellow-400' }[d.status] || 'bg-gray-400'
                    return (
                      <tr key={d._id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                        <td className="px-5 py-3">
                          <p className="text-gray-200 text-sm">{d.name || 'Unnamed'}</p>
                          <p className="text-gray-600 text-xs font-mono">{d.deviceId}</p>
                        </td>
                        <td className="px-5 py-3 text-gray-400 text-xs">{d.owner?.name || '—'}</td>
                        <td className="px-5 py-3">
                          <span className="flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${stDot}`} />
                            <span className="text-gray-400 capitalize text-xs">{d.status}</span>
                          </span>
                        </td>
                        <td className={`px-5 py-3 text-xs ${batColor}`}>{bat != null ? `${bat}%` : '—'}</td>
                        <td className="px-5 py-3 text-gray-500 text-xs">
                          {d.lastSeen ? formatDistanceToNow(new Date(d.lastSeen), { addSuffix: true }) : 'Never'}
                        </td>
                      </tr>
                    )
                  })}
                  {allDevices.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-600">No devices</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* User management table */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-5 py-3 border-b border-gray-800">
              <h2 className="text-white font-semibold">User Management</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 text-xs uppercase border-b border-gray-800">
                    <th className="px-5 py-3 text-left">Name</th>
                    <th className="px-5 py-3 text-left">Email</th>
                    <th className="px-5 py-3 text-left">Role</th>
                    <th className="px-5 py-3 text-left">Status</th>
                    <th className="px-5 py-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.map(u => (
                    <tr key={u._id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                      <td className="px-5 py-3 text-gray-200">{u.name}</td>
                      <td className="px-5 py-3 text-gray-400 text-xs">{u.email}</td>
                      <td className="px-5 py-3">
                        <span className="text-xs bg-purple-900/60 text-purple-300 px-2 py-0.5 rounded-full capitalize">{u.role}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${u.isActive ? 'bg-green-900/60 text-green-300' : 'bg-gray-700 text-gray-400'}`}>
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        {u.isActive && u.role !== 'admin' && (
                          <button onClick={() => deactivateUser(u._id)}
                            className="text-xs bg-red-900/60 hover:bg-red-800 text-red-300 px-3 py-1 rounded-lg transition-colors">
                            Deactivate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {allUsers.length === 0 && (
                    <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-600">No users</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
