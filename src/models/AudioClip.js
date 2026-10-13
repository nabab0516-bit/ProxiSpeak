const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  ownerId: { type: String, required: true, trim: true, index: true },
  roomId: { type: String, required: true, trim: true, index: true },
  title: { type: String, trim: true, maxlength: 120, default: 'Proximity audio session' },
  position: { x: { type: Number, required: true }, y: { type: Number, required: true } },
  active: { type: Boolean, default: true }
}, { timestamps: true, versionKey: false });
module.exports = mongoose.model('AudioClip', schema);
