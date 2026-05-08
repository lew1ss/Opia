const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const session = require('express-session');
const PgSession = require('connect-pg-simple')(session);

require('dotenv').config();

const app = express();

const port = process.env.PORT;

app.use(session({
    store: new PgSession({
        pool: pool,
        tableName: 'opia_session',

    }),
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 2, // 2 days
        httpOnly: true,
        secure: false
    }
}));

app.use(cors({
    origin: 'http://localhost:5174',
    credentials: true
}));

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Opia backend is working.');
});

app.use('/api/auth', authRoutes);

app.listen(port, () => {
    console.log(`Server running on port http://localhost:${port}`);
});