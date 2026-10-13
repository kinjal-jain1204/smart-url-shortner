const mongoose = require('mongoose');

const ClickLogSchema = new mongoose.Schema({
  urlId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Url',
    required: true,
    index: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  ipHash: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    default: 'Unknown',
  },
  city: {
    type: String,
    default: 'Unknown',
  },
  deviceType: {
    type: String,
    default: 'desktop', // desktop, mobile, tablet
  },
  os: {
    type: String,
    default: 'Unknown', // Windows, iOS, Android, macOS, Linux
  },
  browser: {
    type: String,
    default: 'Unknown', // Chrome, Safari, Firefox, Edge
  },
  referrer: {
    type: String,
    default: 'Direct', // instagram.com, t.co, google.com
  },
  isBot: {
    type: Boolean,
    default: false,
  }
});

module.exports = mongoose.model('ClickLog', ClickLogSchema);