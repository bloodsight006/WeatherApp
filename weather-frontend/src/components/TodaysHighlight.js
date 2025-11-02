import React from 'react';
import './TodaysHighlight.css';

// Helper function to get the AQI description
const getAQIDescription = (aqiIndex) => {
  switch (aqiIndex) {
    case 1: return 'Good';
    case 2: return 'Fair';
    case 3: return 'Moderate';
    case 4: return 'Poor';
    case 5: return 'Very Poor';
    default: return 'N/A';
  }
};

const TodaysHighlight = ({ weather, aqi }) => {
  // Show loading if either data prop is missing
  if (!weather || !aqi) {
    return <div className="card highlights-card">Loading details...</div>;
  }

  // Extract the first AQI data point
  const aqiData = aqi.list[0];

  return (
    <div className="card highlights-card">
      <h3>Today's Highlight</h3>
      <div className="highlights-grid">

        {/* Wind Status */}
        <div className="highlight-item">
          <h4>Wind Status</h4>
          <div className="highlight-value">{weather.wind.speed.toFixed(1)} km/h</div>
        </div>

        {/* Humidity */}
        <div className="highlight-item">
          <h4>Humidity</h4>
          <div className="highlight-value">{weather.main.humidity} %</div>
          <div className="highlight-sub">
            {weather.main.humidity > 70 ? 'High' : 'Normal'}
          </div>
        </div>

        {/* Sunrise */}
        <div className="highlight-item">
          <h4>Sunrise</h4>
          <div className="highlight-value">
            {new Date(weather.sys.sunrise * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </div>
        </div>

        {/* AQI (using it instead of UV Index) */}
        <div className="highlight-item">
          <h4>Air Quality Index (AQI)</h4>
          <div className="highlight-value">{aqiData.main.aqi}</div>
          <div className="highlight-sub">{getAQIDescription(aqiData.main.aqi)}</div>
        </div>

        {/* Visibility */}
        <div className="highlight-item">
          <h4>Visibility</h4>
          <div className="highlight-value">{(weather.visibility / 1000).toFixed(1)} km</div>
        </div>

        {/* Sunset */}
        <div className="highlight-item">
          <h4>Sunset</h4>
          <div className="highlight-value">
            {new Date(weather.sys.sunset * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
          </div>
        </div>

      </div>
    </div>
  );
};

export default TodaysHighlight;
