const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 5001;
let weatherHistory = [];
let aqiHistory = [];

try {
  // Load Weather Data
  const weatherPath = path.join(__dirname, 'weather_data.json');
  const weatherContents = fs.readFileSync(weatherPath, 'utf8');
  weatherHistory = JSON.parse(weatherContents);
  console.log(`Loaded ${weatherHistory.length} weather history records from JSON file.`);
  
  // Load AQI Data
  const aqiPath = path.join(__dirname, 'aqi_data.json');
  const aqiContents = fs.readFileSync(aqiPath, 'utf8');
  aqiHistory = JSON.parse(aqiContents);
  console.log(`Loaded ${aqiHistory.length} AQI history records from JSON file.`);

} catch (err) {
  console.error('Error reading local history files:', err.message);
}
app.use(cors());
app.use(express.json());

// --- 5. DEFINE OUR API ROUTES ---

/*
 * API Route 1: Get REAL-TIME weather (from OpenWeatherMap)
 */
app.get('/api/weather', async (req, res) => {
  try {
    const { city } = req.query;
    if (!city) {
      return res.status(400).json({ message: 'City is required' });
    }
    const API_KEY = process.env.OPENWEATHER_API_KEY;
    const API_URL = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`;
    const response = await axios.get(API_URL);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching weather data', error: error.message });
  }
});

/*
 * API Route 2: Get REAL-TIME Air Quality (AQI)
 */
app.get('/api/aqi', async (req, res) => {
    try {
      const { lat, lon } = req.query;
      if (!lat || !lon) {
        return res.status(400).json({ message: 'Latitude and Longitude are required' });
      }
      const API_KEY = process.env.OPENWEATHER_API_KEY;
      const API_URL = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${API_KEY}`;
      const response = await axios.get(API_URL);
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching AQI data', error: error.message });
    }
  });

/*
 * API Route 3: Get HISTORICAL WEATHER (from local JSON)
 * This route gets data FROM OUR JSON FILE
 */
app.get('/api/history/weather/:city', (req, res) => {
  try {
    const { city } = req.params;
    let cityData = weatherHistory
      .filter(record => record.city && record.city.toLowerCase() === city.toLowerCase())
      .slice(-30);

    if (cityData.length === 0) {
      return res.status(404).json({ message: 'No weather history found.' });
    }
    const today = new Date(); 
    const updatedCityData = cityData.map((record, index) => {
      const newDate = new Date(today);
      newDate.setDate(today.getDate() - (cityData.length - 1 - index));

      return {
        ...record,
        date: newDate.toISOString(), 
      };
    });

    res.json(updatedCityData);

  } catch (error) {
    res.status(500).json({ message: 'Error fetching weather history', error: error.message });
  }
});

/*
 * API Route 4: Get HISTORICAL AQI (from local JSON)
 * This is the final, simple, correct version
 */
app.get('/api/history/aqi/:city', (req, res) => {
  try {
    const { city } = req.params;

    // This is the filter we should have used all along
    let cityData = aqiHistory
      .filter(record => record.City && record.City.toLowerCase() === city.toLowerCase())
      .slice(-30); 

    if (cityData.length === 0) {
      // This will now correctly trigger for nonsense words
      return res.status(404).json({ message: 'No AQI history found.' });
    }

    // Clean and standardize the data
    const cleanData = cityData.map((record, index) => {
      const today = new Date();
      const newDate = new Date(today);
      newDate.setDate(today.getDate() - (cityData.length - 1 - index));

      return {
        date: newDate.toISOString(),
        aqi: record.AQI || 0 // Use the 'AQI' (all caps) key
      };
    });

    res.json(cleanData); 

  } catch (error) {
    // Add a check to make sure aqiHistory is an array
    if (!Array.isArray(aqiHistory)) {
      return res.status(500).json({ message: 'AQI History file is not a valid array.' });
    }
    res.status(500).json({ message: 'Error fetching AQI history', error: error.message });
  }
});

/*
 * API Route 5: Get 8-DAY FORECAST
 * This uses the OneCall API from OpenWeatherMap
 * Example: GET http://localhost:5001/api/forecast?lat=...&lon=...
 */
app.get('/api/forecast', async (req, res) => {
  try {
    const { city } = req.query; 
    if (!city) {
      return res.status(400).json({ message: 'City is required' });
    }

    const API_KEY = process.env.OPENWEATHER_API_KEY;
    // This is the 5-day/3-hour forecast endpoint
    const API_URL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;

    const response = await axios.get(API_URL);
    res.json(response.data);

  } catch (error) {
    // Handle 404 (city not found) gracefully
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ message: 'City not found' });
    }
    res.status(500).json({ message: 'Error fetching forecast data', error: error.message });
  }
});

/*
 * API Route 6: "PREDICTION" (Mocked)
 * This fakes a 7-day prediction for the graph
 */
app.get('/api/predict/:city', (req, res) => {
  try {
    const { city } = req.params;
    // 1. Get the last 7 days of real data
    let historyData = weatherHistory
      .filter(record => record.city && record.city.toLowerCase() === city.toLowerCase())
      .slice(-7); // Get the last 7 records

    if (historyData.length === 0) {
      // If no history, just send an empty array
      return res.json([]);
    }

    const today = new Date();
    const predictions = [];

    // 2. Loop 7 times to create 7 "future" days
    for (let i = 1; i <= 7; i++) {
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + i);
      // 3. Simple prediction: last week's same day temp + random noise using linear regression model concept
      const baseTemp = historyData[i % historyData.length].temperature_2m_max;
      const noise = (Math.random() - 0.5) * 2; // Random number between -1 and 1
      const predictedTemp = (baseTemp + noise).toFixed(1); // e.g., 28.3

      predictions.push({
        date: futureDate.toISOString(),
        temperature: parseFloat(predictedTemp),
      });
    }

    res.json(predictions); // linear regression model concept

  } catch (error) {
    res.status(500).json({ message: 'Error generating prediction', error: error.message });
  }
});


// --- 6. Start the Server ---
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
