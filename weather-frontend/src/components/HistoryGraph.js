import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './HistoryGraph.css';
const formatAxisDate = (dateString) => {
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};
const formatTooltipLabel = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
};

const HistoryGraph = ({ data }) => {
  if (!data || data.length === 0) {
    return <div className="card graph-card">Loading graph data...</div>;
  }

  return (
    <div className="card graph-card">
      <h3>Past 30 Day Temperature</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}
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
            dataKey="temperature_2m_max"
            unit="°C" 
            stroke="#aaa" 
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#222', border: 'none' }} 
            labelStyle={{ color: '#fff', fontWeight: 'bold' }}
            labelFormatter={formatTooltipLabel}
          />
          <Line 
            type="monotone" 
            dataKey="temperature_2m_max" 
            stroke="#8884d8" 
            strokeWidth={2}
            activeDot={{ r: 8 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HistoryGraph;
