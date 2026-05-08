const bcrypt = require('bcrypt');
const pool = require('../config/db');

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Username, email and password are required.'
            });
        }

        const userCheck = await pool.query(
            'SELECT * FROM opia_users WHERE username = $1 OR email = $2',
            [username,email]
        );

        if (userCheck.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'Username or email already exists.'
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await pool.query(
            `INSERT INTO opia_users (username, email, password)
            VALUES ($1, $2, $3)
            RETURNING id, username, email, created_at`,
            [username, email, hashedPassword]
        );

        res.status(201).json({
            success: true,
            message: 'User registered successfully.',
            user: newUser.rows[0]
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Register failed.',
            error: err.message
        });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required.'
            });
        }

        const userResult = await pool.query(
            'SELECT * FROM opia_users WHERE email = $1',
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        const user = userResult.rows[0];

        const isPasswordCorrect = await bcrypt.compare(password, user.password);

        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password.'
            });
        }

        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email
        };

        res.json({
            success: true,
            message: 'Login successful.',
            user: req.session.user
        });
        
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Login failed.',
            error: err.message
        });
    }
};

module.exports = {
    register,
    login
};