const express = require('express');
const router = express.Router();
const db = require('../database');
const { authenticateToken } = require('../middleware');

// All order routes require authentication
router.use(authenticateToken);

// ── GET /api/orders ───────────────────────────────────────────────────
router.get('/', (req, res) => {
    try {
        const orders = db.getOrdersByUser(req.userId);
        // Most recent first
        const sorted = [...orders].sort((a, b) =>
            new Date(b.createdAt) - new Date(a.createdAt)
        );
        res.json({ orders: sorted, total: sorted.length });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// ── GET /api/orders/:id ───────────────────────────────────────────────
router.get('/:id', (req, res) => {
    try {
        const order = db.findOrderById(req.params.id);
        if (!order)
            return res.status(404).json({ error: 'Order not found.' });

        // Users can only see their own orders
        if (order.userId !== req.userId)
            return res.status(403).json({ error: 'Access denied.' });

        res.json({ order });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// ── POST /api/orders ──────────────────────────────────────────────────
router.post('/', (req, res) => {
    try {
        const { items, total, address, paymentMethod } = req.body;

        if (!items || !Array.isArray(items) || items.length === 0)
            return res.status(400).json({ error: 'Order must have at least one item.' });

        if (!address || !address.trim())
            return res.status(400).json({ error: 'Delivery address is required.' });

        if (!paymentMethod)
            return res.status(400).json({ error: 'Payment method is required.' });

        if (!total || total <= 0)
            return res.status(400).json({ error: 'Invalid order total.' });

        const order = db.createOrder(req.userId, { items, total, address, paymentMethod });
        res.status(201).json({ message: 'Order created successfully.', order });
    } catch (err) {
        console.error('Order error:', err);
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// ── PUT /api/orders/:id ───────────────────────────────────────────────
router.put('/:id', (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'processing', 'completed', 'cancelled'];

        if (!status || !validStatuses.includes(status))
            return res.status(400).json({ error: `Status must be one of: ${validStatuses.join(', ')}` });

        const order = db.findOrderById(req.params.id);
        if (!order)
            return res.status(404).json({ error: 'Order not found.' });

        if (order.userId !== req.userId)
            return res.status(403).json({ error: 'Access denied.' });

        const updated = db.updateOrderStatus(req.params.id, status);
        res.json({ message: 'Order updated.', order: updated });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;
