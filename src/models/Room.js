const mongoose = require('mongoose');
const obstacleSchema = new mongoose.Schema({
  id: { type: String, required: true }, type: { type: String, enum: ['block','wall','furniture'], default: 'block' },
  x: { type: Number, required: true, min: 0 }, y: { type: Number, required: true, min: 0 },
  width: { type: Number, required: true, min: 1 }, height: { type: Number, required: true, min: 1 }
}, { _id: false });
const schema = new mongoose.Schema({
  roomId: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  layout: { width: { type: Number, default: 1200, min: 1 }, height: { type: Number, default: 800, min: 1 }, obstacles: { type: [obstacleSchema], default: [] } }
}, { timestamps: true, versionKey: false });
module.exports = mongoose.model('Room', schema);
