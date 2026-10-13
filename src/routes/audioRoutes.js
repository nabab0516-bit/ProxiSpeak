const express = require('express');
const AudioClip = require('../models/AudioClip');
const { validPosition } = require('../utils/validation');
const { distance2D } = require('../utils/distance');
const { DEFAULT_PROXIMITY_RADIUS_PX } = require('../config/constants');
const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const filter = { active: true };
    if (req.query.roomId) filter.roomId = String(req.query.roomId);
    const items = await AudioClip.find(filter).sort({ updatedAt: -1 }).lean();
    res.json({ items, count: items.length });
  } catch (e) { next(e); }
});

router.get('/nearby', async (req, res, next) => {
  try {
    const x = Number(req.query.x), y = Number(req.query.y);
    const radius = req.query.radiusPx === undefined ? DEFAULT_PROXIMITY_RADIUS_PX : Number(req.query.radiusPx);
    if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || y < 0)
      return res.status(400).json({ error: 'x and y must be non-negative numbers' });
    if (!Number.isFinite(radius) || radius <= 0 || radius > 5000)
      return res.status(400).json({ error: 'radiusPx must be greater than 0 and at most 5000' });
    const filter = { active: true };
    if (req.query.roomId) filter.roomId = String(req.query.roomId);
    const clips = await AudioClip.find(filter).lean();
    const items = clips.map(c => ({ ...c, distancePx: distance2D({ x, y }, c.position) }))
      .filter(c => c.distancePx <= radius).sort((a,b) => a.distancePx - b.distancePx);
    res.json({ radiusPx: radius, count: items.length, items });
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { ownerId, roomId, title, position } = req.body || {};
    if (!ownerId || !roomId || !validPosition(position))
      return res.status(400).json({ error: 'ownerId, roomId and non-negative numeric position {x,y} are required' });
    res.status(201).json(await AudioClip.create({ ownerId, roomId, title, position }));
  } catch (e) { next(e); }
});

router.patch('/:id/position', async (req, res, next) => {
  try {
    const { position } = req.body || {};
    if (!validPosition(position)) return res.status(400).json({ error: 'position must contain non-negative numeric x and y' });
    const clip = await AudioClip.findByIdAndUpdate(req.params.id, { position, updatedAt: new Date() }, { new: true, runValidators: true });
    if (!clip) return res.status(404).json({ error: 'Audio session not found' });
    res.json(clip);
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const clip = await AudioClip.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
    if (!clip) return res.status(404).json({ error: 'Audio session not found' });
    res.json({ message: 'Audio session deactivated', id: clip._id });
  } catch (e) { next(e); }
});
module.exports = router;
