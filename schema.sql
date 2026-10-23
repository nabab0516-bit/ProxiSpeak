PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    username      TEXT    NOT NULL UNIQUE,
    email         TEXT    NOT NULL UNIQUE,
    password_hash TEXT    NOT NULL,
    avatar_url    TEXT    DEFAULT NULL,
    is_online     INTEGER NOT NULL DEFAULT 0,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email    ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

CREATE TABLE IF NOT EXISTS user_locations (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    latitude    REAL    NOT NULL,
    longitude   REAL    NOT NULL,
    accuracy    REAL    DEFAULT NULL,
    recorded_at TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_uloc_user    ON user_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_uloc_time    ON user_locations(recorded_at);

CREATE VIEW IF NOT EXISTS v_user_latest_location AS
SELECT ul.*
FROM user_locations ul
INNER JOIN (
    SELECT user_id, MAX(recorded_at) AS max_recorded
    FROM user_locations
    GROUP BY user_id
) latest ON ul.user_id = latest.user_id
         AND ul.recorded_at = latest.max_recorded;

CREATE TABLE IF NOT EXISTS rooms (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    name           TEXT    NOT NULL,
    type           TEXT    NOT NULL DEFAULT 'public'
                           CHECK(type IN ('public', 'private')),
    latitude       REAL    DEFAULT NULL,
    longitude      REAL    DEFAULT NULL,
    radius_metres  REAL    DEFAULT 100.0,
    created_by     INTEGER NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    created_at     TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_rooms_created_by ON rooms(created_by);

CREATE TABLE IF NOT EXISTS room_members (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id    INTEGER NOT NULL REFERENCES rooms(id)  ON DELETE CASCADE,
    user_id    INTEGER NOT NULL REFERENCES users(id)  ON DELETE CASCADE,
    role       TEXT    NOT NULL DEFAULT 'member'
                       CHECK(role IN ('owner', 'admin', 'member')),
    is_active  INTEGER NOT NULL DEFAULT 1,
    joined_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    UNIQUE(room_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_rm_room ON room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_rm_user ON room_members(user_id);

CREATE TABLE IF NOT EXISTS messages (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id      INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    sender_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content      TEXT    NOT NULL,
    message_type TEXT    NOT NULL DEFAULT 'text'
                         CHECK(message_type IN ('text', 'audio', 'image', 'system')),
    created_at   TEXT    NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_msg_room   ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_msg_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_msg_time   ON messages(created_at);

CREATE TABLE IF NOT EXISTS proximity_sessions (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    latitude    REAL    NOT NULL,
    longitude   REAL    NOT NULL,
    started_at  TEXT    NOT NULL DEFAULT (datetime('now')),
    ended_at    TEXT    DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_ps_user ON proximity_sessions(user_id);
