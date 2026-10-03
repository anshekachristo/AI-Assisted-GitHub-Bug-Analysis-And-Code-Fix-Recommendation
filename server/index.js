require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const githubRoutes = require('./routes/github');
const cloneRoutes = require('./routes/clone');
const analyzeRoutes = require('./routes/analyze');
const fixRoutes = require('./routes/fix');
const acceptRoutes = require('./routes/accept');
const rejectRoutes = require('./routes/reject');
const fileContentRoutes = require('./routes/fileContent');
const modelsRoutes = require('./routes/models');

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/github', githubRoutes);
app.use('/api/clone', cloneRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/fix', fixRoutes);
app.use('/api/accept', acceptRoutes);
app.use('/api/reject', rejectRoutes);
app.use('/api/file-content', fileContentRoutes);
app.use('/api/models', modelsRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Test route
app.get('/', (req, res) => {
  res.send('Server is running!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});