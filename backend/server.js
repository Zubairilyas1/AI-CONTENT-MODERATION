require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const connectDB = require('./config/db');
const seedDatabase = require('./config/seed');

const authRoutes = require('./routes/auth');
const submissionRoutes = require('./routes/submissions');
const verdictRoutes = require('./routes/verdicts');
const appealRoutes = require('./routes/appeals');
const policyRoutes = require('./routes/policies');
const analyticsRoutes = require('./routes/analytics');
const auth = require('./middleware/auth');
const roleGuard = require('./middleware/roleGuard');
const { getAdminAppeals, resolveAppeal } = require('./controllers/appealController');

const app = express();
const PORT = process.env.PORT || 5000;

const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadDir));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/verdicts', verdictRoutes);
app.use('/api/appeals', appealRoutes);
app.get('/api/admin/appeals', auth, roleGuard, getAdminAppeals);
app.patch('/api/admin/appeals/:id', auth, roleGuard, resolveAppeal);
app.use('/api/admin/policies', policyRoutes);
app.use('/api/admin/analytics', analyticsRoutes);

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }
  if (err) {
    return res.status(400).json({ message: err.message || 'Upload error.' });
  }
  next();
});

app.use((req, res) => {
  res.status(404).json({ message: 'Route not found.' });
});

const startServer = async () => {
  await connectDB();
  await seedDatabase();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
