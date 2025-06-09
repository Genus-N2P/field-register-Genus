const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.AIRTABLE_API_KEY;
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TABLE_NAME = process.env.AIRTABLE_TABLE_NAME;

const AIRTABLE_URL = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}`;

// Lookup by Note ID
app.get('/lookup', async (req, res) => {
  const { noteId } = req.query;
  try {
    const result = await axios.get(AIRTABLE_URL, {
      headers: { Authorization: `Bearer ${API_KEY}` },
      params: {
        filterByFormula: `{Note ID}="${noteId}"`,
        maxRecords: 1
      }
    });

    const record = result.data.records[0] || null;
    res.json({ record });
  } catch (error) {
    res.status(500).json({ error: 'Lookup failed', details: error.message });
  }
});

// Create new record
app.post('/create', async (req, res) => {
  try {
    const result = await axios.post(AIRTABLE_URL, {
      fields: req.body.fields
    }, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    res.json(result.data);
  } catch (error) {
    res.status(500).json({ error: 'Create failed', details: error.message });
  }
});

// Update existing record
app.patch('/update/:id', async (req, res) => {
  try {
    const result = await axios.patch(`${AIRTABLE_URL}/${req.params.id}`, {
      fields: req.body.fields
    }, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    res.json(result.data);
  } catch (error) {
    res.status(500).json({ error: 'Update failed', details: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
