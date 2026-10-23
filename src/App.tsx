
import { useState } from 'react'
import {
  Activity, Cloud, CloudRain, CloudSun, Droplets, Gauge,
  LayoutDashboard, MapPin, Moon, Search, Settings, Sun,
  Sunrise, Sunset, Wind, Eye, ChevronDown, Menu, X,
  ArrowUpRight, Leaf, Thermometer, Waves
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, BarChart, Bar
} from 'recharts'
import './App.css'

const hourly = [
  { time: 'Now', temp: 24, rain: 10 },
  { time: '10 AM', temp: 26, rain: 5 },
  { time: '11 AM', temp: 28, rain: 0 },
  { time: '12 PM', temp: 29, rain: 0 },
  { time: '1 PM', temp: 30, rain: 0 },
  { time: '2 PM', temp: 29, rain: 15 },
  { time: '3 PM', temp: 27, rain: 35 },
  { time: '4 PM', temp: 26, rain: 20 },
]

const weekly = [
  { day: 'Mon', high: 29, low: 20 },
  { day: 'Tue', high: 28, low: 19 },
  { day: 'Wed', high: 30, low: 21 },
  { day: 'Thu', high: 27, low: 20 },
  { day: 'Fri', high: 29, low: 19 },
  { day: 'Sat', high: 28, low: 20 },
  { day: 'Sun', high: 30, low: 21 },
]

const climate = [
  { month: 'Jan', rain: 4 },
  { month: 'Feb', rain: 8 },
  { month: 'Mar', rain: 18 },
  { month: 'Apr', rain: 45 },
  { month: 'May', rain: 110 },
  { month: 'Jun', rain: 95 },
  { month: 'Jul', rain: 120 },
  { month: 'Aug', rain: 140 },
  { month: 'Sep', rain: 160 },
  { month: 'Oct', rain: 180 },
  { month: 'Nov', rain: 65 },
  { month: 'Dec', rain: 15 },
]

function App() {
  const [dark, setDark] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [location, setLocation] = useState('Bengaluru')
  const [search, setSearch] = useState('')

  return (
    <div className={`app-shell ${dark ? 'dark' : 'light'}`}>
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <div className="brand">
          <div className="brand-icon"><CloudSun size={23} /></div>
          <span>atmos<span className="brand-dot">.</span></span>
          <button className="mobile-close" onClick={() => setMenuOpen(false)} aria-label="Close menu"><X /></button>
        </div>

        <div className="workspace-label">WORKSPACE</div>
        <nav className="nav-list">
          <button className="nav-item active"><LayoutDashboard size={18} /> Overview</button>
          <button className="nav-item"><Cloud size={18} /> Weather <span className="nav-arrow">↗</span></button>
          <button className="nav-item"><Activity size={18} /> Climate analytics</button>
          <button className="nav-item"><Wind size={18} /> Air quality</button>
        </nav>

        <div className="workspace-label second-label">PREFERENCES</div>
        <nav className="nav-list">
          <button className="nav-item"><MapPin size={18} /> Saved locations</button>
          <button className="nav-item"><Settings size={18} /> Settings</button>
        </nav>

        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <div className="upgrade-symbol"><Activity size={19} /></div>
            <strong>Climate, decoded.</strong>
            <p>Explore patterns beyond today's forecast.</p>
            <button onClick={() => document.getElementById('climate')?.scrollIntoView({ behavior: 'smooth' })}>Explore insights <ArrowUpRight size={15} /></button>
          </div>
          <div className="profile">
            <div className="avatar">A</div>
            <div className="profile-info"><strong>Atmos Explorer</strong><span>Personal workspace</span></div>
            <ChevronDown size={16} />
          </div>
        </div>
      </aside>

      {menuOpen && <button className="mobile-backdrop" aria-label="Close menu" onClick={() => setMenuOpen(false)} />}

      <main className="main-content">
        <header className="topbar">
          <button className="menu-toggle" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu /></button>
          <div className="breadcrumb">Workspace <span>/</span> <strong>Overview</strong></div>
          <div className="topbar-actions">
            <div className="search-box">
              <Search size={16} />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search location..." onKeyDown={e => {
                if (e.key === 'Enter' && search.trim()) {
                  setLocation(search.trim())
                  setSearch('')
                }
              }} />
              <kbd>↵</kbd>
            </div>
            <button className="theme-toggle" onClick={() => setDark(!dark)} aria-label="Toggle theme">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
            <div className="live-status"><span /> Demo mode</div>
          </div>
        </header>

        <div className="dashboard">
          <section className="welcome-row">
            <div>
              <div className="eyebrow"><span className="eyebrow-line" /> YOUR CLIMATE, AT A GLANCE</div>
              <h1>Good morning<span className="heading-period">.</span></h1>
              <p className="subtitle">A clearer picture of the world outside.</p>
            </div>
            <button className="location-button"><MapPin size={16} /> {location} <ChevronDown size={15} /></button>
          </section>

          <section className="hero-grid">
            <div className="weather-hero panel">
              <div className="hero-topline"><span><MapPin size={14} /> {location}, India</span><span className="demo-pill">SAMPLE DATA</span></div>
              <div className="hero-main">
                <div>
                  <div className="temperature">24<span>°</span></div>
                  <div className="weather-description">Partly cloudy</div>
                  <div className="feels-like">Feels like 26° <span>·</span> H: 29° L: 20°</div>
                </div>
                <div className="weather-illustration"><CloudSun size={100} strokeWidth={1.1} /></div>
              </div>
              <div className="hero-divider" />
              <div className="sun-times">
                <div><Sunrise size={18} /><span>Sunrise</span><strong>06:08 AM</strong></div>
                <div><Sunset size={18} /><span>Sunset</span><strong>06:04 PM</strong></div>
                <div><Sun size={18} /><span>UV index</span><strong>Moderate · 5</strong></div>
              </div>
            </div>

            <div className="conditions-grid">
              <Metric icon={<Droplets />} label="Humidity" value="68" unit="%" detail="Comfortable range" tone="blue" />
              <Metric icon={<Wind />} label="Wind speed" value="12" unit="km/h" detail="Light breeze" tone="green" />
              <Metric icon={<Eye />} label="Visibility" value="8.5" unit="km" detail="Good visibility" tone="purple" />
              <Metric icon={<Gauge />} label="Pressure" value="1013" unit="hPa" detail="Near standard" tone="orange" />
            </div>
          </section>

          <section className="section-block">
            <div className="section-heading">
              <div><div className="section-kicker">THE NEXT FEW HOURS</div><h2>Weather timeline</h2></div>
              <button className="subtle-button">Next 8 hours <ChevronDown size={14} /></button>
            </div>
            <div className="panel chart-panel">
              <div className="chart-legend"><span><i className="legend-temp" /> Temperature</span><span className="chart-note">Hourly outlook · Sample data</span></div>
              <div className="hourly-chart">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={hourly} margin={{ top: 14, right: 8, left: -24, bottom: 0 }}>
                    <defs><linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b9bff" stopOpacity={0.28} /><stop offset="95%" stopColor="#8b9bff" stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 5" vertical={false} stroke="var(--grid)" />
                    <XAxis dataKey="time" tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[15, 35]} tick={{ fill: 'var(--muted)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}°`} />
                    <Tooltip contentStyle={{ background: 'var(--tooltip-bg)', border: '1px solid var(--border)', borderRadius: 12, color: 'var(--text)' }} formatter={(v) => [`${v}°C`, 'Temperature']} />
                    <Area type="monotone" dataKey="temp" stroke="#8997ff" strokeWidth={2.5} fill="url(#tempGradient)" activeDot={{ r: 5 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <div className="hourly-strip">{hourly.slice(0, 6).map((h, i) => <div key={h.time} className="hour-item"><span>{h.time}</span>{i === 0 ? <CloudSun /> : i === 5 ? <CloudRain /> : <Sun /> }<strong>{h.temp}°</strong><small><Droplets size={11} /> {h.rain}%</small></div>)}</div>
            </div>
          </section>

          <section className="lower-grid">
            <div className="section-block">
              <div className="section-heading"><div><div className="section-kicker">PLAN AHEAD</div><h2>7-day forecast</h2></div><button className="text-button">Full forecast <ArrowUpRight size={15} /></button></div>
              <div className="panel weekly-panel">
                {weekly.map((d, i) => <div className="week-row" key={d.day}><span className="week-day">{i === 0 ? 'Today' : d.day}</span><span className="week-icon">{i === 3 ? <CloudRain /> : i === 1 || i === 5 ? <CloudSun /> : <Sun />}</span><div className="week-range"><span>{d.low}°</span><div className="range-track"><div style={{ left: `${(d.low - 15) * 4}%`, width: `${(d.high - d.low) * 4}%` }} /></div><strong>{d.high}°</strong></div></div>)}
              </div>
            </div>

            <div className="section-block" id="climate">
              <div className="section-heading"><div><div className="section-kicker">LONG-TERM PATTERNS</div><h2>Rainfall by month</h2></div><button className="subtle-button">2026 <ChevronDown size={14} /></button></div>
              <div className="panel rainfall-panel">
                <div className="rainfall-summary"><div><span className="muted-label">Annual pattern</span><strong>1,060 <small>mm</small></strong></div><div className="rainfall-tag"><Waves size={14} /> Seasonal trend</div></div>
                <div className="rainfall-chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={climate} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}><CartesianGrid strokeDasharray="3 5" vertical={false} stroke="var(--grid)" /><XAxis dataKey="month" tick={{ fill: 'var(--muted)', fontSize: 10 }} axisLine={false} tickLine={false} /><YAxis tick={{ fill: 'var(--muted)', fontSize: 10 }} axisLine={false} tickLine={false} /><Tooltip contentStyle={{ background: 'var(--tooltip-bg)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)' }} /><Bar dataKey="rain" name="Rainfall (mm)" fill="#8292ff" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer></div>
                <div className="insight-box"><div className="insight-icon"><Activity size={17} /></div><p><strong>Climate insight</strong><br />Rainfall patterns often shift seasonally. Connect live climate data to explore local trends.</p></div>
              </div>
            </div>
          </section>

          <section className="section-block air-section">
            <div className="section-heading"><div><div className="section-kicker">BREATHE EASIER</div><h2>Air quality snapshot</h2></div><span className="chart-note">Illustrative values · Not live measurements</span></div>
            <div className="air-grid">
              <div className="panel aqi-card"><div className="aqi-top"><div><span className="muted-label">Air quality index</span><div className="aqi-number">42 <span>/ 100</span></div></div><span className="aqi-badge">Good</span></div><div className="aqi-track"><div /></div><div className="aqi-scale"><span>Good</span><span>Moderate</span><span>Poor</span></div><p>Sample AQI value. Check an official local source before making health decisions.</p></div>
              <Metric icon={<Activity />} label="PM2.5" value="8.2" unit="µg/m³" detail="Sample particulate level" tone="green" />
              <Metric icon={<Leaf />} label="PM10" value="18" unit="µg/m³" detail="Sample particulate level" tone="blue" />
              <Metric icon={<Thermometer />} label="UV exposure" value="5" unit="/ 11" detail="Moderate · Sample" tone="orange" />
            </div>
          </section>

          <footer className="footer"><div className="footer-brand"><CloudSun size={17} /> atmos<span>.</span></div><span>Climate intelligence, made clearer.</span><span>UI preview · Sample data only</span></footer>
        </div>
      </main>
    </div>
  )
}

function Metric({ icon, label, value, unit, detail, tone }: { icon: React.ReactNode, label: string, value: string, unit: string, detail: string, tone: string }) {
  return <div className="panel metric-card"><div className={`metric-icon ${tone}`}>{icon}</div><span className="metric-label">{label}</span><div className="metric-value">{value}<small> {unit}</small></div><div className="metric-detail"><span />{detail}</div></div>
}

export default App
