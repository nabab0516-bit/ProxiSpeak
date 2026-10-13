require('dotenv').config();
const http = require('http');
const mongoose = require('mongoose');
const app = require('./app');
const { attachSocketServer } = require('./sockets');
const PORT = Number(process.env.PORT || 3000);
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/proxispeak';

async function start() {
  try { await mongoose.connect(MONGODB_URI); console.log('Connected to MongoDB'); }
  catch (error) { console.error('MongoDB connection failed:', error.message); process.exit(1); }
  const server = http.createServer(app);
  attachSocketServer(server);
  server.listen(PORT, () => console.log(`ProxiSpeak backend listening on http://localhost:${PORT}`));
  const shutdown = () => server.close(async () => { await mongoose.disconnect(); process.exit(0); });
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
if (require.main === module) start();
module.exports = { start };
