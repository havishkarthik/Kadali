'use client'

import { io } from 'socket.io-client'

let socket = null

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000'

export function connectSocket(token) {
  if (socket && socket.connected) return socket

  socket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  })

  socket.on('connect',           () => console.log('[Socket] connected:', socket.id))
  socket.on('disconnect',        () => console.log('[Socket] disconnected'))
  socket.on('connect_error',     (err) => console.error('[Socket] error:', err.message))

  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export function getSocket() {
  return socket
}

export function onNewAlert(callback) {
  if (!socket) return
  socket.on('new-alert', callback)
}

export function onAlertUpdate(callback) {
  if (!socket) return
  socket.on('alert-update', callback)
}

export function offNewAlert(callback) {
  if (!socket) return
  socket.off('new-alert', callback)
}

export function offAlertUpdate(callback) {
  if (!socket) return
  socket.off('alert-update', callback)
}

export function emitVolunteerLocation(location) {
  if (socket && socket.connected) {
    socket.emit('volunteer-location', location)
  }
}
