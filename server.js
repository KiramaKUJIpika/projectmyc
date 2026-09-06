require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Serve frontend static files ───────────────────────────────────────
// public/ is one level up from backend/
const publicPath = path.join(__dirname, 'public');
app.use(express.static(publicPath));

// ── API Routes ────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

// ── Health check ──────────────────────────────────────────────────────
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        users: db.getUsers().length,
        orders: db.getOrders().length
    });
});

// ── Catch-all: serve index.html for any non-API route ─────────────────
app.get('*', (req, res) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

// ── Start ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n✅ ComicShop server running on http://localhost:${PORT}`);
    console.log(`\n📡 API Endpoints:`);
    console.log(`   POST  /api/auth/register`);
    console.log(`   POST  /api/auth/login`);
    console.log(`   GET   /api/auth/me`);
    console.log(`   GET   /api/products`);
    console.log(`   GET   /api/products/:id`);
    console.log(`   GET   /api/orders`);
    console.log(`   POST  /api/orders`);
    console.log(`   PUT   /api/orders/:id`);
    console.log(`\n🌐 Frontend: http://localhost:${PORT}`);
    console.log(`🏥 Health:   http://localhost:${PORT}/health\n`);
});
