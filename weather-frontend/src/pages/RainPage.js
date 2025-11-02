import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useCity } from '../context/CityContext';
// This is the URL of your backend server
const API_BASE_URL = 'http://localhost:5001/api';

// --- Helper Functions (copied from our other graphs) ---
const formatAxisDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

const formatTooltipLabel = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
};

const RainPage = () => {
  const [rainHistory, setRainHistory] = useState([]);
  const { city } = useCity(); 

  useEffect(() => {
    const fetchRainData = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/history/weather/${city}`);
        setRainHistory(res.data);
      } catch (error) {
        console.error("Error fetching rain history:", error);
        setRainHistory([]); 
      }
    };

    fetchRainData();
  }, [city]); 

  return (
    <div className="card">
      <h2>Rainfall (Precipitation) - Past 30 Days</h2>
      
      {/* We can re-use the .graph-card styles */}
      <div className="graph-card">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart 
            data={rainHistory}
            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis 
              dataKey="date"
              tickFormatter={formatAxisDate} 
              stroke="#aaa" 
              interval={0} 
            />
            <YAxis 
              dataKey="rain_sum" 
              unit=" mm" // 
              stroke="#aaa" 
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#222', border: 'none' }} 
              labelStyle={{ color: '#fff', fontWeight: 'bold' }}
              labelFormatter={formatTooltipLabel} 
            />
            <Line 
              type="monotone" 
              dataKey="rain_sum" 
              stroke="#33AFFF" 
              strokeWidth={2}
              activeDot={{ r: 8 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RainPage;