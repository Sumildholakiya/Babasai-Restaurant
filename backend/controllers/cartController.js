const Cart = require('../models/Cart');
const MenuItem = require('../models/MenuItem');

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
exports.getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.menuItem', 'name image price category isAvailable');
    if (!cart) {
      cart = { items: [], total: 0 };
    }
    res.json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
exports.addToCart = async (req, res, next) => {
  try {
    const { menuItemId, quantity = 1 } = req.body;

    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) return res.status(404).json({ success: false, message: 'Menu item not found.' });
    if (!menuItem.isAvailable) return res.status(400).json({ success: false, message: 'Item is not available.' });

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    const existingIndex = cart.items.findIndex(item => item.menuItem.toString() === menuItemId);
    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({ menuItem: menuItemId, quantity, price: menuItem.price });
    }

    await cart.save();
    await cart.populate('items.menuItem', 'name image price category');
    res.json({ success: true, message: 'Item added to cart!', cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/update
// @access  Private
exports.updateCartItem = async (req, res, next) => {
  try {
    const { menuItemId, quantity } = req.body;

    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found.' });

    const itemIndex = cart.items.findIndex(item => item.menuItem.toString() === menuItemId);
    if (itemIndex === -1) return res.status(404).json({ success: false, message: 'Item not in cart.' });

    if (quantity <= 0) {
      cart.items.splice(itemIndex, 1);
    } else {
      cart.items[itemIndex].quantity = quantity;
    }

    await cart.save();
    await cart.populate('items.menuItem', 'name image price category');
    res.json({ success: true, message: 'Cart updated!', cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/remove/:menuItemId
// @access  Private
exports.removeFromCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) return res.status(404).json({ success: false, message: 'Cart not found.' });

    cart.items = cart.items.filter(item => item.menuItem.toString() !== req.params.menuItemId);
    await cart.save();
    await cart.populate('items.menuItem', 'name image price category');
    res.json({ success: true, message: 'Item removed from cart!', cart });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
exports.clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.json({ success: true, message: 'Cart cleared!' });
  } catch (error) {
    next(error);
  }
};
