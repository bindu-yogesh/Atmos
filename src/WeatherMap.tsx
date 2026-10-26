
import { useEffect, useState } from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './WeatherMap.css'

type WeatherMapProps = {
  latitude: number
  longitude: number
  location: string
  temperature?: number
  unit: 'C' | 'F'
  dark: boolean
  onLocationSelect: (latitude: number, longitude: number) => void
}

const locationIcon = L.divIcon({
  className: 'atmos-map-marker',
  html: '<span></span>',
  iconSize: [24, 24],
  iconAnchor: [12, 12],
})

function MapClickHandler({
  onLocationSelect,
}: {
  onLocationSelect: (latitude: number, longitude: number) => void
}) {
  useMapEvents({
    click(event) {
      onLocationSelect(
        Number(event.latlng.lat.toFixed(4)),
        Number(event.latlng.lng.toFixed(4)),
      )
    },
  })

  return null
}

export default function WeatherMap({
  latitude,
  longitude,
  location,
  temperature,
  unit,
  dark,
  onLocationSelect,
}: WeatherMapProps) {
  const [mapReady, setMapReady] = useState(false)

  useEffect(() => {
    setMapReady(false)
    const timeout = window.setTimeout(() => setMapReady(true), 100)
    return () => window.clearTimeout(timeout)
  }, [latitude, longitude])

  return (
    <section className={`weather-map-panel ${dark ? 'map-dark' : 'map-light'}`}>
      <div className="weather-map-heading">
        <div>
          <span className="map-eyebrow">EXPLORE THE WORLD</span>
          <h2>Interactive weather map</h2>
          <p>Click anywhere on the map to explore local weather.</p>
        </div>

        <span className="map-live-badge">
          <span />
          LIVE WEATHER
        </span>
      </div>

      <div className="weather-map-frame">
        <MapContainer
          center={[latitude, longitude]}
          zoom={6}
          scrollWheelZoom
          className="weather-map"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          />


          <MapClickHandler onLocationSelect={onLocationSelect} />

          <Marker
            position={[latitude, longitude]}
            icon={locationIcon}
          >
            <Popup>
              <div className="map-popup">
                <strong>{location}</strong>
                {temperature !== undefined && (
                  <span>{temperature}°{unit}</span>
                )}
                <small>
                  {latitude.toFixed(3)}, {longitude.toFixed(3)}
                </small>
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        {!mapReady && <div className="map-loading">Updating map…</div>}
      </div>

      <div className="map-footer">
        <span>
          <span className="map-coordinate-dot" />
          {latitude.toFixed(4)}°, {longitude.toFixed(4)}°
        </span>
        <span>Powered by OpenStreetMap</span>
      </div>
    </section>
  )
}
