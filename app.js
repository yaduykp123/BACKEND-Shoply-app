const express = require('express');
const cors = require("cors");
const cookieParser = require('cookie-parser');

const app = express();

app.use(
  cors({
    origin: process.env.FRND_END_API,
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




module.exports = app;