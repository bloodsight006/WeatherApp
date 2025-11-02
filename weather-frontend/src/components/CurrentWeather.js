import React from 'react';
import './CurrentWeather.css';

// We pass in 'weather' as a prop from our Dashboard
const CurrentWeather = ({ weather }) => {
  if (!weather) {
    return <div className="card current-weather-card">Loading...</div>;
  }

  // Once data is loaded, display it
  const iconUrl = `https://openweathermap.org/img/wn/${weather.weather[0].icon}@4x.png`;
  const localDate = new Date(weather.dt * 1000).toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="card current-weather-card">
      <div className="location">{weather.name}, {weather.sys.country}</div>
      <div className="date">{localDate}</div>
      <img src={iconUrl} alt={weather.weather[0].description} className="weather-icon" />

      <div className="temp-container">
        <div className="temp-main">{Math.round(weather.main.temp)}°C</div>
        <div className="temp-range">/{Math.round(weather.main.temp_min)}°C</div>
      </div>

      <div className="weather-desc">{weather.weather[0].main}</div>
      <div className="feels-like">Feels like {Math.round(weather.main.feels_like)}°</div>
    </div>
  );
};

export default CurrentWeather;
