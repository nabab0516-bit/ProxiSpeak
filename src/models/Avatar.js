const mongoose = require('mongoose');
const schema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, trim: true },
  displayName: { type: String, required: true, trim: true, maxlength: 80 },
  roomId: { type: String, required: true, trim: true, index: true },
  position: { x: { type: Number, required: true, min: 0 }, y: { type: Number, required: true, min: 0 } },
  updatedAt: { type: Date, default: Date.now }
}, { versionKey: false });
module.exports = mongoose.model('Avatar', schema);
