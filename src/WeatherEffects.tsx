
import type { CSSProperties } from 'react'

type WeatherEffectsProps = {
  code?: number
  isDay: boolean
}

type EffectType =
  | 'sun'
  | 'partly'
  | 'cloud'
  | 'rain'
  | 'storm'
  | 'snow'
  | 'fog'
  | 'night'
  | 'night-cloud'
  | 'none'

function getEffectType(code: number | undefined, isDay: boolean): EffectType {
  if (code === undefined) return 'none'

  if (code === 0) return isDay ? 'sun' : 'night'
  if (code === 1 || code === 2) return isDay ? 'partly' : 'night-cloud'
  if (code === 3) return 'cloud'
  if ([45, 48].includes(code)) return 'fog'
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return 'rain'
  }
  if ([71, 73, 75, 77, 85, 86].includes(code)) return 'snow'
  if ([95, 96, 99].includes(code)) return 'storm'

  return 'cloud'
}

function RainDrops({ heavy = false }: { heavy?: boolean }) {
  const count = heavy ? 90 : 55

  return (
    <div className={`effect-rain ${heavy ? 'heavy-rain' : ''}`} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => {
        const style: CSSProperties = {
          left: `${(index * 37 + 3) % 100}%`,
          animationDelay: `${-((index * 17) % 24) / 10}s`,
          animationDuration: `${heavy ? 0.55 : 0.85 + (index % 7) * 0.12}s`,
          opacity: 0.25 + (index % 5) * 0.1,
        }

        return <span key={index} style={style} />
      })}
    </div>
  )
}

function CloudShape({ className = '' }: { className?: string }) {
  return (
    <div className={`effect-cloud ${className}`} aria-hidden="true">
      <span className="cloud-puff cloud-puff-one" />
      <span className="cloud-puff cloud-puff-two" />
      <span className="cloud-puff cloud-puff-three" />
      <span className="cloud-base" />
    </div>
  )
}

function SunShape() {
  return (
    <div className="effect-sun-wrap" aria-hidden="true">
      <div className="effect-sun-rays">
        {Array.from({ length: 12 }, (_, index) => (
          <span
            key={index}
            style={{ transform: `rotate(${index * 30}deg)` }}
          />
        ))}
      </div>
      <div className="effect-sun-core" />
    </div>
  )
}

function NightSky() {
  return (
    <div className="effect-night-sky" aria-hidden="true">
      <div className="effect-moon">
        <span />
      </div>
      {Array.from({ length: 35 }, (_, index) => {
        const style: CSSProperties = {
          left: `${(index * 29 + 7) % 100}%`,
          top: `${(index * 43 + 5) % 72}%`,
          animationDelay: `${(index % 8) * -0.55}s`,
          animationDuration: `${1.8 + (index % 5) * 0.5}s`,
        }

        return <i key={index} style={style} />
      })}
    </div>
  )
}

function Snowflakes() {
  return (
    <div className="effect-snow" aria-hidden="true">
      {Array.from({ length: 48 }, (_, index) => {
        const style: CSSProperties = {
          left: `${(index * 31 + 5) % 100}%`,
          animationDelay: `${-((index * 13) % 30) / 10}s`,
          animationDuration: `${4 + (index % 6) * 1.4}s`,
          width: `${3 + (index % 4)}px`,
          height: `${3 + (index % 4)}px`,
        }

        return <span key={index} style={style} />
      })}
    </div>
  )
}

export default function WeatherEffects({ code, isDay }: WeatherEffectsProps) {
  const effect = getEffectType(code, isDay)

  if (effect === 'none') return null

  return (
    <div
      className={`weather-effects effect-${effect}`}
      aria-hidden="true"
    >
      {(effect === 'sun' || effect === 'partly') && <SunShape />}

      {(effect === 'partly' || effect === 'cloud' || effect === 'night-cloud') && (
        <>
          <CloudShape className="cloud-one" />
          <CloudShape className="cloud-two" />
          {effect === 'cloud' && <CloudShape className="cloud-three" />}
        </>
      )}

      {effect === 'rain' && (
        <>
          <CloudShape className="rain-cloud cloud-one" />
          <CloudShape className="rain-cloud cloud-two" />
          <RainDrops />
        </>
      )}

      {effect === 'storm' && (
        <>
          <CloudShape className="storm-cloud cloud-one" />
          <CloudShape className="storm-cloud cloud-two" />
          <RainDrops heavy />
          <div className="effect-lightning">
            <span />
          </div>
        </>
      )}

      {effect === 'snow' && (
        <>
          <CloudShape className="snow-cloud cloud-one" />
          <Snowflakes />
        </>
      )}

      {effect === 'fog' && (
        <div className="effect-fog">
          <span />
          <span />
          <span />
          <span />
        </div>
      )}

      {(effect === 'night' || effect === 'night-cloud') && <NightSky />}
    </div>
  )
}
