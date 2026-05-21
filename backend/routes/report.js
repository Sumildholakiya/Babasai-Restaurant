const express = require('express');
const router  = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const { getSummary } = require('../controllers/reportController');

router.use(protect, adminOnly);

router.get('/summary', getSummary);

module.exports = router;
