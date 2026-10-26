import WeatherMap from './WeatherMap'
import WeatherEffects from './WeatherEffects'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import {
  Activity, Cloud, CloudRain, CloudSun, Droplets, Gauge,
  LayoutDashboard, MapPin, Moon, Search, Sun, Sunrise, Sunset,
  Wind, Eye, ChevronDown, Menu, X, ArrowUpRight, Leaf,
  Thermometer, Waves, Heart, RefreshCw,
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar,
} from 'recharts'
import {
  getWeather, searchLocations, getCurrentCity, getAirQuality,
} from './services/weatherService'
import type { AirQualityResponse } from './services/weatherService'
import type { LocationResult, WeatherResponse } from './types/weather'
import './App.css'

type Coordinates = { latitude: number; longitude: number }
type Favorite = { name: string; latitude: number; longitude: number }

const DEFAULT_LOCATION = 'Bengaluru'
const DEFAULT_COORDINATES: Coordinates = {
  latitude: 12.9716,
  longitude: 77.5946,
}

const climate = [
  { month: 'Jan', rain: 4 }, { month: 'Feb', rain: 8 },
  { month: 'Mar', rain: 18 }, { month: 'Apr', rain: 45 },
  { month: 'May', rain: 110 }, { month: 'Jun', rain: 95 },
  { month: 'Jul', rain: 120 }, { month: 'Aug', rain: 140 },
  { month: 'Sep', rain: 160 }, { month: 'Oct', rain: 180 },
  { month: 'Nov', rain: 65 }, { month: 'Dec', rain: 15 },
]

function weatherDescription(code: number) {
  if (code === 0) return 'Clear sky'
  if (code === 1) return 'Mainly clear'
  if (code === 2) return 'Partly cloudy'
  if (code === 3) return 'Overcast'
  if ([45, 48].includes(code)) return 'Foggy'
  if ([51, 53, 55].includes(code)) return 'Drizzle'
  if ([56, 57].includes(code)) return 'Freezing drizzle'
  if ([61, 63, 65].includes(code)) return 'Rain'
  if ([66, 67].includes(code)) return 'Freezing rain'
  if ([71, 73, 75, 77].includes(code)) return 'Snow'
  if ([80, 81, 82].includes(code)) return 'Rain showers'
  if ([85, 86].includes(code)) return 'Snow showers'
  if ([95, 96, 99].includes(code)) return 'Thunderstorm'
  return 'Weather conditions unavailable'
}

function weatherIcon(code: number, size = 25) {
  if (code === 0 || code === 1) return <Sun size={size} />
  if (code === 2) return <CloudSun size={size} />
  if ((code >= 51 && code <= 82) || code >= 95) {
    return <CloudRain size={size} />
  }
  if ([3, 45, 48].includes(code)) return <Cloud size={size} />
  return <CloudSun size={size} />
}

function formatHour(value: string) {
  return new Date(value).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    hour12: true,
  })
}

function formatTime(value?: string) {
  if (!value) return '--:--'
  return new Date(value).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })
}

function getAqiLabel(aqi: number | null | undefined) {
  if (aqi == null) return 'Unavailable'
  if (aqi <= 50) return 'Good'
  if (aqi <= 100) return 'Moderate'
  if (aqi <= 150) return 'Sensitive groups'
  if (aqi <= 200) return 'Unhealthy'
  if (aqi <= 300) return 'Very unhealthy'
  return 'Hazardous'
}

function getAqiTone(aqi: number | null | undefined) {
  if (aqi == null) return 'neutral'
  if (aqi <= 50) return 'good'
  if (aqi <= 100) return 'moderate'
  if (aqi <= 150) return 'sensitive'
  if (aqi <= 200) return 'unhealthy'
  if (aqi <= 300) return 'very-unhealthy'
  return 'hazardous'
}

function toDisplayTemperature(celsius: number, unit: 'C' | 'F') {
  return Math.round(unit === 'C' ? celsius : celsius * 9 / 5 + 32)
}

function readFavorites(): Favorite[] {
  try {
    const saved = localStorage.getItem('atmos-favorite-cities')
    if (!saved) return []

    const parsed: unknown = JSON.parse(saved)
    if (!Array.isArray(parsed)) return []

    return parsed.filter(
      (item): item is Favorite =>
        item !== null &&
        typeof item === 'object' &&
        typeof item.name === 'string' &&
        typeof item.latitude === 'number' &&
        typeof item.longitude === 'number',
    )
  } catch {
    return []
  }
}

function App() {
  const [dark, setDark] = useState(true)
  const [unit, setUnit] = useState<'C' | 'F'>('C')
  const [menuOpen, setMenuOpen] = useState(false)
  const [location, setLocation] = useState(DEFAULT_LOCATION)
  const [search, setSearch] = useState('')
  const [coordinates, setCoordinates] =
    useState<Coordinates>(DEFAULT_COORDINATES)
  const [weather, setWeather] = useState<WeatherResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')
  const [airQuality, setAirQuality] =
    useState<AirQualityResponse | null>(null)
  const [airQualityLoading, setAirQualityLoading] = useState(true)
  const [airQualityError, setAirQualityError] = useState('')
  const [favorites, setFavorites] = useState<Favorite[]>(readFavorites)
  const [favoritesOpen, setFavoritesOpen] = useState(false)

  useEffect(() => {
    try {
      localStorage.setItem(
        'atmos-favorite-cities',
        JSON.stringify(favorites),
      )
    } catch {
      // The dashboard remains usable if browser storage is unavailable.
    }
  }, [favorites])

  // Detect the device location on startup.
  useEffect(() => {
    let cancelled = false

    if (!navigator.geolocation) {
      setLocation(DEFAULT_LOCATION)
      setError('Location detection is unavailable. Showing Bengaluru weather.')
      return
    }

    navigator.geolocation.getCurrentPosition(
      async position => {
        if (cancelled) return

        const latitude = position.coords.latitude
        const longitude = position.coords.longitude

        setCoordinates({ latitude, longitude })
        setLocation('Your current location')

        try {
          const city = await getCurrentCity(latitude, longitude)
          if (!cancelled) setLocation(city)
        } catch {
          if (!cancelled) setLocation('Your current location')
        }
      },
      () => {
        if (!cancelled) {
          setLocation(DEFAULT_LOCATION)
          setError('Location access was unavailable. Showing Bengaluru weather.')
        }
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      },
    )

    return () => {
      cancelled = true
    }
  }, [])

  // Fetch weather whenever the selected coordinates change.
  useEffect(() => {
    let cancelled = false

    async function loadWeather() {
      setLoading(true)

      try {
        const data = await getWeather(
          coordinates.latitude,
          coordinates.longitude,
        )

        if (!cancelled) {
          setWeather(data)
          setError('')
        }
      } catch {
        if (!cancelled) {
          setError(
            'Unable to load live weather. Check your internet connection.',
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadWeather()

    return () => {
      cancelled = true
    }
  }, [coordinates])

  // Fetch air quality independently of weather.
  useEffect(() => {
    let cancelled = false

    async function loadAirQuality() {
      setAirQualityLoading(true)
      setAirQualityError('')

      try {
        const data = await getAirQuality(
          coordinates.latitude,
          coordinates.longitude,
        )

        if (!cancelled) setAirQuality(data)
      } catch {
        if (!cancelled) {
          setAirQuality(null)
          setAirQualityError(
            'Air quality data is temporarily unavailable. Weather data is unaffected.',
          )
        }
      } finally {
        if (!cancelled) setAirQualityLoading(false)
      }
    }

    void loadAirQuality()

    return () => {
      cancelled = true
    }
  }, [coordinates])

  async function handleSearch() {
    const query = search.trim()
    if (!query || searching) return

    setSearching(true)
    setError('')

    try {
      const results: LocationResult[] = await searchLocations(query)

      if (!results.length) {
        setError('Location not found. Try another city name.')
        return
      }

      selectLocation(results[0])
      setSearch('')
      setFavoritesOpen(false)
    } catch {
      setError('Location search failed. Check your internet connection.')
    } finally {
      setSearching(false)
    }
  }

  function selectLocation(place: LocationResult | Favorite) {
    setLocation(
      'country' in place && place.country
        ? `${place.name}, ${place.country}`
        : place.name,
    )

    setCoordinates({
      latitude: place.latitude,
      longitude: place.longitude,
    })

    setError('')
    setMenuOpen(false)
  }

  function detectLocationAgain() {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser.')
      return
    }

    setError('')
    setLocation('Detecting your location...')

    navigator.geolocation.getCurrentPosition(
      async position => {
        const latitude = position.coords.latitude
        const longitude = position.coords.longitude

        setCoordinates({ latitude, longitude })
        setLocation('Your current location')

        try {
          const city = await getCurrentCity(latitude, longitude)
          setLocation(city)
        } catch {
          setLocation('Your current location')
        }
      },
      () => {
        setError(
          'Could not access your location. Check your browser permissions.',
        )
        setLocation(DEFAULT_LOCATION)
        setCoordinates(DEFAULT_COORDINATES)
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      },
    )
  }

  function toggleFavorite() {
    const exists = favorites.some(
      item =>
        item.latitude === coordinates.latitude &&
        item.longitude === coordinates.longitude,
    )

    if (exists) {
      setFavorites(items =>
        items.filter(
          item =>
            item.latitude !== coordinates.latitude ||
            item.longitude !== coordinates.longitude,
        ),
      )
    } else {
      setFavorites(items => [
        ...items,
        {
          name: location,
          latitude: coordinates.latitude,
          longitude: coordinates.longitude,
        },
      ])
    }
  }

  const isFavorite = favorites.some(
    item =>
      item.latitude === coordinates.latitude &&
      item.longitude === coordinates.longitude,
  )

  const current = weather?.current
  const today = weather?.daily
  const hourlyData = weather?.hourly

  // Use the actual current weather code to select the background.
  const weatherCode = current?.weather_code
  const weatherTheme = !current
    ? 'weather-default'
    : weatherCode !== undefined && [95, 96, 99].includes(weatherCode)
      ? 'weather-storm'
      : weatherCode !== undefined &&
          [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)
        ? 'weather-rain'
        : weatherCode !== undefined && [45, 48, 3].includes(weatherCode)
          ? 'weather-cloudy'
          : weatherCode !== undefined && [1, 2].includes(weatherCode)
            ? 'weather-partly-cloudy'
            : weatherCode === 0
              ? current.is_day
                ? 'weather-sunny'
                : 'weather-night'
              : 'weather-cloudy'

  const hourly = hourlyData && current
    ? hourlyData.time
        .map((time, index) => ({
          time,
          label: time === current.time ? 'Now' : formatHour(time),
          temp: hourlyData.temperature_2m[index],
          rain: hourlyData.precipitation_probability[index] ?? 0,
        }))
        .filter(item => item.time >= current.time)
        .slice(0, 8)
    : []

  const weekly = today
    ? today.time.map((date, index) => ({
        day:
          index === 0
            ? 'Today'
            : new Date(`${date}T12:00:00`).toLocaleDateString('en-IN', {
                weekday: 'short',
              }),
        date,
        high: toDisplayTemperature(today.temperature_2m_max[index], unit),
        low: toDisplayTemperature(today.temperature_2m_min[index], unit),
        code: today.weather_code[index],
      }))
    : []

  const temperature = current
    ? toDisplayTemperature(current.temperature_2m, unit)
    : null

  const feelsLike = current
    ? toDisplayTemperature(current.apparent_temperature, unit)
    : null

  const aqi = airQuality?.current.us_aqi
  const pm25 = airQuality?.current.pm2_5
  const pm10 = airQuality?.current.pm10
  const aqiLabel = getAqiLabel(aqi)
  const airQualityTime = airQuality?.current.time
    ? formatTime(airQuality.current.time)
    : null

  return (
  <div className={`app-shell ${dark ? 'dark' : 'light'} ${weatherTheme}`}>
    <WeatherEffects
      code={weatherCode}
      isDay={current?.is_day === 1}
    />

    <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-icon"><CloudSun size={23} /></div>
          <span>atmos<span className="brand-dot">.</span></span>
          <button
            className="mobile-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <X />
          </button>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <nav className="nav-list">
          <button
            className="nav-item active"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <LayoutDashboard size={18} /> Overview
          </button>
          <button
            className="nav-item"
            onClick={() =>
              document.querySelector('.weather-hero')?.scrollIntoView({
                behavior: 'smooth',
              })
            }
          >
            <Cloud size={18} /> Weather <span className="nav-arrow">↗</span>
          </button>
          <button
            className="nav-item"
            onClick={() =>
              document.getElementById('climate')?.scrollIntoView({
                behavior: 'smooth',
              })
            }
          >
            <Activity size={18} /> Climate analytics
          </button>
          <button
            className="nav-item"
            onClick={() =>
              document.querySelector('.air-section')?.scrollIntoView({
                behavior: 'smooth',
              })
            }
          >
            <Wind size={18} /> Air quality
          </button>
        </nav>

        <div className="workspace-label second-label">PREFERENCES</div>

        <nav className="nav-list">
          <button className="nav-item" onClick={detectLocationAgain}>
            <MapPin size={18} /> Detect my location
          </button>
          <button
            className="nav-item"
            onClick={() => setDark(value => !value)}
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
            {dark ? 'Light appearance' : 'Dark appearance'}
          </button>
          <button
            className="nav-item"
            onClick={() => setFavoritesOpen(value => !value)}
          >
            <Heart size={18} /> Saved cities
            <span className="favorite-count">{favorites.length}</span>
          </button>
        </nav>

        {favoritesOpen && (
          <div className="favorites-list">
            <div className="favorites-heading">YOUR CITIES</div>
            {favorites.length === 0 && (
              <p>No saved cities yet. Use the heart on the weather card.</p>
            )}
            {favorites.map(city => (
              <div
                className="favorite-row"
                key={`${city.latitude}-${city.longitude}`}
              >
                <button onClick={() => selectLocation(city)}>
                  {city.name}
                </button>
                <button
                  aria-label={`Remove ${city.name}`}
                  onClick={() =>
                    setFavorites(items => items.filter(item => item !== city))
                  }
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <div className="upgrade-symbol"><Activity size={19} /></div>
            <strong>Climate, decoded.</strong>
            <p>Explore patterns beyond today's forecast.</p>
            <button
              onClick={() =>
                document.getElementById('climate')?.scrollIntoView({
                  behavior: 'smooth',
                })
              }
            >
              Explore insights <ArrowUpRight size={15} />
            </button>
          </div>

          <div className="profile">
            <div className="avatar">A</div>
            <div className="profile-info">
              <strong>Atmos Explorer</strong>
              <span>Personal workspace</span>
            </div>
            <ChevronDown size={16} />
          </div>
        </div>
      </aside>

      {menuOpen && (
        <button
          className="mobile-backdrop"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <main className="main-content">
        <header className="topbar">
          <button
            className="menu-toggle"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
          >
            <Menu />
          </button>

          <div className="breadcrumb">
            Workspace <span>/</span> <strong>Overview</strong>
          </div>

          <div className="topbar-actions">
            <form
              className="search-box"
              onSubmit={event => {
                event.preventDefault()
                void handleSearch()
              }}
            >
              <Search size={16} />
              <input
                value={search}
                onChange={event => setSearch(event.target.value)}
                placeholder="Search any city..."
                aria-label="Search for a city"
              />
              <button
                type="submit"
                disabled={searching || !search.trim()}
              >
                {searching ? '...' : 'Go'}
              </button>
            </form>

            <button
              className="unit-toggle"
              onClick={() =>
                setUnit(value => value === 'C' ? 'F' : 'C')
              }
              aria-label="Toggle temperature units"
            >
              °{unit}
            </button>

            <button
              className="theme-toggle"
              onClick={() => setDark(value => !value)}
              aria-label="Toggle theme"
            >
              {dark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="live-status">
              <span className={loading ? 'status-loading' : ''} />
              {loading ? 'Updating' : weather ? 'Live weather' : 'Unavailable'}
            </div>
          </div>
        </header>

        <div className="dashboard">
          <section className="welcome-row">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-line" /> YOUR CLIMATE, AT A GLANCE
              </div>
              <h1>Weather, decoded<span className="heading-period">.</span></h1>
              <p className="subtitle">A clearer picture of the world outside.</p>
            </div>

            <button
              type="button"
              className="location-button"
              onClick={detectLocationAgain}
              title="Detect your current location"
            >
              <MapPin size={16} /> {location} <ChevronDown size={15} />
            </button>
          </section>

          {error && (
            <div role="alert" className="error-banner">
              <span>{error}</span>
              <button className="text-button" onClick={() => setError('')}>
                Dismiss <X size={14} />
              </button>
            </div>
          )}

          {loading && !weather && (
            <div className="panel loading-panel">
              <span className="loading-orb" /> Fetching current weather...
            </div>
          )}

          <section className="hero-grid">
            <div className="weather-hero panel">
              <div className="hero-topline">
                <span><MapPin size={14} /> {location}</span>
                <div className="hero-actions">
                  <span className="demo-pill">
                    {weather ? 'LIVE DATA' : 'WAITING FOR DATA'}
                  </span>
                  <button
                    className={`favorite-button ${isFavorite ? 'is-favorite' : ''}`}
                    onClick={toggleFavorite}
                    aria-label={
                      isFavorite ? 'Remove from saved cities' : 'Save this city'
                    }
                    title={isFavorite ? 'Remove saved city' : 'Save city'}
                  >
                    <Heart
                      size={18}
                      fill={isFavorite ? 'currentColor' : 'none'}
                    />
                  </button>
                </div>
              </div>

              <div className="hero-main">
                <div>
                  <div className="temperature">
                    {temperature ?? '--'}<span>°{unit}</span>
                  </div>
                  <div className="weather-description">
                    {current
                      ? weatherDescription(current.weather_code)
                      : 'Weather unavailable'}
                  </div>
                  <div className="feels-like">
                    Feels like {feelsLike ?? '--'}°{unit}
                    <span> · </span>
                    H: {today
                      ? toDisplayTemperature(today.temperature_2m_max[0], unit)
                      : '--'}°
                    {' '}L: {today
                      ? toDisplayTemperature(today.temperature_2m_min[0], unit)
                      : '--'}°
                  </div>
                </div>
                <div className="weather-illustration">
                  {weatherIcon(weatherCode ?? 2, 100)}
                </div>
              </div>

              <div className="hero-divider" />

              <div className="sun-times">
                <div>
                  <Sunrise size={18} /><span>Sunrise</span>
                  <strong>{formatTime(today?.sunrise[0])}</strong>
                </div>
                <div>
                  <Sunset size={18} /><span>Sunset</span>
                  <strong>{formatTime(today?.sunset[0])}</strong>
                </div>
                <div>
                  <Sun size={18} /><span>UV index</span>
                  <strong>{current ? current.uv_index.toFixed(1) : '--'}</strong>
                </div>
              </div>
            </div>

            <div className="conditions-grid">
              <Metric icon={<Droplets />} label="Humidity" value={current ? String(current.relative_humidity_2m) : '--'} unit="%" detail="Relative humidity" tone="blue" />
              <Metric icon={<Wind />} label="Wind speed" value={current ? String(Math.round(current.wind_speed_10m)) : '--'} unit="km/h" detail="Current wind" tone="green" />
              <Metric icon={<Wind />} label="Wind gusts" value={current ? String(Math.round(current.wind_gusts_10m)) : '--'} unit="km/h" detail="Estimated peak gust" tone="purple" />
              <Metric icon={<Eye />} label="Visibility" value={current ? (current.visibility / 1000).toFixed(1) : '--'} unit="km" detail="Horizontal visibility" tone="blue" />
              <Metric icon={<Gauge />} label="Pressure" value={current ? String(Math.round(current.pressure_msl)) : '--'} unit="hPa" detail="Sea-level pressure" tone="orange" />
            </div>
          </section>
          <WeatherMap
            latitude={coordinates.latitude}
            longitude={coordinates.longitude}
            location={location}
            temperature={temperature ?? undefined}
            unit={unit}
            dark={dark}
            onLocationSelect={(latitude, longitude) => {
              setCoordinates({ latitude, longitude })
              setLocation('Selected map location')
              setError('')
            }}
          />
          <section className="section-block">
            <div className="section-heading">
              <div>
                <div className="section-kicker">THE NEXT FEW HOURS</div>
                <h2>Weather timeline</h2>
              </div>
              <span className="chart-note">
                {loading ? 'Updating...' : 'Live hourly outlook'}
              </span>
            </div>

            <div className="panel chart-panel">
              <div className="chart-legend">
                <span><i className="legend-temp" /> Temperature</span>
                <span className="chart-note">
                  Temperature °{unit} · Rain probability %
                </span>
              </div>

              <div className="hourly-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourly} margin={{ top: 14, right: 8, left: -24, bottom: 0 }}>
                    <defs>
                      <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="var(--chart-accent)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--chart-accent)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 5" vertical={false} stroke="var(--grid)" />
                    <XAxis dataKey="label" tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={value => `${toDisplayTemperature(value, unit)}°`} />
                    <Tooltip contentStyle={{ background: 'var(--tooltip-bg)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)' }} formatter={value => [`${toDisplayTemperature(Number(value), unit)}°${unit}`, 'Temperature']} />
                    <Area type="monotone" dataKey="temp" name="Temperature" stroke="var(--chart-accent)" strokeWidth={2.5} fill="url(#tempGradient)" activeDot={{ r: 5 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="hourly-strip">
                {hourly.slice(0, 6).map(item => (
                  <div key={item.time} className="hour-item">
                    <span>{item.label}</span>
                    {weatherIcon(weatherCode ?? 2, 20)}
                    <strong>{toDisplayTemperature(item.temp, unit)}°</strong>
                    <small><Droplets size={11} /> {item.rain}%</small>
                  </div>
                ))}
                {hourly.length === 0 && (
                  <p>Hourly forecast will appear when weather data loads.</p>
                )}
              </div>
            </div>
          </section>

          <section className="lower-grid">
            <div className="section-block">
              <div className="section-heading">
                <div>
                  <div className="section-kicker">PLAN AHEAD</div>
                  <h2>7-day forecast</h2>
                </div>
                <span className="chart-note">Live forecast</span>
              </div>

              <div className="panel weekly-panel">
                {weekly.map((day, index) => (
                  <div className="week-row" key={day.date}>
                    <span className="week-day">{index === 0 ? 'Today' : day.day}</span>
                    <span className="week-icon">{weatherIcon(day.code)}</span>
                    <div className="week-range">
                      <span>{day.low}°</span>
                      <div className="range-track">
                        <div
                          style={{
                            left: `${Math.max(0, (day.low - (unit === 'C' ? 0 : 32)) * 2)}%`,
                            width: `${Math.max(8, (day.high - day.low) * 2)}%`,
                          }}
                        />
                      </div>
                      <strong>{day.high}°</strong>
                    </div>
                  </div>
                ))}
                {weekly.length === 0 && (
                  <p className="empty-state">Forecast will appear when data loads.</p>
                )}
              </div>
            </div>

            <div className="section-block" id="climate">
              <div className="section-heading">
                <div>
                  <div className="section-kicker">LONG-TERM PATTERNS</div>
                  <h2>Rainfall by month</h2>
                </div>
                <span className="chart-note">Illustrative sample</span>
              </div>

              <div className="panel rainfall-panel">
                <div className="rainfall-summary">
                  <div>
                    <span className="muted-label">Sample annual total</span>
                    <strong>1,060 <small>mm</small></strong>
                  </div>
                  <div className="rainfall-tag">
                    <Waves size={14} /> Seasonal trend
                  </div>
                </div>

                <div className="rainfall-chart">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={climate} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 5" vertical={false} stroke="var(--grid)" />
                      <XAxis dataKey="month" tick={{ fill: 'var(--muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: 'var(--muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ background: 'var(--tooltip-bg)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)' }} />
                      <Bar dataKey="rain" name="Sample rainfall (mm)" fill="var(--chart-accent)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                <div className="insight-box">
                  <div className="insight-icon"><Activity size={17} /></div>
                  <p>
                    <strong>Climate insight</strong><br />
                    These rainfall figures are illustrative, not live historical measurements.
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="section-block air-section">
            <div className="section-heading">
              <div>
                <div className="section-kicker">BREATHE EASIER</div>
                <h2>Air quality snapshot</h2>
              </div>
              <span className="chart-note">
                {airQualityLoading
                  ? 'Updating air quality...'
                  : airQuality
                    ? 'Open-Meteo air-quality data'
                    : 'Data unavailable'}
              </span>
            </div>

            {airQualityError && (
              <div className="error-banner" role="status">{airQualityError}</div>
            )}

            <div className="air-grid">
              <div className={`panel aqi-card aqi-${getAqiTone(aqi)}`}>
                <div className="aqi-top">
                  <div>
                    <span className="muted-label">US Air Quality Index</span>
                    <div className="aqi-number">{aqi ?? '--'} <span>/ 500</span></div>
                  </div>
                  <span className="aqi-badge">{aqiLabel}</span>
                </div>

                <div className="aqi-track">
                  <div style={{ width: `${Math.min(100, Math.max(0, (aqi ?? 0) / 5))}%` }} />
                </div>
                <div className="aqi-scale">
                  <span>Good</span><span>Moderate</span><span>Poor</span>
                </div>
                <p>
                  {aqi == null
                    ? 'Air quality data is not available for this location right now.'
                    : `Estimated air quality for ${location}.`}
                </p>
                {airQualityTime && (
                  <p className="chart-note">Data time: {airQualityTime}</p>
                )}
              </div>

              <Metric icon={<Activity />} label="PM2.5" value={pm25 == null ? '--' : pm25.toFixed(1)} unit="µg/m³" detail="Fine particulate matter" tone="green" />
              <Metric icon={<Leaf />} label="PM10" value={pm10 == null ? '--' : pm10.toFixed(1)} unit="µg/m³" detail="Coarse particulate matter" tone="blue" />
              <Metric icon={<Thermometer />} label="UV exposure" value={current ? current.uv_index.toFixed(1) : '--'} unit="UV index" detail="Live weather forecast" tone="orange" />
            </div>

            <p className="chart-note air-disclaimer">
              Air-quality values are model-based estimates, not necessarily readings from a nearby monitoring station.
            </p>
          </section>

          <footer className="footer">
            <div className="footer-brand"><CloudSun size={17} /> atmos<span>.</span></div>
            <span>Climate intelligence, made clearer.</span>
            <span>{weather ? 'Weather powered by Open-Meteo' : 'Waiting for weather data'}</span>
            <button
              className="refresh-button"
              onClick={() => setCoordinates(value => ({ ...value }))}
              title="Refresh weather"
            >
              <RefreshCw size={14} /> Refresh
            </button>
          </footer>
        </div>
      </main>
    </div>
  )
}

function Metric({
  icon, label, value, unit, detail, tone,
}: {
  icon: ReactNode
  label: string
  value: string
  unit: string
  detail: string
  tone: string
}) {
  return (
    <div className="panel metric-card">
      <div className={`metric-icon ${tone}`}>{icon}</div>
      <span className="metric-label">{label}</span>
      <div className="metric-value">{value}<small> {unit}</small></div>
      <div className="metric-detail"><span />{detail}</div>
    </div>
  )
}

export default App
