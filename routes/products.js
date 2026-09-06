const express = require('express');
const router = express.Router();
const db = require('../database');

// ── GET /api/products ─────────────────────────────────────────────────
router.get('/', (req, res) => {
    try {
        const products = db.getProducts();

        // Optional filtering via query params: ?category=Marvel&inStock=true
        let result = products;

        if (req.query.category) {
            result = result.filter(p =>
                p.category.toLowerCase() === req.query.category.toLowerCase()
            );
        }

        if (req.query.inStock === 'true') {
            result = result.filter(p => p.inStock);
        }

        res.json({ products: result, total: result.length });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error.' });
    }
});

// ── GET /api/products/:id ─────────────────────────────────────────────
router.get('/:id', (req, res) => {
    try {
        const product = db.findProductById(req.params.id);
        if (!product)
            return res.status(404).json({ error: 'Product not found.' });

        res.json({ product });
    } catch (err) {
        res.status(500).json({ error: 'Internal server error.' });
    }
});

module.exports = router;
