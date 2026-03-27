const Order = require('../models/Order');
const Cart = require('../models/Cart');

// @desc    Place order from cart
// @route   POST /api/orders/place
// @access  Private
exports.placeOrder = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.menuItem', 'name price');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your cart is empty.' });
    }

    const orderItems = cart.items.map(item => ({
      menuItem: item.menuItem._id,
      name: item.menuItem.name,
      price: item.price,
      quantity: item.quantity
    }));

    const order = await Order.create({
      user: req.user.id,
      items: orderItems,
      total: cart.total,
      deliveryAddress: req.body.deliveryAddress || 'Surat, Gujarat, India'
    });

    // Clear cart after placing order
    cart.items = [];
    await cart.save();

    res.status(201).json({ success: true, message: 'Order placed successfully!', order });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
exports.getUserOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id })
      .populate('items.menuItem', 'name image')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('items.menuItem', 'name image');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    // Users can only see their own orders
    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }
    res.json({ success: true, order });
  } catch (error) {
    next(error);
  }
};
