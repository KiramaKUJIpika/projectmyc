const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

const db = require('../database');
const { authenticateToken, generateToken } = require('../middleware');

// ── POST /api/auth/register ───────────────────────────────────────────
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ error: 'Email and password are required.' });

        if (password.length < 6)
            return res.status(400).json({ error: 'Password must be at least 6 characters.' });

        if (db.findUserByEmail(email))
            return res.status(409).json({ error: 'Email already registered.' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = db.createUser(email, hashedPassword);

        const token = generateToken(user);
        const { password: _, ...safeUser } = user;

        res.status(201).json({
            message: 'Account created successfully.',
            token,
            user: safeUser
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// ── POST /api/auth/login ──────────────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password)
            return res.status(400).json({ error: 'Email and password are required.' });

        const user = db.findUserByEmail(email);
        if (!user)
            return res.status(401).json({ error: 'Invalid email or password.' });

        const valid = await bcrypt.compare(password, user.password);
        if (!valid)
            return res.status(401).json({ error: 'Invalid email or password.' });

        const token = generateToken(user);
        const { password: _, ...safeUser } = user;

        res.json({
            message: 'Login successful.',
            token,
            user: safeUser
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// ── GET /api/auth/me ──────────────────────────────────────────────────
router.get('/me', authenticateToken, (req, res) => {
    try {
        const user = db.findUserById(req.userId);
        if (!user)
            return res.status(404).json({ error: 'User not found.' });

        const { password: _, ...safeUser } = user;
        res.json({ user: safeUser });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;
