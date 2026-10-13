const { Server } = require('socket.io');
const Avatar = require('../models/Avatar');
const { distance2D } = require('../utils/distance');
const { DEFAULT_PROXIMITY_RADIUS_PX: radius } = require('../config/constants');

function attachSocketServer(httpServer) {
  const io = new Server(httpServer, { cors: { origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true } });
  const connected = new Map();
  io.on('connection', socket => {
    socket.emit('server:ready', { socketId: socket.id, proximityRadiusPx: radius });
    socket.on('room:join', async (payload = {}, ack = () => {}) => {
      try {
        const { userId, displayName, roomId, position } = payload;
        if (!userId || !displayName || !roomId || !position || !Number.isFinite(position.x)
          || !Number.isFinite(position.y) || position.x < 0 || position.y < 0)
          return ack({ ok: false, error: 'userId, displayName, roomId and valid position {x,y} are required' });
        const avatar = { userId: String(userId), displayName: String(displayName), roomId: String(roomId), position: { x: position.x, y: position.y } };
        await socket.join(avatar.roomId);
        connected.set(socket.id, avatar);
        await Avatar.findOneAndUpdate({ userId: avatar.userId }, { ...avatar, updatedAt: new Date() }, { upsert: true, new: true, runValidators: true });
        socket.to(avatar.roomId).emit('avatar:joined', { userId: avatar.userId, displayName: avatar.displayName, position: avatar.position });
        await broadcastNearby(avatar.roomId);
        ack({ ok: true, roomId: avatar.roomId, userId: avatar.userId });
      } catch (_) { ack({ ok: false, error: 'Could not join room' }); }
    });
    socket.on('avatar:move', async (payload = {}, ack = () => {}) => {
      try {
        const avatar = connected.get(socket.id);
        if (!avatar) return ack({ ok: false, error: 'Join a room before moving' });
        const { x, y } = payload.position || {};
        if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || y < 0)
          return ack({ ok: false, error: 'position must contain non-negative numeric x and y' });
        avatar.position = { x, y };
        await Avatar.findOneAndUpdate({ userId: avatar.userId }, { position: avatar.position, updatedAt: new Date() });
        socket.to(avatar.roomId).emit('avatar:moved', { userId: avatar.userId, position: avatar.position });
        await broadcastNearby(avatar.roomId);
        ack({ ok: true, position: avatar.position });
      } catch (_) { ack({ ok: false, error: 'Could not update position' }); }
    });
    socket.on('webrtc:signal', (payload = {}, ack = () => {}) => {
      const sender = connected.get(socket.id);
      if (!sender) return ack({ ok: false, error: 'Join a room before signaling' });
      const { targetUserId, signal } = payload;
      if (!targetUserId || !signal || typeof signal !== 'object') return ack({ ok: false, error: 'targetUserId and signal object are required' });
      const target = [...connected.entries()].find(([, a]) => a.userId === String(targetUserId) && a.roomId === sender.roomId);
      if (!target) return ack({ ok: false, error: 'Target user is not connected in this room' });
      if (distance2D(sender.position, target[1].position) > radius) return ack({ ok: false, error: 'Target user is outside the proximity radius' });
      io.to(target[0]).emit('webrtc:signal', { fromUserId: sender.userId, signal });
      ack({ ok: true });
    });
    socket.on('disconnect', async () => {
      const avatar = connected.get(socket.id);
      connected.delete(socket.id);
      if (avatar) {
        socket.to(avatar.roomId).emit('avatar:left', { userId: avatar.userId });
        await broadcastNearby(avatar.roomId).catch(() => {});
      }
    });
  });
  async function broadcastNearby(roomId) {
    const avatars = [...connected.values()].filter(a => a.roomId === roomId);
    for (const avatar of avatars) {
      const users = avatars.filter(other => other.userId !== avatar.userId && distance2D(avatar.position, other.position) <= radius)
        .map(other => ({ userId: other.userId, displayName: other.displayName, position: other.position }));
      for (const [socketId, a] of connected.entries()) if (a.userId === avatar.userId && a.roomId === roomId)
        io.to(socketId).emit('proximity:users', { users, radiusPx: radius });
    }
  }
  return io;
}
module.exports = { attachSocketServer };
