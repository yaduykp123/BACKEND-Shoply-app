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
  console.error(' Missing environment variables:', missing.join(', '));
} else {
  console.log(' All required environment variables are set');
}

// Function-based CORS — safe against any env var formatting issues
const FRONTEND_ORIGIN = (process.env.FRND_END_API || '').replace(/^["'\s]+|["'\s]+$/g, '').trim();
console.log(' CORS origin set to:', FRONTEND_ORIGIN);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (curl, Postman, mobile apps)
      if (!origin) return callback(null, true);
      // Allow if it matches our frontend
      if (!FRONTEND_ORIGIN || origin === FRONTEND_ORIGIN) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// ── Root route (BEFORE api routes for Express 5 compatibility) ────────────────
app.get('/', (req, res) => {
  res.json({
    message: 'Shoply API is running ',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      products: '/api/products',
      users: '/api/users',
      admin: '/api/admin',
      payment: '/api/payment',
    },
  });
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/products', require('./src/routes/product.routes'));

// user
app.use('/api/users', require('./src/routes/user.routes'));
app.use('/api/user', require('./src/routes/user.routes'));
app.use('/api/admin', require('./src/routes/admin.routes'));
app.use('/api/payment', require('./src/routes/payment.routes'));

// ── 404 handler ───────────────────────────────────────────────────────────────
app.use((req, res, _next) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found` });
});

// ── Global error handler ──────────────────────────────────────────────────────
app.use((err, req, res, _next) => {
  console.error(' Unhandled error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  });
});

module.exports = app;