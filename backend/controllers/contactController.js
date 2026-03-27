const Contact = require('../models/Contact');

// @desc    Submit a contact message (public)
// @route   POST /api/contact
// @access  Public
exports.submitContact = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, subject and message are required.'
      });
    }

    const contact = await Contact.create({ name, email, phone, subject, message });

    res.status(201).json({
      success: true,
      message: 'Your message has been received! We will get back to you within 24 hours.',
      contact
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all contact messages (admin)
// @route   GET /api/contact
// @access  Admin
exports.getAllContacts = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

    const contacts = await Contact.find(filter).sort({ createdAt: -1 });

    const unreadCount = await Contact.countDocuments({ status: 'Unread' });

    res.json({ success: true, count: contacts.length, unreadCount, contacts });
  } catch (error) {
    next(error);
  }
};

// @desc    Update contact message status (admin)
// @route   PUT /api/contact/:id/status
// @access  Admin
exports.updateContactStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const contact = await Contact.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!contact) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }

    res.json({ success: true, message: 'Status updated!', contact });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete contact message (admin)
// @route   DELETE /api/contact/:id
// @access  Admin
exports.deleteContact = async (req, res, next) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }
    res.json({ success: true, message: 'Message deleted!' });
  } catch (error) {
    next(error);
  }
};
