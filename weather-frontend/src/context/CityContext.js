import React, { createContext, useState, useContext } from 'react';
const CityContext = createContext();
export const CityProvider = ({ children }) => {
  // This is our NEW global state!
  const [city, setCity] = useState('Chennai'); // Default city

  return (
    <CityContext.Provider value={{ city, setCity }}>
      {children}
    </CityContext.Provider>
  );
};
export const useCity = () => {
  return useContext(CityContext);
};
