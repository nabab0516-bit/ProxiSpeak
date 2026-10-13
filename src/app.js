const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const audioRoutes = require('./routes/audioRoutes');
const roomRoutes = require('./routes/roomRoutes');

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true }));
app.use(express.json({ limit: '1mb' }));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'proxispeak-backend', timestamp: new Date().toISOString() }));
app.use('/api/audio', audioRoutes);
app.use('/api/rooms', roomRoutes);
app.use((req, res) => res.status(404).json({ error: 'Not found', path: req.originalUrl }));
app.use((err, _req, res, _next) => {
  if (err && err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body' });
  console.error(err);
  res.status(err.status || 500).json({ error: err.status ? err.message : 'Internal server error' });
});
module.exports = app;
