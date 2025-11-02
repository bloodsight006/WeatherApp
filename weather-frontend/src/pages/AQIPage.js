// src/pages/AQIPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useCity } from '../context/CityContext'; // Get the global city

const API_BASE_URL = 'https://weather-backend-api-u29m.onrender.com';

// --- Helper Functions ---
const formatAxisDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

const formatTooltipLabel = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
};

const AQIPage = () => {
  const [aqiHistory, setAqiHistory] = useState([]);
  const { city } = useCity(); // Get the global city

  useEffect(() => {
    // Stop fetching if the city is empty
    if (!city) return; 

    const fetchAQIData = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/history/aqi/${city}`);
        setAqiHistory(res.data);
      } catch (error) {
        console.error(`Error fetching AQI history for ${city}:`, error.message);
        setAqiHistory([]); // Set to empty on error
      }
    };

    fetchAQIData();
  }, [city]); // This now correctly listens for global city changes

  return (
    <div className="card">
      <h2>Air Quality Index (AQI) - Past 30 Days in {city}</h2>

      <div className="graph-card">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart 
            data={aqiHistory}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis 
              dataKey="date" // ❗️ FIX: Use the new 'date' (lowercase) key
              tickFormatter={formatAxisDate} 
              stroke="#aaa" 
              interval={0}
            />
            <YAxis 
              dataKey="aqi" // ❗️ FIX: Use the new 'aqi' (lowercase) key
              stroke="#aaa" 
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#222', border: 'none' }} 
              labelStyle={{ color: '#fff', fontWeight: 'bold' }}
              labelFormatter={formatTooltipLabel} 
            />
            <Line 
              type="monotone" 
              dataKey="aqi" // ❗️ FIX: Use the new 'aqi' (lowercase) key
              stroke="#FF5733" 
              strokeWidth={2}
              activeDot={{ r: 8 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AQIPage;

