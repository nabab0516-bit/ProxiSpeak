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
