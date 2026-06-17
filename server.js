require('dotenv').config();
const app = require('./app');
const connectDB = require('./src/config/db');

connectDB(); // db.js exports connectMDB, aliased here as connectDB

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});