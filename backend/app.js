/**
 * app.js
 * --------------------------------------------------------------------
 * Express app configuration. Registers middleware, attaches routes,
 * and wires up centralized error handling.
 *
 * Order of middleware matters. The order used here:
 *   1. Security headers (helmet)
 *   2. CORS
 *   3. Body parsing
 *   4. Logging
 *   5. Rate limiting (only on sensitive routes — see authRoutes)
 *   6. Routes
 *   7. 404 handler  (must come AFTER routes)
 *   8. Error handler (must come LAST)
 * --------------------------------------------------------------------
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// ----- 1. Security headers ------------------------------------------
// Helmet sets a bunch of HTTP headers that make common attacks harder.
app.use(helmet());

// ----- 2. CORS ------------------------------------------------------
// CORS_ORIGIN can be a comma-separated list. We reflect the origin only
// if it appears in the allow-list. Use "*" during early development.
const corsOrigins = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map((s) => s.trim());

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow tools like Postman (no Origin header) and exact-match origins.
      if (!origin) return callback(null, true);
      if (corsOrigins.includes('*') || corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked: ${origin}`));
    },
    credentials: true,
  })
);

// ----- 3. Body parsing ---------------------------------------------
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ----- 4. Logging ---------------------------------------------------
// Morgan logs every request. We use "dev" in development (colored, short)
// and "combined" in production (Apache-style, more detail).
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// ----- 5. Health check (public, no auth) ---------------------------
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'RentBridge API is running',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development',
  });
});

// ----- 6. Routes ---------------------------------------------------
// app.js sits at backend/ root; routes/ is a sibling folder.
app.use('/api/auth',          require('./routes/authRoutes'));
app.use('/api/users',         require('./routes/userRoutes'));
app.use('/api/wallet',        require('./routes/walletRoutes'));
app.use('/api/transactions',  require('./routes/transactionRoutes'));
app.use('/api/expenses',      require('./routes/expenseRoutes'));
app.use('/api/budgets',       require('./routes/budgetRoutes'));
app.use('/api/categories',    require('./routes/categoryRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/reports',       require('./routes/reportRoutes'));
app.use('/api/admin',         require('./routes/adminRoutes'));

// Friendly root.
app.get('/', (req, res) => {
  res.json({
    name: 'RentBridge API',
    docs: '/api/health',
    version: '1.0.0',
  });
});

// ----- 7. 404 handler (after routes) -------------------------------
const notFound = require('./middlewares/notFound');
app.use(notFound);

// ----- 8. Centralized error handler (LAST) -------------------------
const errorHandler = require('./middlewares/errorHandler');
app.use(errorHandler);

module.exports = app;
