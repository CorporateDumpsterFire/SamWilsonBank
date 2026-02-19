const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Alloy evaluations endpoint
app.post('/api/evaluations', async (req, res) => {
  try {
    const externalEntityId = req.body.external_entity_id;

    // Create Basic Auth token
    const authToken = Buffer.from(
      `${process.env.ALLOY_API_KEY}:${process.env.ALLOY_API_SECRET}`
    ).toString('base64');

    const response = await fetch(process.env.ALLOY_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authToken}`,
        'alloy-workflow-token': process.env.ALLOY_WORKFLOW_TOKEN,
        // 'alloy-entity-token': process.env.ALLOY_ENTITY_TOKEN,
        // 'alloy-external-entity-id': externalEntityId,
        'alloy-entity-type': 'person',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    res.json(data);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Internal server error', message: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
