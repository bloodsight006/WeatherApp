import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import './Dashboard.css'; 
import CurrentWeather from './components/CurrentWeather';
import TodaysHighlight from './components/TodaysHighlight';
import HistoryGraph from './components/HistoryGraph';
import ForecastCard from './components/ForecastCard';
import OtherCountries from './components/OtherCountries';
import { useCity } from './context/CityContext'; 
// Your backend server URL
const API_BASE_URL = 'http://localhost:5001/api';

const Dashboard = () => {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [aqi, setAqi] = useState(null);
  const [history, setHistory] = useState([]);
  const [forecast, setForecast] = useState(null);
  const { city, setCity } = useCity(); 

  useEffect(() => {
    fetchData(city);
  }, [city]); 


  const fetchData = async (selectedCity) => {
    setCurrentWeather(null);
    setAqi(null);
    setHistory([]); 
    setForecast(null);

    let lat, lon;
    try {
      const weatherRes = await axios.get(`${API_BASE_URL}/weather?city=${selectedCity}`);
      setCurrentWeather(weatherRes.data);
      lat = weatherRes.data.coord.lat;
      lon = weatherRes.data.coord.lon;
    } catch (error) {
      console.error("Error fetching current weather:", error.message);
      return; 
    }
    try {
      const aqiRes = await axios.get(`${API_BASE_URL}/aqi?lat=${lat}&lon=${lon}`);
      setAqi(aqiRes.data);
    } catch (error) {
      console.error("Error fetching AQI:", error.message);
    }
    try {
      const historyRes = await axios.get(`${API_BASE_URL}/history/weather/${selectedCity}`);
      setHistory(historyRes.data);
    } catch (error) {
      console.error("Error fetching history:", error.message);
      setHistory([]);
    }

    try {
      const forecastRes = await axios.get(`${API_BASE_URL}/forecast?city=${selectedCity}`);
      setForecast(forecastRes.data);
    } catch (error) {
      console.error("Error fetching forecast:", error.message);
    }
  };

  // This function is for the search bar
  const handleSearch = (event) => {
    if (event.key === 'Enter') {
      setCity(event.target.value);
    }
  };

  return (
    <> 
      {/* --- Header --- */}
      <header className="header">
        <div>
          <h1>Dashboard</h1>
          {/* This will say "Showing the latest for Chennai" etc. */}
          <h3>Showing the latest weather for {currentWeather ? currentWeather.name : city}</h3>
        </div>
        <input 
          type="search" 
          placeholder="Search your location" 
          defaultValue={city} // Shows the current city
          onKeyDown={handleSearch}
        />
      </header>

      {/* --- Main Widgets Grid --- */}
      <div className="widgets-grid">
        
        <div className="left-column">
          <CurrentWeather weather={currentWeather} /> 
          <OtherCountries onCityClick={setCity} /> 
        </div>

        <div className="right-column">
          <TodaysHighlight weather={currentWeather} aqi={aqi} /> 
          <ForecastCard forecast={forecast} /> 
        </div>

      </div>
      
      {/* --- Graph Section --- */}
      <div className="graph-section">
        <HistoryGraph data={history} />
      </div>
    </>
  );
};

export default Dashboard;
