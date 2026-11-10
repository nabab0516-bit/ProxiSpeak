# ProxiSpeak
Team Project - 4 Members
Yashi - Backend
Sumaria - Frontend
Veeresham - Database
Afjal - Testing & Integration
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
- `server:ready`, `room:joined`, `avatar:joined`, `avatar:moved`, `avatar:left`, `proximity:update`, `webrtc:signal`

Socket.IO carries signaling messages only. The browser frontend must implement WebRTC (`getUserMedia`, `RTCPeerConnection`) and Web Audio API handling; this backend does not itself capture or transmit raw audio.

## Scope and limitations
The brief specifies MongoDB geospatial queries. This starter uses Euclidean distance for live X/Y pixel positions and MongoDB for persistence, rather than MongoDB `$near`/`$geoWithin`; update this if your evaluator requires those operators explicitly. Week 3 Redis Pub/Sub adapter for multi-instance Socket.IO is not configured yet. Authentication/authorization is not implemented, so use locally for development only until those controls are added.

# ProxiSpeak — Database Layer

**Maintainer:** Veeresham | **DB Engine:** SQLite (`better-sqlite3`)

## Files

| File | Purpose |
|------|---------|
| `schema.sql` | Table definitions, indexes, views |
| `seed.sql` | Sample data for development |
| `init.js` | Bootstraps the SQLite `.db` file |
| `db.js` | Reusable query helper for the backend |
| `proxispeak.db` | Generated database file (git-ignored) |

---

## Quick Start

### 1. Install dependency
```bash
cd synthetic-helix
npm install better-sqlite3
```

### 2. Initialize the database (schema only)
```bash
node database/init.js
```

### 3. Initialize with sample data
```bash
node database/init.js --seed
```

---

## Schema Overview

```
users
├── id, username, email, password_hash, avatar_url, is_online
├── created_at, updated_at
│
user_locations
├── user_id → users.id
├── latitude, longitude, accuracy, recorded_at
│
rooms
├── created_by → users.id
├── name, type (public|private), latitude, longitude, radius_metres
│
room_members
├── room_id → rooms.id, user_id → users.id
├── role (owner|admin|member), is_active, joined_at
│
messages
├── room_id → rooms.id, sender_id → users.id
├── content, message_type (text|audio|image|system), created_at
│
proximity_sessions
├── user_id → users.id
└── latitude, longitude, started_at, ended_at
```

---

## Using `db.js` in the Backend

```js
const db = require('./database/db');

// Find a user
const user = db.Users.findByEmail('yashi@proxispeak.dev');

// Record a location
db.Locations.record(user.id, 17.3850, 78.4867);

// Find nearby users (within 100m)
const nearby = db.Locations.nearby(17.3850, 78.4867, 100);

// Post a message
db.Messages.create({ room_id: 1, sender_id: user.id, content: 'Hello!' });

// Fetch room messages
const history = db.Messages.forRoom(1, 20);
```

---

## Notes for Team

- **Yashi (Backend):** Import `db.js` — domain helpers (`Users`, `Locations`, `Rooms`, `Messages`) cover most common queries. Use `db.run/get/all` for custom SQL.
- **Afjal (Testing):** Run `node init.js --seed` before each test run to get a clean, reproducible state.
- **`proxispeak.db`** should be added to `.gitignore` — each team member generates their own local copy.
