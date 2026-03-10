'use client'

import dynamic from 'next/dynamic'

/* Dynamically load the actual map to avoid SSR issues with Leaflet */
const MapInner = dynamic(() => import('./MapInner'), { ssr: false, loading: () => (
  <div className="w-full h-full bg-gray-800 rounded-lg flex items-center justify-center">
    <p className="text-gray-400 text-sm">Loading map…</p>
  </div>
) })

export default function MapView({ markers = [], center, zoom }) {
  return <MapInner markers={markers} center={center} zoom={zoom} />
}
