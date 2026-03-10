'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '../context/AuthContext'

const NAV_LINKS = {
  user:      [
    { href: '/dashboard/user', label: 'Dashboard' },
    { href: '/devices',        label: 'Devices'   },
    { href: '/alerts',         label: 'Alerts'    },
  ],
  volunteer: [
    { href: '/dashboard/volunteer', label: 'Dashboard' },
    { href: '/alerts',              label: 'Alerts'    },
  ],
  admin: [
    { href: '/dashboard/admin', label: 'Dashboard' },
    { href: '/devices',         label: 'Devices'   },
    { href: '/alerts',          label: 'Alerts'    },
  ],
}

function ShieldIcon() {
  return (
    <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}

export default function Navbar() {
  const { user, logout }    = useAuth()
  const pathname            = usePathname()
  const router              = useRouter()
  const [menuOpen, setMenu] = useState(false)

  const links = NAV_LINKS[user?.role] || []

  function handleLogout() {
    logout()
    router.push('/')
  }

  function initials(name = '') {
    return name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2)
  }

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-purple-400 group-hover:text-purple-300 transition-colors">
              <ShieldIcon />
            </span>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Kadali
            </span>
          </Link>

          {/* Desktop nav links */}
          {user && (
            <div className="hidden md:flex items-center gap-1">
              {links.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname.startsWith(href)
                      ? 'bg-purple-700 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Avatar */}
                <div className="hidden sm:flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                    {initials(user.name)}
                  </div>
                  <span className="text-gray-300 text-sm hidden lg:block">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-sm text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login"
                  className="text-sm text-gray-300 hover:text-white px-3 py-1.5 rounded-lg transition-colors">
                  Login
                </Link>
                <Link href="/signup"
                  className="text-sm bg-purple-600 hover:bg-purple-500 text-white px-4 py-1.5 rounded-lg transition-colors">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            {user && (
              <button
                onClick={() => setMenu(!menuOpen)}
                className="md:hidden p-2 text-gray-400 hover:text-white"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {menuOpen
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  }
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && user && (
        <div className="md:hidden bg-gray-900 border-t border-gray-800 px-4 pb-3">
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setMenu(false)}
              className={`block px-3 py-2 my-1 rounded-lg text-sm font-medium transition-colors ${
                pathname.startsWith(href)
                  ? 'bg-purple-700 text-white'
                  : 'text-gray-300 hover:bg-gray-800'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}
