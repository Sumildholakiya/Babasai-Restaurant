const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    enum: [
      'Table Reservation',
      'Bulk / Catering Order',
      'Feedback & Suggestions',
      'Complaint',
      'Partnership Enquiry',
      'Other'
    ]
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    minlength: [10, 'Message must be at least 10 characters']
  },
  status: {
    type: String,
    enum: ['Unread', 'Read', 'Replied'],
    default: 'Unread'
  }
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);
