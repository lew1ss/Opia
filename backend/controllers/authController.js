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

module.exports = {
    register
};