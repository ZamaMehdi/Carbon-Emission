import React from 'react';
import './UsageTable.css';

const CO2_FACTOR = 0.20496;

export function getAnnualCO2e(fullData) {
  return fullData.reduce((sum, row) => sum + row.monthlyUsage * CO2_FACTOR, 0);
}

export default function UsageTable({ fullData }) {
  return (
    <div className="usage-table-container">
      <h2>Monthly Usage Table</h2>
      <table className="usage-table">
        <thead>
          <tr>
            <th>Month</th>
            <th>Monthly Usage (kWh)</th>
            <th>Estimate Usage (kWh)</th>
            <th>KgCO2e</th>
          </tr>
        </thead>
        <tbody>
          {fullData.map((row, idx) => (
            <tr key={row.month}>
              <td>{row.month}</td>
              <td>{!row.isEstimate ? row.monthlyUsage : ''}</td>
              <td>{row.isEstimate ? row.monthlyUsage : ''}</td>
              <td>{(row.monthlyUsage * CO2_FACTOR).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 