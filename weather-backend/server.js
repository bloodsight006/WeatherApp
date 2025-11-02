// server.js (FINAL - Firebase Version)

// --- 1. Import tools ---
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

// --- 2. Import Firebase Admin tools ---
const admin = require('firebase-admin');
// It will find the key from the "Secret File" we just made
// ❗️ THIS IS THE FIX ❗️
// This code block makes your server work BOTH locally AND on Render
let serviceAccount;
try {
  // This is the path for the Render "Secret File"
  serviceAccount = require('/etc/secrets/serviceAccountKey.json');
} catch (e) {
  // This is the path for your local computer
  serviceAccount = require('./serviceAccountKey.json');
}
// ❗️ END OF FIX ❗️

// --- 3. Initialize Express (our server) ---
const app = express();
const PORT = process.env.PORT || 5001; 

// --- 4. Initialize Firebase Admin ---
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore(); // Our database

// --- 5. Use Middleware ---
app.use(cors()); // Use the simple, open CORS. This is robust.
app.use(express.json());

// --- 6. DEFINE OUR API ROUTES ---

/*
 * API Route 1: Get REAL-TIME weather
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
 * API Route 3: Get HISTORICAL WEATHER (from Firebase)
 */
app.get('/api/history/weather/:city', async (req, res) => {
  try {
    let { city } = req.params;
    if (city.toLowerCase() === 'bengaluru') city = 'bangalore';

    const snapshot = await db.collection('weatherHistory')
      .where('city', '==', city.toLowerCase()) // Use lowercase
      .orderBy('date', 'desc') 
      .limit(30)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'No weather history found.' });
    }
    
    let cityData = snapshot.docs.map(doc => doc.data()).reverse();

    // Date Fix
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
 * API Route 4: Get HISTORICAL AQI (from Firebase)
 */
app.get('/api/history/aqi/:city', async (req, res) => {
  try {
    let { city } = req.params;
    if (city.toLowerCase() === 'bangalore') city = 'bengaluru';

    const snapshot = await db.collection('aqiHistory')
      .where('City', '==', city) // ❗️ Case-sensitive 'City'
      .orderBy('Date', 'desc') // ❗️ Case-sensitive 'Date'
      .limit(30)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'No AQI history found.' });
    }

    let cityData = snapshot.docs.map(doc => doc.data()).reverse();

    // Standardize output
    const cleanData = cityData.map((record, index) => {
      const today = new Date();
      const newDate = new Date(today);
      newDate.setDate(today.getDate() - (cityData.length - 1 - index));
      return {
        date: newDate.toISOString(),
        aqi: record.AQI || 0
      };
    });
    res.json(cleanData); 
  } catch (error) {
    res.status(500).json({ message: 'Error fetching AQI history', error: error.message });
  }
});

/*
 * API Route 5: Get 5-DAY FORECAST
 */
app.get('/api/forecast', async (req, res) => {
  try {
    const { city } = req.query; 
    if (!city) {
      return res.status(400).json({ message: 'City is required' });
    }
    const API_KEY = process.env.OPENWEATHER_API_KEY;
    const API_URL = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`;
    const response = await axios.get(API_URL);
    res.json(response.data);
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return res.status(404).json({ message: 'City not found' });
    }
    res.status(500).json({ message: 'Error fetching forecast data', error: error.message });
  }
});

/*
 * API Route 6: "PREDICTION" (Mocked)
 */
app.get('/api/predict/:city', async (req, res) => {
  try {
    let { city } = req.params;
    if (city.toLowerCase() === 'bengaluru') city = 'bangalore';
    
    // Get history data from Firebase
    const snapshot = await db.collection('weatherHistory')
      .where('city', '==', city.toLowerCase()) // Use lowercase
      .orderBy('date', 'desc')
      .limit(7)
      .get();

    if (snapshot.empty) {
      return res.json([]);
    }
    
    let historyData = snapshot.docs.map(doc => doc.data());

    const today = new Date();
    const predictions = [];

    for (let i = 1; i <= 7; i++) {
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + i); 
      const baseTemp = historyData[i - 1].temperature_2m_max;
      const noise = (Math.random() - 0.5) * 2;
      const predictedTemp = (baseTemp + noise).toFixed(1);

      predictions.push({
        date: futureDate.toISOString(),
        temperature: parseFloat(predictedTemp),
      });
    }
    res.json(predictions); 
  } catch (error) {
    res.status(500).json({ message: 'Error generating prediction', error: error.message });
  }
});

// --- 7. Start the Server ---
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});
