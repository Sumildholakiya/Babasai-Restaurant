const Review = require('../models/Review');

// @desc    Get all reviews
// @route   GET /api/reviews
// @access  Public
exports.getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json({ success: true, count: reviews.length, reviews });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit review
// @route   POST /api/reviews
// @access  Private
exports.createReview = async (req, res, next) => {
  try {
    const { message, rating } = req.body;

    if (!message || !rating) {
      return res.status(400).json({ success: false, message: 'Message and rating are required.' });
    }

    const review = await Review.create({ user: req.user.id, message, rating });
    await review.populate('user', 'name');
    res.status(201).json({ success: true, message: 'Review submitted!', review });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Admin
exports.deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
    res.json({ success: true, message: 'Review deleted!' });
  } catch (error) {
    next(error);
  }
};
