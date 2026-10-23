PRAGMA foreign_keys = ON;

INSERT OR IGNORE INTO users (id, username, email, password_hash, is_online) VALUES
(1, 'yashi',     'yashi@proxispeak.dev',     '$2b$10$exampleHashForYashi000000000000000000000000000', 1),
(2, 'sumaria',   'sumaria@proxispeak.dev',   '$2b$10$exampleHashForSumaria00000000000000000000000', 0),
(3, 'veeresham', 'veeresham@proxispeak.dev', '$2b$10$exampleHashForVeeresham0000000000000000000000', 0),
(4, 'afjal',     'afjal@proxispeak.dev',     '$2b$10$exampleHashForAfjal000000000000000000000000', 1);


INSERT OR IGNORE INTO user_locations (user_id, latitude, longitude, accuracy) VALUES
(1, 17.3850, 78.4867, 10.0),
(2, 17.3862, 78.4880, 15.0),
(3, 17.3845, 78.4855, 12.0),
(4, 17.3871, 78.4890, 8.0);

INSERT OR IGNORE INTO rooms (id, name, type, latitude, longitude, radius_metres, created_by) VALUES
(1, 'Campus Hub',   'public',  17.3850, 78.4867, 200.0, 1),
(2, 'Dev Den',      'private', 17.3862, 78.4880, 50.0,  3);

INSERT OR IGNORE INTO room_members (room_id, user_id, role, is_active) VALUES
(1, 1, 'owner',  1),
(1, 2, 'member', 1),
(1, 4, 'member', 1),
(2, 3, 'owner',  1),
(2, 1, 'admin',  1);

INSERT OR IGNORE INTO messages (room_id, sender_id, content, message_type) VALUES
(1, 1, 'Hey everyone, welcome to Campus Hub!', 'text'),
(1, 2, 'Thanks! Great to be here.', 'text'),
(1, 4, 'Testing proximity feature — can you all see this?', 'text'),
(2, 3, 'Dev Den is live. Backend + DB integration time!', 'text'),
(2, 1, 'Backend APIs are ready, linking to DB now.', 'text');

INSERT OR IGNORE INTO proximity_sessions (user_id, latitude, longitude, started_at, ended_at) VALUES
(1, 17.3850, 78.4867, datetime('now', '-1 hour'),  NULL),
(4, 17.3871, 78.4890, datetime('now', '-30 minutes'), NULL),
(2, 17.3862, 78.4880, datetime('now', '-2 hours'),  datetime('now', '-1 hour'));
