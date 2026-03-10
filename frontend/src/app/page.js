'use client'

import Link from 'next/link'

function Feature({ icon, title, desc }) {
  return (
    <div className="bg-gray-900/60 border border-gray-800 hover:border-purple-700 rounded-2xl p-6 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/20">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
    </div>
  )
}

function Stat({ value, label }) {
  return (
    <div className="text-center">
      <p className="text-4xl font-extrabold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{value}</p>
      <p className="text-gray-400 text-sm mt-1">{label}</p>
    </div>
  )
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* ── Navbar ───────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur border-b border-gray-900">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🛡️</span>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Kadali
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login"
              className="text-gray-300 hover:text-white text-sm px-4 py-2 rounded-lg transition-colors">
              Login
            </Link>
            <Link href="/signup"
              className="bg-purple-600 hover:bg-purple-500 text-white text-sm px-4 py-2 rounded-lg transition-colors font-medium">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-24 pb-32 px-6">
        {/* Background glow */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-700/20 rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/4 w-80 h-80 bg-pink-700/20 rounded-full blur-3xl" />
        </div>

        <div className="max-w-4xl mx-auto text-center">
          {/* Floating shield */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500/30 rounded-full animate-pulse-ring" />
              <div className="relative bg-gradient-to-br from-purple-600 to-pink-600 w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-2xl shadow-purple-900/60 animate-float">
                🛡️
              </div>
            </div>
          </div>

          <h1 className="text-5xl sm:text-6xl font-extrabold leading-tight mb-6 animate-fade-in-up">
            <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-300 bg-clip-text text-transparent">
              Protecting Women,
            </span>
            <br />
            <span className="text-white">Connecting Communities</span>
          </h1>

          <p className="text-gray-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Real-time safety monitoring, instant emergency alerts, and a dedicated volunteer network — all in one platform built for women's safety.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold px-8 py-3.5 rounded-xl shadow-lg shadow-purple-900/40 transition-all hover:scale-105">
              Get Started Free
            </Link>
            <a href="#features"
              className="border border-gray-700 hover:border-purple-500 text-gray-300 hover:text-white font-medium px-8 py-3.5 rounded-xl transition-all">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────── */}
      <section id="features" className="py-20 px-6 bg-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Everything you need to stay safe
            </h2>
            <p className="text-gray-400 text-base max-w-xl mx-auto">
              Kadali combines hardware, software, and community to create a complete safety ecosystem.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Feature icon="🛡️" title="Real-time Tracking"
              desc="Monitor device locations live on an interactive map with instant location updates." />
            <Feature icon="🚨" title="Emergency Alerts"
              desc="Trigger SOS alerts in one tap. Volunteers are notified instantly with your location." />
            <Feature icon="👥" title="Volunteer Network"
              desc="A community of trained volunteers ready to respond whenever an alert is raised." />
            <Feature icon="📱" title="Device Monitoring"
              desc="Track battery levels, connectivity, and device health across your entire fleet." />
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-gray-900/40">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-14">
            How It Works
          </h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { step: '01', icon: '📡', title: 'Device Detects Emergency', desc: 'Wearable sensors automatically detect falls, unusual motion, or manual SOS triggers.' },
              { step: '02', icon: '📢', title: 'Alert Sent to Network',    desc: 'An instant alert with GPS coordinates is broadcast to all nearby volunteers and admins.' },
              { step: '03', icon: '🏃', title: 'Help Arrives Fast',        desc: 'The nearest volunteer acknowledges, responds, and reaches the person in distress.' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="text-center relative">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-700 to-pink-700 text-3xl mb-5 shadow-lg shadow-purple-900/40">
                  {icon}
                </div>
                <div className="absolute top-0 right-1/2 translate-x-1/2 -translate-y-2 text-xs font-bold text-purple-500 bg-gray-900 px-2 rounded-full border border-purple-800">
                  {step}
                </div>
                <h3 className="text-white font-semibold text-base mb-2">{title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-gradient-to-r from-purple-900/30 to-pink-900/30">
        <div className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-8">
          <Stat value="1,000+" label="Protected Users"  />
          <Stat value="500+"   label="Active Volunteers" />
          <Stat value="99.9%"  label="Uptime"           />
          <Stat value="24/7"   label="Support"          />
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer className="bg-gray-950 border-t border-gray-900 py-8 px-6 text-center">
        <p className="text-gray-600 text-sm">
          © 2024 Kadali — Women&apos;s Safety Platform. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
