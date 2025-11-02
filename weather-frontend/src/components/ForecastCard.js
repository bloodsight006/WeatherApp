import React from 'react';
import './ForecastCard.css';

const getDayName = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', { weekday: 'short' });
};

const getSafeIcon = (item) => {
  let icon = '03d'; 
  try {
    if (item && item.weather && item.weather[0] && item.weather[0].icon) {
      icon = item.weather[0].icon.trim();
    }
    return icon.replace('n', 'd'); 
    
  } catch (e) {
    return '03d'; 
  }
};

const processForecastData = (list) => {
  const dailyData = {}; 
  const today = new Date().toLocaleDateString();

  list.forEach(item => {
    const itemDateStr = new Date(item.dt_txt).toLocaleDateString();
    
    // Skip any data from "today"
    if (itemDateStr === today) {
      return;
    }

    const date = item.dt_txt.split(' ')[0];

    if (!dailyData[date]) {
      dailyData[date] = {
        temp_min: item.main.temp_min,
        temp_max: item.main.temp_max,
        icon: getSafeIcon(item), 
        dayName: getDayName(item.dt_txt),
      };
    }

    dailyData[date].temp_min = Math.min(dailyData[date].temp_min, item.main.temp_min);
    dailyData[date].temp_max = Math.max(dailyData[date].temp_max, item.main.temp_max);


    if (item.dt_txt.includes("15:00:00")) {
      dailyData[date].icon = getSafeIcon(item);
    }
  });

  return Object.values(dailyData).slice(0, 5);
};


const ForecastCard = ({ forecast }) => {
  if (!forecast || !forecast.list) {
    return <div className="card forecast-card">Loading forecast...</div>;
  }

  const processedData = processForecastData(forecast.list);

  return (
    <div className="card forecast-card">
      <h3>5 Day Forecast</h3>
      <div className="forecast-list">
        {processedData.map((day, index) => (
          <div className="forecast-item" key={index}>
            <div className="forecast-day">{day.dayName}</div>
            <img 
              src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`} 
              alt="weather icon"
              className="forecast-icon"
            />
            <div className="forecast-temps">
              <span className="temp-max">{Math.round(day.temp_max)}°</span>
              <span className="temp-min">{Math.round(day.temp_min)}°</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ForecastCard;
