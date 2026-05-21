const Order    = require('../models/Order');
const Review   = require('../models/Review');
const User     = require('../models/User');
const MenuItem = require('../models/MenuItem');

// ── Helper: month name array ──────────────────────────────────────────────────
const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

// @desc   Full report data in one call
// @route  GET /api/reports/summary
// @access Admin
exports.getSummary = async (req, res, next) => {
  try {
    const [orders, reviews, users, menuItems] = await Promise.all([
      Order.find().populate('user', 'name'),
      Review.find().populate('user', 'name'),
      User.find({ role: 'user' }),
      MenuItem.find(),
    ]);

    // ── 1. Top-level KPI cards ──────────────────────────────────────────────
    const totalRevenue   = orders.reduce((s, o) => s + (o.total || 0), 0);
    const totalOrders    = orders.length;
    const totalUsers     = users.length;
    const avgRating      = reviews.length
      ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
      : '0.0';

    // ── 2. Orders by status ─────────────────────────────────────────────────
    const statusCount = {};
    orders.forEach(o => { statusCount[o.status] = (statusCount[o.status] || 0) + 1; });
    const ordersByStatus = Object.entries(statusCount).map(([status, count]) => ({ status, count }));

    // ── 3. Monthly revenue — last 6 months ──────────────────────────────────
    const now      = new Date();
    const monthly  = [];
    for (let i = 5; i >= 0; i--) {
      const d     = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year  = d.getFullYear();
      const month = d.getMonth(); // 0-indexed
      const label = MONTHS[month] + ' ' + year;

      const monthOrders = orders.filter(o => {
        const od = new Date(o.createdAt);
        return od.getFullYear() === year && od.getMonth() === month;
      });

      monthly.push({
        month:        label,
        revenue:      monthOrders.reduce((s, o) => s + (o.total || 0), 0),
        orderCount:   monthOrders.length,
        delivered:    monthOrders.filter(o => o.status === 'Delivered').length,
        cancelled:    monthOrders.filter(o => o.status === 'Cancelled').length,
      });
    }

    // ── 4. Top menu categories by order frequency ────────────────────────────
    // Count how many times each category appears in order items
    const catCount = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        // item.menuItem is populated or an id — find category from menuItems
        const found = menuItems.find(m => m._id.toString() === (item.menuItem?.toString() || ''));
        const cat = found ? found.category : 'Other';
        catCount[cat] = (catCount[cat] || 0) + item.quantity;
      });
    });
    const topCategories = Object.entries(catCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 7);

    // ── 5. Top 5 best-selling items ──────────────────────────────────────────
    const itemCount = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const key = item.name;
        itemCount[key] = (itemCount[key] || 0) + item.quantity;
      });
    });
    const topItems = Object.entries(itemCount)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // ── 6. Review rating distribution (1–5 stars) ────────────────────────────
    const ratingDist = [1, 2, 3, 4, 5].map(star => ({
      star,
      count: reviews.filter(r => r.rating === star).length,
    }));

    // ── 7. Recent 10 orders ───────────────────────────────────────────────────
    const recentOrders = orders
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 10)
      .map(o => ({
        id:        o._id,
        customer:  o.user?.name || 'Unknown',
        total:     o.total,
        status:    o.status,
        items:     o.items.length,
        date:      o.createdAt,
      }));

    res.json({
      success: true,
      kpi: { totalRevenue, totalOrders, totalUsers, avgRating, totalReviews: reviews.length, totalMenuItems: menuItems.length },
      ordersByStatus,
      monthly,
      topCategories,
      topItems,
      ratingDist,
      recentOrders,
    });
  } catch (error) {
    next(error);
  }
};
