const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to enable CORS
app.use(cors());

// Middleware to parse JSON bodies
app.use(bodyParser.json());

const realEstateApiKey = 'DIZWAYMLS-ce82-760e-af23-1399f2c83d6a';
// URL for the RealEstate API
const realEstateApiUrl = 'https://api.realestateapi.com/v1/SkipTrace';
// Webhook URL where the response will be posted
const webhookUrl = 'https://services.leadconnectorhq.com/hooks/V2v3MIyr6arc4ftnD2Zg/webhook-trigger/84c9248b-bf8b-4ec6-af84-92099c0bbb66';

app.get('/', (req, res) => {
  res.send('Welcome to the API system!');
});

// POST API endpoint
app.post('/api/process', async (req, res) => {
  try {
    const requestBody = req.body; // Get the body data sent from the front end
    console.log('Received data:', requestBody);

    // Send the data to the RealEstate API
    const realEstateResponse = await axios.post(realEstateApiUrl, requestBody, {
      headers: {
        'x-api-key': realEstateApiKey,
        'Content-Type': 'application/json',
      },
    });

    console.log('RealEstate API response:', realEstateResponse.data);

    // Post the RealEstate API response to the webhook
    const webhookResponse = await axios.post(webhookUrl, realEstateResponse.data, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('Webhook response:', webhookResponse.status);

    // Respond to the frontend with success
    res.json({ message: 'Data processed successfully' });
  } catch (error) {
    console.error('Error occurred:', error.message);
    res.status(500).json({ message: 'An error occurred', error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
