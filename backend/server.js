/**
 * server.js
 * --------------------------------------------------------------------
 * Entry point. Loads env vars, connects to MongoDB, then starts Express.
 *
 * Separation of concerns (per brief Section 17.1):
 *   - app.js   = Express app config (middleware + routes)
 *   - server.js = process bootstrap (env, DB, listen)
 * --------------------------------------------------------------------
 */

require('dotenv').config();             // load .env BEFORE anything else
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Bootstrap: connect DB first, then start HTTP server.
const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 RentBridge API running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
  });
};

start();

// Catch unhandled async errors so the process logs them before exiting.
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled rejection:', err);
  process.exit(1);
});
