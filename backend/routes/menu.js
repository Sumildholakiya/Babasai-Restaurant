const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, adminOnly } = require('../middleware/auth');
const {
  getMenuItems, getMenuItem, createMenuItem,
  updateMenuItem, deleteMenuItem, getCategories
} = require('../controllers/menuController');

// Multer config for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `menu-${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error('Only image files are allowed.'));
  }
});

router.get('/categories', getCategories);
router.get('/', getMenuItems);
router.get('/:id', getMenuItem);
router.post('/', protect, adminOnly, upload.single('image'), createMenuItem);
router.put('/:id', protect, adminOnly, upload.single('image'), updateMenuItem);
router.delete('/:id', protect, adminOnly, deleteMenuItem);

module.exports = router;
