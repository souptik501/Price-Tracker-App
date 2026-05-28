const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const searchRoutes = require('./routes/search');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({ ok: true });
});

app.use('/api/search', searchRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
