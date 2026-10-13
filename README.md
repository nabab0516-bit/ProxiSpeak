# ProxiSpeak Backend — Node.js

Starter backend based on the ProxiSpeak project brief's stack: Node.js, Express, Socket.IO and MongoDB.

## Requirements
- Node.js 20+
- MongoDB Community Server running locally, or a MongoDB Atlas URI
- npm

## Run on Windows PowerShell
1. Extract the ZIP and open the `ProxiSpeak-Node-Backend` folder in VS Code or IntelliJ.
2. Copy `.env.example` to `.env`.
3. Make sure MongoDB is running. The default URI is `mongodb://127.0.0.1:27017/proxispeak`.
4. In the terminal, run:
   ```powershell
   npm install
   npm test
   npm run dev
   ```
5. Open `http://localhost:3000/api/health`. It should return JSON with `status: ok`.

## REST endpoints
- `GET /api/health` health check
- `GET /api/audio` list active audio sessions; optional `?roomId=office-1`
- `GET /api/audio/nearby?x=120&y=100&radiusPx=100&roomId=office-1`
- `POST /api/audio` create audio session metadata; JSON `{ "ownerId":"u1", "roomId":"office-1", "title":"Talk", "position":{"x":120,"y":100} }`
- `PATCH /api/audio/:id/position` update position
- `DELETE /api/audio/:id` deactivate session
- `GET /api/rooms` list room layouts
- `GET /api/rooms/:roomId` get room layout
- `PUT /api/rooms/:roomId` create/update room layout; example `{ "name":"Main Office", "layout":{"width":1200,"height":800,"obstacles":[]} }`

## Socket.IO events
Client -> server:
- `room:join`: `{ userId, displayName, roomId, position: { x, y } }`
- `avatar:move`: `{ position: { x, y } }`
- `webrtc:signal`: `{ targetUserId, signal }` (only if target is in the same room and within radius)

Server -> client:
- `server:ready`, `avatar:joined`, `avatar:moved`, `avatar:left`, `proximity:users`, `webrtc:signal`

Socket.IO carries signaling messages only. The browser frontend must implement WebRTC (`getUserMedia`, `RTCPeerConnection`) and Web Audio API handling; this backend does not itself capture or transmit raw audio.

## Scope and limitations
The brief specifies MongoDB geospatial queries. This starter uses Euclidean distance for live X/Y pixel positions and MongoDB for persistence, rather than MongoDB `$near`/`$geoWithin`; update this if your evaluator requires those operators explicitly. Week 3 Redis Pub/Sub adapter for multi-instance Socket.IO is not configured yet. Authentication/authorization is not implemented, so use locally for development only until those controls are added.
