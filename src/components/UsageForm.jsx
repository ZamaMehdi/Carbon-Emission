import React, { useState } from 'react';
import './UsageForm.css';

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

const initialUsage = months.map(() => ({ meter1: '', meter2: '', meter3: '' }));

export default function UsageForm({ onSubmit }) {
  const [billDate, setBillDate] = useState('');
  const [usage, setUsage] = useState(initialUsage);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUsageChange = (monthIdx, meter, value) => {
    // Allow empty string or valid decimal numbers
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setUsage((prev) => {
        const updated = [...prev];
        updated[monthIdx] = { ...updated[monthIdx], [meter]: value };
        return updated;
      });
      setError('');
      setSuccess('');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!billDate) {
      setError('Please enter Bill Date.');
      return;
    }
    // Only use entered values, do not fill empty meters
    const entries = usage.map((row, idx) => {
      // Keep the original string values for display and calculations
      const vals = [row.meter1, row.meter2, row.meter3].map(v => v === '' ? null : v);
      const entered = vals.filter(v => v !== null);
      if (entered.length === 0) return null; // skip empty rows
      
      // Calculate monthly usage by converting to numbers only for the sum
      const monthlyUsage = entered.reduce((sum, val) => {
        const numVal = parseFloat(val);
        return sum + (isNaN(numVal) ? 0 : numVal);
      }, 0);

      return {
        month: months[idx],
        meter1: vals[0],
        meter2: vals[1],
        meter3: vals[2],
        monthlyUsage: monthlyUsage.toFixed(2), // Keep 2 decimal places for consistency
        billDate,
      };
    }).filter(Boolean);
    if (entries.length === 0) {
      setError('Please enter at least one usage value.');
      return;
    }
    onSubmit(entries);
    setSuccess('Entries added!');
    setUsage(initialUsage);
  };

  return (
    <form className="usage-form" onSubmit={handleSubmit}>
      <div className="form-row">
        <label>Bill Date:</label>
        <input type="date" name="billDate" value={billDate} onChange={e => setBillDate(e.target.value)} required />
      </div>
      <div className="usage-table-mimic">
        <div className="usage-header-row">
          <div className="usage-header-cell month-header">Month</div>
          <div className="usage-header-cell">Meter 1\nMonthly Usage (kWh)</div>
          <div className="usage-header-cell">Meter 2 (if applicable)\nMonthly Usage (kWh)</div>
          <div className="usage-header-cell">Meter 3 (if applicable)\nMonthly Usage (kWh)</div>
        </div>
        {months.map((month, idx) => (
          <div className="usage-row" key={month + idx}>
            <div className="usage-cell month-label">{month}</div>
            <div className="usage-cell">
              <input 
                type="text" 
                inputMode="decimal"
                pattern="\d*\.?\d*"
                value={usage[idx].meter1} 
                onChange={e => handleUsageChange(idx, 'meter1', e.target.value)} 
                placeholder="0.00"
              />
            </div>
            <div className="usage-cell">
              <input 
                type="text" 
                inputMode="decimal"
                pattern="\d*\.?\d*"
                value={usage[idx].meter2} 
                onChange={e => handleUsageChange(idx, 'meter2', e.target.value)} 
                placeholder="0.00"
              />
            </div>
            <div className="usage-cell">
              <input 
                type="text" 
                inputMode="decimal"
                pattern="\d*\.?\d*"
                value={usage[idx].meter3} 
                onChange={e => handleUsageChange(idx, 'meter3', e.target.value)} 
                placeholder="0.00"
              />
            </div>
          </div>
        ))}
      </div>
      {error && <div className="form-error">{error}</div>}
      {success && <div className="form-success">{success}</div>}
      <button type="submit">Add Entries</button>
    </form>
  );
} 