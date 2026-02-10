const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const complaintRoutes = require('./routes/complaints');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');
const analyticsRoutes = require('./routes/analytics');
const aiRoutes = require('./routes/ai');
const commentRoutes = require('./routes/comments');
const leaderboardRoutes = require('./routes/leaderboard');
const { verifyBlockchainConnection } = require('./utils/blockchain');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'CivicSense API is running' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.log('⚠️  MongoDB not found locally, starting in-memory database...');
    const { MongoMemoryServer } = require('mongodb-memory-server');
    const mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();
    await mongoose.connect(uri);
    console.log('✅ In-memory MongoDB connected at', uri);
  }
}

async function startServer() {
  console.log('\n========================================');
  console.log('  🏛️  CivicSense Server Starting...');
  console.log('========================================\n');

  // Step 1: Connect to MongoDB
  await connectDB();

  // Step 2: Verify blockchain connection (MANDATORY)
  console.log('\n🔐 Verifying blockchain connection...');
  try {
    await verifyBlockchainConnection();
    console.log('✅ Blockchain connection verified\n');
  } catch (error) {
    console.error('\n' + error.message);
    console.error('\n========================================');
    console.error('  🚫 SERVER CANNOT START');
    console.error('  Blockchain connection is MANDATORY.');
    console.error('  Fix the above errors and restart.');
    console.error('========================================\n');
    process.exit(1);
  }

  // Step 3: Start Express server
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log('========================================');
    console.log(`  🚀 Server running on port ${PORT}`);
    console.log(`  ⛓️  Blockchain: CONNECTED`);
    console.log(`  📦 Contract: ${process.env.CONTRACT_ADDRESS}`);
    console.log('========================================\n');
  });
}

startServer();
