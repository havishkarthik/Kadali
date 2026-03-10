'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '../../context/AuthContext'

const ROLE_REDIRECT = {
  user:      '/dashboard/user',
  volunteer: '/dashboard/volunteer',
  admin:     '/dashboard/admin',
}

export default function SignupPage() {
  const { signup }  = useAuth()
  const router      = useRouter()

  const [form, setForm] = useState({
    name: '', email: '', password: '', phone: '', role: 'user',
  })
  const [error, setError] = useState('')
  const [busy, setBusy]   = useState(false)

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const user = await signup(form.name, form.email, form.password, form.phone, form.role)
      router.push(ROLE_REDIRECT[user.role] || '/dashboard/user')
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4 py-12">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-800/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-pink-800/20 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <span className="text-5xl">🛡️</span>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Kadali
            </span>
          </Link>
          <p className="text-gray-400 text-sm mt-2">Create your account</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">
          {error && (
            <div className="bg-red-900/40 border border-red-700 text-red-300 text-sm px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1.5">Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                placeholder="Jane Doe"
                className="w-full bg-gray-800 border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1.5">Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                placeholder="you@example.com"
                className="w-full bg-gray-800 border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1.5">Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                placeholder="Min. 6 characters"
                className="w-full bg-gray-800 border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1.5">Phone (optional)</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="w-full bg-gray-800 border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-gray-300 text-sm font-medium mb-1.5">I am a…</label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full bg-gray-800 border border-gray-700 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-white rounded-lg px-4 py-2.5 text-sm outline-none transition-colors"
              >
                <option value="user">User — seeking safety coverage</option>
                <option value="volunteer">Volunteer — ready to help others</option>
              </select>
              <p className="text-gray-600 text-xs mt-1">Admin accounts are created separately.</p>
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-purple-900/30 mt-2"
            >
              {busy ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account…
                </span>
              ) : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-gray-500 text-sm mt-6">
            Already have an account?{' '}
            <Link href="/login" className="text-purple-400 hover:text-purple-300 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
