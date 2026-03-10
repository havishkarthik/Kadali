'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

/* Fix default icon paths that webpack/Next.js breaks */
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl:       'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl:     'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

/* Colored marker factory */
const MARKER_COLORS = {
  emergency:     '#EF4444',
  sos:           '#F97316',
  fall_detected: '#EAB308',
  geofence:      '#3B82F6',
  manual:        '#8B5CF6',
  device:        '#10B981',
  volunteer:     '#EC4899',
  default:       '#7C3AED',
}

function makeIcon(type) {
  const color = MARKER_COLORS[type] || MARKER_COLORS.default
  const svg = encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="24" height="36">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 24 12 24s12-15 12-24C24 5.4 18.6 0 12 0z"
        fill="${color}" stroke="white" stroke-width="1.5"/>
      <circle cx="12" cy="12" r="5" fill="white"/>
    </svg>`)
  return L.icon({
    iconUrl:     `data:image/svg+xml,${svg}`,
    iconSize:    [24, 36],
    iconAnchor:  [12, 36],
    popupAnchor: [0, -36],
  })
}

/* Recenter helper */
function Recenter({ center, zoom }) {
  const map = useMap()
  useEffect(() => {
    if (center) map.setView(center, zoom ?? map.getZoom())
  }, [center, zoom, map])
  return null
}

export default function MapInner({
  markers = [],
  center  = [20.5937, 78.9629],
  zoom    = 5,
}) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      style={{ height: '100%', width: '100%', borderRadius: '0.5rem' }}
      className="z-0"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap</a>'
      />
      <Recenter center={center} zoom={zoom} />
      {markers.map((m, i) => {
        const pos = [m.lat, m.lng]
        return (
          <Marker key={i} position={pos} icon={makeIcon(m.type)}>
            <Popup>
              <div className="min-w-[120px]">
                {m.title && <p className="font-semibold text-sm mb-1">{m.title}</p>}
                {m.info  && <p className="text-xs text-gray-600">{m.info}</p>}
              </div>
            </Popup>
          </Marker>
        )
      })}
    </MapContainer>
  )
}
