'use client'

import axios from 'axios'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
})

/* Attach JWT from localStorage on every request */
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('kadali_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

/* ── Auth ─────────────────────────────────────────────────────────── */
export const auth = {
  login:    (email, password) => api.post('/auth/login', { email, password }),
  register: (data)            => api.post('/auth/register', data),
  getMe:    ()                => api.get('/auth/me'),
}

/* ── Users ────────────────────────────────────────────────────────── */
export const users = {
  getAll:     ()          => api.get('/users'),
  getById:    (id)        => api.get(`/users/${id}`),
  update:     (id, data)  => api.put(`/users/${id}`, data),
  deactivate: (id)        => api.delete(`/users/${id}`),
}

/* ── Devices ──────────────────────────────────────────────────────── */
export const devices = {
  getAll:  ()          => api.get('/devices'),
  create:  (data)      => api.post('/devices', data),
  getById: (id)        => api.get(`/devices/${id}`),
  update:  (id, data)  => api.put(`/devices/${id}`, data),
  delete:  (id)        => api.delete(`/devices/${id}`),
}

/* ── Alerts ───────────────────────────────────────────────────────── */
export const alerts = {
  getAll:      (params) => api.get('/alerts', { params }),
  getActive:   ()       => api.get('/alerts/active'),
  create:      (data)   => api.post('/alerts', data),
  acknowledge: (id)     => api.put(`/alerts/${id}/acknowledge`),
  respond:     (id)     => api.put(`/alerts/${id}/respond`),
  resolve:     (id, notes) => api.put(`/alerts/${id}/resolve`, { notes }),
  getStats:    ()       => api.get('/alerts/stats'),
}

/* ── Device API (IoT) ─────────────────────────────────────────────── */
export const deviceApi = {
  sendData:      (data) => api.post('/device-api/data', data),
  sendEmergency: (data) => api.post('/device-api/emergency', data),
  sendHeartbeat: (data) => api.post('/device-api/heartbeat', data),
}

export default api
