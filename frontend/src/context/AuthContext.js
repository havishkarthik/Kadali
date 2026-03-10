'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import axios from 'axios'

const AuthContext = createContext(null)

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(null)
  const [loading, setLoading] = useState(true)

  /* On mount: restore session from localStorage */
  useEffect(() => {
    const stored = localStorage.getItem('kadali_token')
    if (stored) {
      setToken(stored)
      fetchMe(stored)
    } else {
      setLoading(false)
    }
  }, [])

  async function fetchMe(jwt) {
    try {
      const res = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${jwt}` },
      })
      setUser(res.data.user)
    } catch {
      localStorage.removeItem('kadali_token')
      setToken(null)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  async function login(email, password) {
    const res = await axios.post(`${API_URL}/auth/login`, { email, password })
    const { token: jwt, user: userData } = res.data
    localStorage.setItem('kadali_token', jwt)
    setToken(jwt)
    setUser(userData)
    return userData
  }

  async function signup(name, email, password, phone, role) {
    const res = await axios.post(`${API_URL}/auth/register`, {
      name, email, password, phone, role,
    })
    const { token: jwt, user: userData } = res.data
    localStorage.setItem('kadali_token', jwt)
    setToken(jwt)
    setUser(userData)
    return userData
  }

  function logout() {
    localStorage.removeItem('kadali_token')
    setToken(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider
      value={{ user, token, login, signup, logout, loading, isAuthenticated: !!user }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
