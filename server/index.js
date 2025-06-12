const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

// SQLite setup
const db = new sqlite3.Database(path.join(__dirname, 'energy_tracker.db'));
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS tracker_data (
    billDate TEXT PRIMARY KEY,
    data TEXT
  )`);
});

// Save data for a billing date
app.post('/data', (req, res) => {
  const { billDate, data } = req.body;
  if (!billDate || !data) {
    return res.status(400).json({ error: 'billDate and data are required' });
  }
  const dataStr = JSON.stringify(data);
  db.run(
    `INSERT OR REPLACE INTO tracker_data (billDate, data) VALUES (?, ?)`,
    [billDate, dataStr],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json({ success: true });
    }
  );
});

// Fetch data for a billing date
app.get('/data/:billDate', (req, res) => {
  const { billDate } = req.params;
  db.get(
    `SELECT data FROM tracker_data WHERE billDate = ?`,
    [billDate],
    (err, row) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (!row) {
        return res.status(404).json({ error: 'No data found for this billing date' });
      }
      res.json({ data: JSON.parse(row.data) });
    }
  );
});

// List all billing dates
app.get('/dates', (req, res) => {
  db.all(`SELECT billDate FROM tracker_data ORDER BY billDate DESC`, [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json({ dates: rows.map(r => r.billDate) });
  });
});

// Delete data for a billing date
app.delete('/data/:billDate', (req, res) => {
  const { billDate } = req.params;
  db.run(
    `DELETE FROM tracker_data WHERE billDate = ?`,
    [billDate],
    function (err) {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (this.changes === 0) {
        return res.status(404).json({ error: 'No data found for this billing date' });
      }
      res.json({ success: true });
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
}); 