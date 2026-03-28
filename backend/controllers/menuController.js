const MenuItem = require('../models/MenuItem');

// @desc    Get all menu items with filtering
// @route   GET /api/menu
// @access  Public
exports.getMenuItems = async (req, res, next) => {
  try {
    const { category, minPrice, maxPrice, search, available } = req.query;
    let query = {};

    if (category && category !== 'All') query.category = category;
    if (available !== undefined) query.isAvailable = available === 'true';
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }
    if (search) query.name = { $regex: search, $options: 'i' };

    const items = await MenuItem.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: items.length, items });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single menu item
// @route   GET /api/menu/:id
// @access  Public
exports.getMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Menu item not found.' });
    res.json({ success: true, item });
  } catch (error) {
    next(error);
  }
};

// @desc    Create menu item
// @route   POST /api/menu
// @access  Admin
exports.createMenuItem = async (req, res, next) => {
  try {
    const { name, description, price, category, isAvailable, imageUrl } = req.body;

    // Full backend base URL so frontend can load image from port 5000
    const BASE_URL = process.env.BASE_URL || 'babasai-restaurant.onrender.com';

    let image = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400';
    if (req.file) {
      // Store full URL — e.g. http://babasai-restaurant.onrender.com/uploads/menu-xxx.jpg
      image = BASE_URL + '/uploads/' + req.file.filename;
    } else if (imageUrl && imageUrl.trim()) {
      image = imageUrl.trim();
    }

    const item = await MenuItem.create({ name, description, price, category, image, isAvailable });
    res.status(201).json({ success: true, message: 'Menu item created!', item });
  } catch (error) {
    next(error);
  }
};

// @desc    Update menu item
// @route   PUT /api/menu/:id
// @access  Admin
exports.updateMenuItem = async (req, res, next) => {
  try {
    const { name, description, price, category, isAvailable, imageUrl } = req.body;
    const BASE_URL = process.env.BASE_URL || 'http://babasai-restaurant.onrender.com';

    const updateData = { name, description, price, category, isAvailable };

    if (req.file) {
      // New file uploaded — store full URL
      updateData.image = BASE_URL + '/uploads/' + req.file.filename;
    } else if (imageUrl && imageUrl.trim()) {
      // New URL provided — save it
      updateData.image = imageUrl.trim();
    }
    // If neither — keep existing image (do not include image in updateData)

    const item = await MenuItem.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Menu item not found.' });
    res.json({ success: true, message: 'Menu item updated!', item });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete menu item
// @route   DELETE /api/menu/:id
// @access  Admin
exports.deleteMenuItem = async (req, res, next) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Menu item not found.' });
    res.json({ success: true, message: 'Menu item deleted!' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get categories
// @route   GET /api/menu/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await MenuItem.distinct('category');
    res.json({ success: true, categories: ['All', ...categories] });
  } catch (error) {
    next(error);
  }
};
