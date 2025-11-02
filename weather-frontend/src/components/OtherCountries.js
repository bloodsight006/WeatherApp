import React from 'react';
import './OtherCountries.css';
const cities = [
  { name: 'Canberra', country: 'Australia', icon: '☀️' },
  { name: 'Tokyo', country: 'Japan', icon: '☁️' },
  { name: 'London', country: 'UK', icon: '🌧️' },
  { name: 'New York', country: 'USA', icon: '🏙️' },
];

// This component receives the 'onCityClick' function from the Dashboard
const OtherCountries = ({ onCityClick }) => {
  return (
    <div className="card countries-card">
      <h3>Other Countries</h3>
      <div className="countries-list">
        {cities.map((city) => (
          <button 
            className="city-item" 
            key={city.name} 
            onClick={() => onCityClick(city.name)}
          >
            <div className="city-info">
              <span className="city-name">{city.name}</span>
              <span className="city-country">{city.country}</span>
            </div>
            <div className="city-icon">{city.icon}</div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default OtherCountries;
