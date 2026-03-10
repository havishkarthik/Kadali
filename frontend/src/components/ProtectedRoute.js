'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext'

const ROLE_DASHBOARD = {
  user:      '/dashboard/user',
  volunteer: '/dashboard/volunteer',
  admin:     '/dashboard/admin',
}

export default function ProtectedRoute({ children, role }) {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!isAuthenticated) {
      router.replace('/login')
      return
    }

    if (role && user.role !== role) {
      router.replace(ROLE_DASHBOARD[user.role] || '/login')
    }
  }, [loading, isAuthenticated, user, role, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-purple-300 text-sm">Loading…</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null
  if (role && user?.role !== role) return null

  return <>{children}</>
}
