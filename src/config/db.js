
const mongoose = require('mongoose')

async function connectMDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('❌ MONGO_URI is not defined — skipping DB connection');
    return;
  }

  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    await mongoose.connect(uri);
    console.log('✅ MongoDB Connected (MDB)');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    // Don't crash the server — let health check / root route still work
  }
}

// Log connection events
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

module.exports = connectMDB