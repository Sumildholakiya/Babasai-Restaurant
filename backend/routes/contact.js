const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  submitContact,
  getAllContacts,
  updateContactStatus,
  deleteContact
} = require('../controllers/contactController');

// Public — anyone can submit
router.post('/', submitContact);

// Admin only
router.get('/',           protect, adminOnly, getAllContacts);
router.put('/:id/status', protect, adminOnly, updateContactStatus);
router.delete('/:id',     protect, adminOnly, deleteContact);

module.exports = router;
