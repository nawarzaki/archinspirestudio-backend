// models/Subsection.js
const mongoose = require('mongoose');

const SubsectionSchema = new mongoose.Schema({
  section: { type: String, required: true },
  title: { type: String, required: true },
  description: String,
  imageUrls: [
    {
      url: String,
      caption: String,
      captionFont: String,
      captionColor: String
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model('Subsection', SubsectionSchema);
