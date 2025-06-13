import React, { useState, useEffect } from 'react';
import './App.css';
import UsageForm from './components/UsageForm';
import UsageTable, { getAnnualCO2e } from './components/UsageTable';
import UsageChart from './components/UsageChart';
import axios from 'axios';

const months = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

// const API_URL = 'http://localhost:4000';
const API_URL = 'https://carbon-emission-2.onrender.com';

function App() {
  const [entries, setEntries] = useState([]);
  const [billingDates, setBillingDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [view, setView] = useState('home'); // 'home', 'new', 'stored', 'result'
  const [loading, setLoading] = useState(false);
  const [newFullData, setNewFullData] = useState(null);
  const [newAnnualCO2e, setNewAnnualCO2e] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [pendingEntry, setPendingEntry] = useState(null);
  const [pendingBillDate, setPendingBillDate] = useState('');

  // Fetch available billing dates on mount or after save
  useEffect(() => {
    axios.get(`${API_URL}/dates`).then(res => {
      setBillingDates(res.data.dates);
    });
  }, [view]);

  // Fetch data for selected billing date
  useEffect(() => {
    if (!selectedDate) return;
    setError('');
    setSuccess('');
    setLoading(true);
    axios.get(`${API_URL}/data/${selectedDate}`)
      .then(res => {
        setEntries(res.data.data.entries || []);
        setLoading(false);
      })
      .catch(() => {
        setEntries([]);
        setError('No data found for this billing date.');
        setLoading(false);
      });
  }, [selectedDate]);

  // Accepts an array of entries
  const handleAddEntry = (newEntries, billDate) => {
    setEntries(newEntries);
    setSelectedDate(billDate);
    setError('');
    setSuccess('');
    setLoading(true);
    // Save to backend
    axios.post(`${API_URL}/data`, { billDate, data: { entries: newEntries } })
      .then(() => {
        setSuccess('Data saved successfully!');
        setLoading(false);
        // Prepare fullData and annualCO2e for result view
        const monthUsageMap = {};
        newEntries.forEach((entry) => {
          const idx = months.indexOf(entry.month);
          if (idx !== -1) {
            monthUsageMap[entry.month] = parseFloat(entry.monthlyUsage);
          }
        });
        const enteredUsages = Object.values(monthUsageMap).map(v => parseFloat(v)).filter(v => !isNaN(v));
        const avg = enteredUsages.length > 0 ? (enteredUsages.reduce((a, b) => a + b, 0) / enteredUsages.length) : 0;
        const avgFixed = parseFloat(avg.toFixed(2));
        const fullData = months.map((month) => {
          if (monthUsageMap[month] !== undefined) {
            return {
              month,
              monthlyUsage: parseFloat(monthUsageMap[month].toFixed(2)),
              isEstimate: false,
            };
          } else {
            return {
              month,
              monthlyUsage: avgFixed,
              isEstimate: true,
            };
          }
        });
        setNewFullData(fullData);
        setNewAnnualCO2e(getAnnualCO2e(fullData));
        setView('result');
      })
      .catch(() => {
        setError('Failed to save data.');
        setLoading(false);
      });
  };

  // Delete a billing date entry
  const handleDelete = (billDate) => {
    if (!window.confirm('Are you sure you want to delete this entry?')) return;
    setLoading(true);
    axios.delete(`${API_URL}/data/${billDate}`)
      .then(() => {
        setSuccess('Entry deleted successfully!');
        setSelectedDate('');
        setEntries([]);
        setLoading(false);
        // Refresh billing dates
        axios.get(`${API_URL}/dates`).then(res => {
          setBillingDates(res.data.dates);
        });
      })
      .catch(() => {
        setError('Failed to delete entry.');
        setLoading(false);
      });
  };

  // Map months to usage, fill missing with estimate
  const monthUsageMap = {};
  entries.forEach((entry) => {
    // Only use the first 12 months for chart/table
    const idx = months.indexOf(entry.month);
    if (idx !== -1) {
      monthUsageMap[entry.month] = parseFloat(entry.monthlyUsage);
    }
  });
  // Calculate average of entered months
  const enteredUsages = Object.values(monthUsageMap).map(v => parseFloat(v)).filter(v => !isNaN(v));
  const avg = enteredUsages.length > 0 ? (enteredUsages.reduce((a, b) => a + b, 0) / enteredUsages.length) : 0;
  const avgFixed = parseFloat(avg.toFixed(2));

  // Build full data for table/chart
  const fullData = months.map((month) => {
    if (monthUsageMap[month] !== undefined) {
      return {
        month,
        monthlyUsage: parseFloat(monthUsageMap[month].toFixed(2)),
        isEstimate: false,
      };
    } else {
      return {
        month,
        monthlyUsage: avgFixed,
        isEstimate: true,
      };
    }
  });

  const annualCO2e = getAnnualCO2e(fullData);

  // Home screen
  if (view === 'home') {
    return (
      <div className="app-container home-screen">
        <h1>Energy Tracker</h1>
        <div className="home-options">
          <button className="big-btn" onClick={() => { setView('new'); setEntries([]); setSelectedDate(''); setError(''); setSuccess(''); }}>New Entry</button>
          <button className="big-btn" onClick={() => { setView('stored'); setEntries([]); setSelectedDate(''); setError(''); setSuccess(''); }}>Stored Data</button>
        </div>
        {error && <div className="form-error" style={{textAlign:'center'}}>{error}</div>}
        {success && <div className="form-success" style={{textAlign:'center'}}>{success}</div>}
      </div>
    );
  }

  // New Entry screen
  if (view === 'new') {
    return (
      <div className="app-container">
        <button className="back-btn" onClick={() => setView('home')}>← Back</button>
        <h1>New Entry</h1>
        <UsageForm onSubmit={(entries) => {
          if (!entries[0] || !entries[0].billDate) {
            setError('Please enter a bill date.');
            return;
          }
          const billDate = entries[0].billDate;
          if (billingDates.includes(billDate)) {
            setPendingEntry(entries);
            setPendingBillDate(billDate);
            setShowModal(true);
          } else {
            handleAddEntry(entries, billDate);
          }
        }} />
        {loading && <div className="loading">Saving...</div>}
        {error && <div className="form-error" style={{textAlign:'center'}}>{error}</div>}
        {showModal && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <div style={{ background: '#fff', padding: 32, borderRadius: 12, boxShadow: '0 2px 16px rgba(0,0,0,0.2)', maxWidth: 350, textAlign: 'center' }}>
              <h2 style={{marginBottom: 16}}>Warning</h2>
              <p style={{marginBottom: 24}}>Data already exists for the selected date.<br/>Do you want to modify the existing data?</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 16 }}>
                <button className="big-btn" style={{width: 100}} onClick={() => {
                  setShowModal(false);
                  handleAddEntry(pendingEntry, pendingBillDate);
                  setPendingEntry(null);
                  setPendingBillDate('');
                }}>Yes</button>
                <button className="big-btn" style={{width: 100, background: '#c62828'}} onClick={() => {
                  setShowModal(false);
                  setError('Please select another date.');
                  setPendingEntry(null);
                  setPendingBillDate('');
                }}>No</button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Result screen after new entry
  if (view === 'result' && newFullData) {
    return (
      <div className="app-container">
        <h1>Entry Saved</h1>
        <UsageTable fullData={newFullData} />
        <UsageChart fullData={newFullData} />
        <div className="final-result">
          <span>Annual Estimate KgCO2e:</span>
          <span className="final-value">{newAnnualCO2e.toFixed(2)}</span>
        </div>
        <button className="big-btn" style={{marginTop: 32}} onClick={() => setView('home')}>Done</button>
      </div>
    );
  }

  // Stored Data screen
  if (view === 'stored') {
    return (
      <div className="app-container">
        <button className="back-btn" onClick={() => setView('home')}>← Back</button>
        <h1>Stored Data</h1>
        <div className="billing-date-row" style={{marginBottom: 24}}>
          <label htmlFor="billing-date-select">Select Billing Date: </label>
          <select
            id="billing-date-select"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
          >
            <option value="">-- Select --</option>
            {billingDates.map(date => (
              <option key={date} value={date}>{date}</option>
            ))}
          </select>
          {selectedDate && (
            <button className="delete-btn" onClick={() => handleDelete(selectedDate)} title="Delete this entry">🗑️ Delete</button>
          )}
        </div>
        {loading && <div className="loading">Loading...</div>}
        {error && <div className="form-error" style={{textAlign:'center'}}>{error}</div>}
        {success && <div className="form-success" style={{textAlign:'center'}}>{success}</div>}
        {selectedDate && entries.length > 0 && <>
          <UsageTable entries={entries} fullData={fullData} />
          <UsageChart fullData={fullData} />
          <div className="final-result">
            <span>Annual Estimate KgCO2e:</span>
            <span className="final-value">{annualCO2e.toFixed(2)}</span>
          </div>
        </>}
      </div>
    );
  }

  return null;
}

export default App;
