'use client'

import { useState, useEffect, useCallback } from 'react'
import ProtectedRoute from '../../components/ProtectedRoute'
import Navbar from '../../components/Navbar'
import Sidebar from '../../components/Sidebar'
import DeviceCard from '../../components/DeviceCard'
import { devices as devicesApi } from '../../lib/api'

export default function DevicesPage() {
  return (
    <ProtectedRoute>
      <DevicesInner />
    </ProtectedRoute>
  )
}

function DevicesInner() {
  const [deviceList, setDeviceList] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState('')
  const [showModal,  setShowModal]  = useState(false)
  const [form,       setForm]       = useState({ deviceId: '', name: '' })
  const [formError,  setFormError]  = useState('')
  const [formBusy,   setFormBusy]   = useState(false)

  const loadDevices = useCallback(async () => {
    try {
      const res = await devicesApi.getAll()
      setDeviceList(res.data.devices || [])
    } catch {
      setError('Failed to load devices.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { loadDevices() }, [loadDevices])

  async function handleAddDevice(e) {
    e.preventDefault()
    setFormError('')
    setFormBusy(true)
    try {
      await devicesApi.create(form)
      setForm({ deviceId: '', name: '' })
      setShowModal(false)
      loadDevices()
    } catch (err) {
      setFormError(err.response?.data?.message || 'Failed to add device.')
    } finally {
      setFormBusy(false)
    }
  }

  async function handleDelete(device) {
    if (!confirm(`Delete device "${device.name || device.deviceId}"?`)) return
    try {
      await devicesApi.delete(device._id)
      setDeviceList(prev => prev.filter(d => d._id !== device._id))
    } catch {
      alert('Failed to delete device.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Device Management</h1>
              <p className="text-gray-500 text-sm mt-1">{deviceList.length} device{deviceList.length !== 1 ? 's' : ''} registered</p>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium px-4 py-2.5 rounded-xl transition-colors flex items-center gap-2"
            >
              + Add Device
            </button>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-300 text-sm px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="w-10 h-10 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : deviceList.length === 0 ? (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-16 text-center">
              <p className="text-5xl mb-4">📱</p>
              <p className="text-gray-300 font-medium mb-2">No devices yet</p>
              <p className="text-gray-500 text-sm mb-6">Add your first device to start monitoring.</p>
              <button onClick={() => setShowModal(true)}
                className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl transition-colors">
                Add Device
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {deviceList.map(d => (
                <DeviceCard key={d._id} device={d} onUpdate={handleDelete} />
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Add Device Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-white font-semibold text-lg">Add New Device</h2>
              <button onClick={() => { setShowModal(false); setFormError('') }}
                className="text-gray-500 hover:text-white transition-colors text-xl leading-none">✕</button>
            </div>

            {formError && (
              <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm px-4 py-3 rounded-lg mb-4">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddDevice} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1.5">Device ID</label>
                <input
                  type="text"
                  value={form.deviceId}
                  onChange={e => setForm(f => ({ ...f, deviceId: e.target.value }))}
                  required
                  placeholder="e.g. KD-001"
                  className="w-full bg-gray-800 border border-gray-700 focus:border-purple-500 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1.5">Device Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. My Wristband"
                  className="w-full bg-gray-800 border border-gray-700 focus:border-purple-500 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm outline-none transition-colors"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button"
                  onClick={() => { setShowModal(false); setFormError('') }}
                  className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2.5 rounded-xl text-sm transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={formBusy}
                  className="flex-1 bg-purple-600 hover:bg-purple-500 disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
                  {formBusy ? 'Adding…' : 'Add Device'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
