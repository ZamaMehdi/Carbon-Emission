import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './UsageChart.css';

export default function UsageChart({ fullData }) {
  return (
    <div className="usage-chart-container">
      <h2>Electricity Usage per Month</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={fullData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="monthlyUsage" name="Actual Usage (kWh)" fill="#388e3c" isAnimationActive={false}
            {...{ shape: (props) => props.payload.isEstimate ? <rect {...props} fill="#a5d6a7" /> : <rect {...props} fill="#388e3c" /> }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
} 