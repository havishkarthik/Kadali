'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '../context/AuthContext'

const ITEMS = [
  { href: '/dashboard/user',      label: 'Dashboard', icon: '🏠', roles: ['user'] },
  { href: '/dashboard/volunteer', label: 'Dashboard', icon: '🏠', roles: ['volunteer'] },
  { href: '/dashboard/admin',     label: 'Dashboard', icon: '🏠', roles: ['admin'] },
  { href: '/devices',             label: 'Devices',   icon: '📱', roles: ['user', 'admin'] },
  { href: '/alerts',              label: 'Alerts',    icon: '🚨', roles: ['user', 'volunteer', 'admin'] },
]

export default function Sidebar() {
  const pathname       = usePathname()
  const { user }       = useAuth()
  const role           = user?.role || 'user'

  const items = ITEMS.filter(i => i.roles.includes(role))

  return (
    <aside className="w-56 min-h-screen bg-gray-900 border-r border-gray-800 flex flex-col py-6 px-3 shrink-0">
      {/* Brand */}
      <div className="flex items-center gap-2 px-3 mb-8">
        <span className="text-2xl">🛡️</span>
        <span className="font-bold text-lg bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
          Kadali
        </span>
      </div>

      <nav className="flex-1 space-y-1">
        {items.map(({ href, label, icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                active
                  ? 'bg-purple-700 text-white shadow-lg shadow-purple-900/40'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="text-base">{icon}</span>
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User info at bottom */}
      {user && (
        <div className="mt-auto px-3 pt-4 border-t border-gray-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {user.name?.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)}
            </div>
            <div className="overflow-hidden">
              <p className="text-white text-xs font-medium truncate">{user.name}</p>
              <p className="text-gray-500 text-xs capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      )}
    </aside>
  )
}
