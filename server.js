require('dotenv').config();
const app = require('./app');
const connectDB = require('./src/config/db');

connectDB();

app.listen(5000, () => {
  console.log("Server running on port 5000");
});