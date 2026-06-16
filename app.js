const express = require('express');
const cors = require("cors");
const cookieParser = require('cookie-parser');

const app = express();

// ── Startup: warn about missing env vars ──────────────────────────────────────
const REQUIRED_VARS = [
  'MONGO_URI',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
  'CLOUD_NAME',
  'API_KEY',
  'API_SECRET',
  'RAZORPAY_KEY_ID',
  'RAZORPAY_KEY_SECRET',
  'FRND_END_API',
];
const missing = REQUIRED_VARS.filter((v) => !process.env[v]);
if (missing.length > 0) {
  console.error('❌ Missing environment variables:', missing.join(', '));
} else {
  console.log('✅ All required environment variables are set');
}

// Strip accidental surrounding quotes/spaces from the env var
const FRONTEND_ORIGIN = (process.env.FRND_END_API || '').replace(/^["'\s]+|["'\s]+$/g, '');
console.log('🌐 CORS origin set to:', FRONTEND_ORIGIN);

app.use(
  cors({
    origin: FRONTEND_ORIGIN || '*',
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/products', require('./src/routes/product.routes'));

// user
app.use('/api/users', require('./src/routes/user.routes'));
app.use('/api/user', require('./src/routes/user.routes'));
app.use('/api/admin', require('./src/routes/admin.routes'));
app.use('/api/payment', require('./src/routes/payment.routes'));

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found` });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('🔥 Unhandled error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

module.exports = app;