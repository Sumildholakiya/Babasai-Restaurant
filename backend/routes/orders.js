const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { placeOrder, getUserOrders, getOrder } = require('../controllers/orderController');

router.post('/place', protect, placeOrder);
router.get('/', protect, getUserOrders);
router.get('/:id', protect, getOrder);

module.exports = router;
