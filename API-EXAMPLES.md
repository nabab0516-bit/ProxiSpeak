# API examples

Health: `GET http://localhost:3000/api/health`

Create session: `POST http://localhost:3000/api/audio`
```json
{"ownerId":"u1","roomId":"office-1","title":"Talk","position":{"x":100,"y":120}}
```

Nearby sessions: `GET http://localhost:3000/api/audio/nearby?x=100&y=120&radiusPx=100&roomId=office-1`

Save layout: `PUT http://localhost:3000/api/rooms/office-1`
```json
{"name":"Main Office","layout":{"width":1200,"height":800,"obstacles":[]}}
```

Socket.IO client sketch:
```javascript
import { io } from 'socket.io-client';
const socket = io('http://localhost:3000');
socket.on('server:ready', console.log);
socket.emit('room:join', {
  userId: 'u1', displayName: 'Yashi', roomId: 'office-1',
  position: { x: 100, y: 120 }
}, console.log);
socket.on('proximity:users', console.log);
socket.on('webrtc:signal', ({ fromUserId, signal }) => {
  // Forward to RTCPeerConnection negotiation logic.
});
```
