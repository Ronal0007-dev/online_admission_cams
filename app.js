require('dotenv').config();
const express = require('express');
const path = require('path');
const session = require('express-session');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const sequelize = require('./config/database');
const Admin = require('./models/Admin');
const Student = require('./models/Student');

const app = express();
const PORT = process.env.PORT || 3000;

// ── View Engine ────────────────────────────────────────────
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// ── Static Files ───────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ── Middleware ─────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

app.use(session({
  secret: process.env.SESSION_SECRET || 'greenfield-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24h
}));

app.use(flash());

// ── Global Locals ──────────────────────────────────────────
app.use((req, res, next) => {
  res.locals.schoolName = process.env.SCHOOL_NAME || 'Canon Andrea Mwaka International School';
  next();
});

// ── Routes ─────────────────────────────────────────────────
app.use('/', require('./routes/student'));
app.use('/admin', require('./routes/admin'));

// ── 404 ────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).send(`
    <html><body style="font-family:sans-serif;text-align:center;padding:80px">
    <h1>404 – Page Not Found</h1>
    <p><a href="/">← Back to Home</a></p>
    </body></html>
  `);
});

// ── Database Sync & Start ──────────────────────────────────
async function start() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Sync tables (alter: false in production, true for dev)
    await sequelize.sync({ alter: true });
    console.log('✅ Database tables synced');

    //deleted 
    

    app.listen(PORT, () => {
      console.log(`\n🏫 School Admission System running at http://localhost:${PORT}`);
      console.log(`   Admin panel: http://localhost:${PORT}/admin/login\n`);
    });
  } catch (err) {
    console.error('❌ Startup failed:', err.message);
    process.exit(1);
  }
}

start();
