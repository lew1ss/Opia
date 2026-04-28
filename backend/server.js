const express = require('express');
const cors = require('cors');
const pool = require('./config/db');
const authRoutes = require('./routes/authRoutes');

require('dotenv').config();

const app = express();

const port = process.env.PORT;

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