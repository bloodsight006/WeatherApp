import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Dashboard from './Dashboard';
import AQIPage from './pages/AQIPage';
import RainPage from './pages/RainPage';
import PredictionPage from './pages/PredictionPage'; 
import { FaHome, FaSmog, FaCloudRain, FaChartLine } from 'react-icons/fa'; 
import { CityProvider } from './context/CityContext'; 

function App() {
  return (
    <CityProvider>
      <BrowserRouter>
        <div className="app-container">
          
          {/* --- SIDEBAR --- */}
          {/* (Your sidebar code... no changes here) */}
          <div className="sidebar">
            <Link to="/" className="sidebar-link">
              <FaHome size={24} />
              <span>Dashboard</span>
            </Link>
            <Link to="/aqi" className="sidebar-link">
              <FaSmog size={24} />
              <span>AQI</span>
            </Link>
            <Link to="/rain" className="sidebar-link">
              <FaCloudRain size={24} />
              <span>Rain</span>
            </Link>
            <Link to="/prediction" className="sidebar-link">
              <FaChartLine size={24} />
              <span>Prediction</span>
            </Link>
          </div>

          {/* --- MAIN CONTENT --- */}
          <div className="main-content">
            <Routes>
              {/* (Your routes... no changes here) */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/aqi" element={<AQIPage />} />
              <Route path="/rain" element={<RainPage />} />
              <Route path="/prediction" element={<PredictionPage />} />
            </Routes>
          </div>

        </div>
      </BrowserRouter>
    </CityProvider> 
  );
}

export default App;
