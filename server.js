const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const PORT = process.env.PORT || 3001;
const AUSTIN_CAD_URL = 'https://data.austintexas.gov/resource/22de-7rzg.json?$limit=100&$order=@updated_at DESC';

let clients = [];

wss.on('connection', (ws) => {
  console.log('Client connected');
  clients.push(ws);
  ws.send(JSON.stringify({ type: 'connected', msg: 'EWS connected' }));
  
  ws.on('close', () => {
    clients = clients.filter(c => c !== ws);
    console.log('Client disconnected');
  });
});

async function pollAlerts() {
  try {
    const res = await axios.get(AUSTIN_CAD_URL, { timeout: 5000 });
    const alerts = res.data.slice(0, 20).map(item => ({
      id: item.incident_number,
      type: item.call_type_description || 'Unknown',
      location: item.location_description || item.address || 'Unknown',
      time: item.updated_at,
      latitude: item.latitude,
      longitude: item.longitude
    }));
    
    clients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'new_alerts', alerts }));
      }
    });
  } catch (err) {
    console.error('Poll error:', err.message);
  }
}

setInterval(pollAlerts, 60000);
pollAlerts();

app.get('/', (req, res) => res.send('EWS Server Running'));

server.listen(PORT, () => {
  console.log(`EWS running on port ${PORT}`);
});
