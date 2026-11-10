const express = require('express');
const Room = require('../models/Room');

const router = express.Router();

// Validate obstacle data
const validObstacles = (obstacles) => {
  if (obstacles === undefined) return true;
  if (!Array.isArray(obstacles)) return false;

  return obstacles.every((obstacle) =>
      obstacle &&
      typeof obstacle.id === 'string' &&
      obstacle.id.trim().length > 0 &&
      (obstacle.type === undefined ||
          ['block', 'wall', 'furniture'].includes(obstacle.type)) &&
      Number.isFinite(obstacle.x) &&
      obstacle.x >= 0 &&
      Number.isFinite(obstacle.y) &&
      obstacle.y >= 0 &&
      Number.isFinite(obstacle.width) &&
      obstacle.width >= 1 &&
      Number.isFinite(obstacle.height) &&
      obstacle.height >= 1
  );
};

// GET all rooms
router.get('/', async (_req, res, next) => {
  try {
    const items = await Room.find()
        .sort({ updatedAt: -1 })
        .lean();

    res.json({
      items,
      count: items.length
    });
  } catch (e) {
    next(e);
  }
});

// GET room by roomId
router.get('/:roomId', async (req, res, next) => {
  try {
    const room = await Room.findOne({
      roomId: req.params.roomId
    }).lean();

    if (!room) {
      return res.status(404).json({
        error: 'Room not found'
      });
    }

    res.json(room);
  } catch (e) {
    next(e);
  }
});

// CREATE or UPDATE room
router.put('/:roomId', async (req, res, next) => {
  try {
    const { name, layout } = req.body || {};

    // Validate room name and layout
    if (
        typeof name !== 'string' ||
        !name.trim() ||
        name.trim().length > 100 ||
        !layout ||
        !Number.isFinite(layout.width) ||
        !Number.isFinite(layout.height) ||
        layout.width < 1 ||
        layout.height < 1 ||
        !validObstacles(layout.obstacles)
    ) {
      return res.status(400).json({
        error: 'name and valid layout {width, height, obstacles[]} are required'
      });
    }

    const room = await Room.findOneAndUpdate(
        { roomId: req.params.roomId },
        {
          roomId: req.params.roomId,
          name: name.trim(),
          layout: {
            width: layout.width,
            height: layout.height,
            obstacles: layout.obstacles || []
          }
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true
        }
    );

    res.json(room);
  } catch (e) {
    next(e);
  }
});

module.exports = router;