const express = require('express');
const Room = require('../models/Room');
const router = express.Router();
router.get('/', async (_req, res, next) => {
  try { const items = await Room.find().sort({ updatedAt: -1 }).lean(); res.json({ items, count: items.length }); }
  catch (e) { next(e); }
});
router.get('/:roomId', async (req, res, next) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId }).lean();
    if (!room) return res.status(404).json({ error: 'Room not found' });
    res.json(room);
  } catch (e) { next(e); }
});
router.put('/:roomId', async (req, res, next) => {
  try {
    const { name, layout } = req.body || {};
    if (!name || !layout || !Number.isFinite(layout.width) || !Number.isFinite(layout.height)
      || layout.width <= 0 || layout.height <= 0 || !Array.isArray(layout.obstacles || []))
      return res.status(400).json({ error: 'name and layout {width, height, obstacles[]} are required' });
    const room = await Room.findOneAndUpdate({ roomId: req.params.roomId }, { roomId: req.params.roomId, name, layout },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true });
    res.json(room);
  } catch (e) { next(e); }
});
module.exports = router;
