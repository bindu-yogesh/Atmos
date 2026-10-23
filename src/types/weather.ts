
export interface WeatherResponse {
  latitude: number
  longitude: number
  timezone: string
  current: {
    time: string
    temperature_2m: number
    relative_humidity_2m: number
    apparent_temperature: number
    is_day: number
    precipitation: number
    weather_code: number
    cloud_cover: number
    pressure_msl: number
    wind_speed_10m: number
    wind_direction_10m: number
    uv_index: number
    visibility: number
  }
  hourly: {
    time: string[]
    temperature_2m: number[]
    precipitation_probability: number[]
    relative_humidity_2m: number[]
    uv_index: number[]
  }
  daily: {
    time: string[]
    weather_code: number[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    sunrise: string[]
    sunset: string[]
    precipitation_sum: number[]
    uv_index_max: number[]
  }
}

export interface LocationResult {
  name: string
  country: string
  latitude: number
  longitude: number
  timezone: string
}
