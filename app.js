const express = require('express');
const path = require('path');
const { sequelize } = require('./models');
const initDatabase = require('./db-init');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware for login handling
const session = require('express-session');
app.use(session({
  secret: process.env.SESSION_SECRET || 'supersecretkey',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 }
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Auth routes (login/logout) must be mounted before protected routes
app.use('/', require('./routes/auth'));

// Protect all subsequent routes – only logged-in admins can access
const { ensureAuthenticated, ensureAdmin } = require('./middleware/auth');
app.use(ensureAuthenticated);
app.use(ensureAdmin);

// Main application routes (dashboard, employees, categories, assets)
app.use('/', require('./routes'));

async function startServer() {
  try {
    await initDatabase();

    console.log('Connecting to PostgreSQL database...');
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    await sequelize.sync();
    console.log('Database models synchronized.');

    app.listen(PORT, () => {
      console.log(`Server is running at http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

startServer();
