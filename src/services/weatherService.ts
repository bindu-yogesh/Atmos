
import type {
  LocationResult,
  WeatherResponse,
} from '../types/weather'

const WEATHER_API =
  'https://api.open-meteo.com/v1/forecast'

const GEOCODING_API =
  'https://geocoding-api.open-meteo.com/v1/search'

const AIR_QUALITY_API =
  'https://air-quality-api.open-meteo.com/v1/air-quality'

export interface AirQualityResponse {
  current: {
    time: string
    us_aqi: number | null
    pm2_5: number | null
    pm10: number | null
  }
  hourly: {
    time: string[]
    us_aqi: (number | null)[]
    pm2_5: (number | null)[]
    pm10: (number | null)[]
  }
}

export async function searchLocations(
  name: string
): Promise<LocationResult[]> {
  const params = new URLSearchParams({
    name,
    count: '5',
    language: 'en',
    format: 'json',
  })

  const response = await fetch(
    `${GEOCODING_API}?${params}`
  )

  if (!response.ok) {
    throw new Error('Unable to search for locations.')
  }

  const data = await response.json()

  return (data.results ?? []).map(
    (place: {
      name: string
      country?: string
      latitude: number
      longitude: number
      timezone?: string
    }) => ({
      name: place.name,
      country: place.country ?? '',
      latitude: place.latitude,
      longitude: place.longitude,
      timezone: place.timezone ?? 'auto',
    })
  )
}

export async function getWeather(
  latitude: number,
  longitude: number
): Promise<WeatherResponse> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    timezone: 'auto',
    forecast_days: '7',

    hourly: [
      'temperature_2m',
      'precipitation_probability',
      'relative_humidity_2m',
      'uv_index',
    ].join(','),

    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'sunrise',
      'sunset',
      'precipitation_sum',
      'uv_index_max',
    ].join(','),

    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'weather_code',
      'cloud_cover',
      'pressure_msl',
      'wind_speed_10m',
      'wind_gusts_10m',
      'wind_direction_10m',
      'uv_index',
      'visibility',
    ].join(','),
  })

  const response = await fetch(
    `${WEATHER_API}?${params}`
  )

  if (!response.ok) {
    throw new Error(
      'Unable to fetch weather data. Please try again.'
    )
  }

  return response.json() as Promise<WeatherResponse>
}

export async function getAirQuality(
  latitude: number,
  longitude: number
): Promise<AirQualityResponse> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    timezone: 'auto',
    forecast_days: '1',
    current: 'us_aqi,pm2_5,pm10',
    hourly: 'us_aqi,pm2_5,pm10',
  })

  const response = await fetch(
    `${AIR_QUALITY_API}?${params}`
  )

  if (!response.ok) {
    throw new Error(
      'Air quality data is unavailable.'
    )
  }

  return response.json() as Promise<AirQualityResponse>
}

export async function getCurrentCity(
  latitude: number,
  longitude: number
): Promise<string> {
  const params = new URLSearchParams({
    lat: String(latitude),
    lon: String(longitude),
    format: 'json',
  })

  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?${params}`
  )

  if (!response.ok) {
    throw new Error('Unable to identify your location.')
  }

  const data = await response.json()
  const address = data.address ?? {}

  return (
    address.city ||
    address.town ||
    address.village ||
    address.municipality ||
    address.county ||
    'Your current location'
  )
}
