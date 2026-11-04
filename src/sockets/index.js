const { Server } = require('socket.io');
const Avatar = require('../models/Avatar');
const { distance2D } = require('../utils/distance');
const {
  DEFAULT_PROXIMITY_RADIUS_PX: radius
} = require('../config/constants');

function attachSocketServer(server) {
  const io = new Server(server, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST']
    }
  });

  const connected = new Map();
  const users = new Map();

  function validText(value) {
    return typeof value === 'string' && value.trim().length > 0;
  }

  function validPosition(position) {
    return (
        position &&
        Number.isFinite(position.x) &&
        Number.isFinite(position.y) &&
        position.x >= 0 &&
        position.y >= 0
    );
  }

  function acknowledge(callback, response) {
    if (typeof callback === 'function') {
      callback(response);
    }
  }

  function broadcastNearby(roomId) {
    const roomUsers = [...users.values()].filter(
        user => user.roomId === roomId
    );

    for (const user of roomUsers) {
      const nearby = roomUsers
          .filter(other => other.userId !== user.userId)
          .filter(
              other => distance2D(user.position, other.position) <= radius
          )
          .map(other => ({
            userId: other.userId,
            displayName: other.displayName,
            position: other.position
          }));

      for (const socketId of user.sockets) {
        io.to(socketId).emit('proximity:update', nearby);
      }
    }
  }

  async function removeSocket(socketId) {
    const userId = connected.get(socketId);

    if (!userId) return;

    connected.delete(socketId);

    const user = users.get(userId);

    if (!user) return;

    user.sockets.delete(socketId);

    // Keep avatar online if another tab is still connected.
    if (user.sockets.size > 0) {
      broadcastNearby(user.roomId);
      return;
    }

    users.delete(userId);

    io.to(user.roomId).emit('avatar:left', {
      userId: user.userId
    });

    broadcastNearby(user.roomId);
  }

  io.on('connection', socket => {
    socket.emit('server:ready', {
      socketId: socket.id,
      proximityRadiusPx: radius
    });

    // JOIN ROOM
    socket.on('room:join', async (data = {}, callback) => {
      try {
        const {
          userId,
          displayName,
          roomId,
          position
        } = data;

        if (
            !validText(userId) ||
            !validText(displayName) ||
            !validText(roomId) ||
            !validPosition(position)
        ) {
          acknowledge(callback, {
            ok: false,
            error: 'Invalid room join data'
          });
          return;
        }

        const cleanUserId = userId.trim();
        const cleanName = displayName.trim();
        const cleanRoom = roomId.trim();

        // Remove this socket from its previous identity.
        const previousUserId = connected.get(socket.id);

        if (previousUserId && previousUserId !== cleanUserId) {
          const previousUser = users.get(previousUserId);

          if (previousUser) {
            await socket.leave(previousUser.roomId);
          }

          await removeSocket(socket.id);
        }

        let user = users.get(cleanUserId);

        const isNewUser = !user;
        const oldRoom = user?.roomId;
        const roomChanged = Boolean(
            user && oldRoom !== cleanRoom
        );

        if (!user) {
          user = {
            userId: cleanUserId,
            displayName: cleanName,
            roomId: cleanRoom,
            position: {
              x: position.x,
              y: position.y
            },
            sockets: new Set()
          };

          users.set(cleanUserId, user);
        } else {
          user.displayName = cleanName;
          user.position = {
            x: position.x,
            y: position.y
          };
        }

        user.sockets.add(socket.id);
        connected.set(socket.id, cleanUserId);

        // Move all tabs if the user changes rooms.
        if (roomChanged) {
          for (const socketId of user.sockets) {
            const existingSocket = io.sockets.sockets.get(socketId);

            if (existingSocket) {
              await existingSocket.leave(oldRoom);
              await existingSocket.join(cleanRoom);
            }
          }

          user.roomId = cleanRoom;

          io.to(oldRoom).emit('avatar:left', {
            userId: cleanUserId
          });
        } else {
          await socket.join(cleanRoom);
        }

        await Avatar.findOneAndUpdate(
            { userId: cleanUserId },
            {
              userId: cleanUserId,
              displayName: cleanName,
              roomId: cleanRoom,
              position: user.position,
              updatedAt: new Date()
            },
            {
              upsert: true,
              new: true,
              runValidators: true
            }
        );

        if (isNewUser || roomChanged) {
          socket.to(cleanRoom).emit('avatar:joined', {
            userId: cleanUserId,
            displayName: cleanName,
            position: user.position
          });
        } else {
          socket.to(cleanRoom).emit('avatar:moved', {
            userId: cleanUserId,
            position: user.position
          });
        }

        broadcastNearby(cleanRoom);

        // Send acknowledgement to the joining client.
        acknowledge(callback, {
          ok: true,
          userId: cleanUserId,
          roomId: cleanRoom,
          position: user.position
        });

        socket.emit('room:joined', {
          userId: cleanUserId,
          displayName: cleanName,
          roomId: cleanRoom,
          position: user.position
        });

      } catch (error) {
        console.error('room:join error:', error);

        acknowledge(callback, {
          ok: false,
          error: 'Unable to join room'
        });
      }
    });

    // AVATAR MOVEMENT
    socket.on('avatar:move', async (data = {}, callback) => {
      try {
        const userId = connected.get(socket.id);
        const user = userId ? users.get(userId) : null;

        if (!user || !validPosition(data.position)) {
          acknowledge(callback, {
            ok: false,
            error: 'Invalid avatar movement'
          });
          return;
        }

        user.position = {
          x: data.position.x,
          y: data.position.y
        };

        await Avatar.findOneAndUpdate(
            { userId: user.userId },
            {
              position: user.position,
              updatedAt: new Date()
            },
            { runValidators: true }
        );

        const movement = {
          userId: user.userId,
          position: user.position
        };

        socket.to(user.roomId).emit('avatar:moved', movement);

        broadcastNearby(user.roomId);

        acknowledge(callback, {
          ok: true,
          position: user.position
        });

      } catch (error) {
        console.error('avatar:move error:', error);

        acknowledge(callback, {
          ok: false,
          error: 'Unable to update position'
        });
      }
    });

    // WEBRTC SIGNALING
    socket.on('webrtc:signal', (data = {}, callback) => {
      const senderId = connected.get(socket.id);
      const sender = senderId ? users.get(senderId) : null;

      if (!sender) {
        acknowledge(callback, {
          ok: false,
          error: 'Join a room before signaling'
        });
        return;
      }

      if (
          !validText(data.targetUserId) ||
          !data.signal ||
          typeof data.signal !== 'object'
      ) {
        acknowledge(callback, {
          ok: false,
          error: 'Invalid WebRTC signal'
        });
        return;
      }

      const target = users.get(data.targetUserId.trim());

      if (
          !target ||
          target.roomId !== sender.roomId ||
          target.userId === sender.userId
      ) {
        acknowledge(callback, {
          ok: false,
          error: 'Target user is unavailable'
        });
        return;
      }

      const distance = distance2D(
          sender.position,
          target.position
      );

      if (distance > radius) {
        acknowledge(callback, {
          ok: false,
          error: 'Target user is outside the proximity radius'
        });
        return;
      }

      for (const socketId of target.sockets) {
        io.to(socketId).emit('webrtc:signal', {
          fromUserId: sender.userId,
          signal: data.signal
        });
      }

      acknowledge(callback, {
        ok: true
      });
    });

    // DISCONNECT
    socket.on('disconnect', () => {
      removeSocket(socket.id).catch(error => {
        console.error('Socket disconnect error:', error);
      });
    });
  });

  return io;
}

module.exports = { attachSocketServer };