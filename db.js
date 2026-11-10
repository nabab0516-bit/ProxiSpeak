const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

const DB_PATH = path.join(__dirname, 'proxispeak.db');

let _db = null;
let _SQL = null;

async function getDB() {
    if (_db) return _db;
    _SQL = await initSqlJs();
    if (fs.existsSync(DB_PATH)) {
        _db = new _SQL.Database(fs.readFileSync(DB_PATH));
    } else {
        _db = new _SQL.Database();
    }
    return _db;
}

function _save() {
    if (_db) fs.writeFileSync(DB_PATH, Buffer.from(_db.export()));
}

async function run(sql, params = []) {
    const db = await getDB();
    db.run(sql, params);
    _save();
}


async function get(sql, params = []) {
    const db = await getDB();
    const res = db.exec(sql, params);
    if (!res.length || !res[0].values.length) return undefined;
    const { columns, values } = res[0];
    return Object.fromEntries(columns.map((c, i) => [c, values[0][i]]));
}

async function all(sql, params = []) {
    const db = await getDB();
    const res = db.exec(sql, params);
    if (!res.length) return [];
    const { columns, values } = res[0];
    return values.map(row => Object.fromEntries(columns.map((c, i) => [c, row[i]])));
}


async function exec(sql) {
    const db = await getDB();
    db.exec(sql);
    _save();
}


const Users = {
    findById: (id) => get('SELECT * FROM users WHERE id = ?', [id]),
    findByEmail: (email) => get('SELECT * FROM users WHERE email = ?', [email]),
    create: ({ username, email, password_hash, avatar_url = null }) =>
        run(
            `INSERT INTO users (username, email, password_hash, avatar_url)
       VALUES (?, ?, ?, ?)`,
            [username, email, password_hash, avatar_url]
        ),
    setOnline: (id, status) =>
        run('UPDATE users SET is_online = ? WHERE id = ?', [status ? 1 : 0, id]),
};

const Locations = {
    record: (user_id, latitude, longitude, accuracy = null) =>
        run(
            `INSERT INTO user_locations (user_id, latitude, longitude, accuracy)
       VALUES (?, ?, ?, ?)`,
            [user_id, latitude, longitude, accuracy]
        ),
    latestForUser: (user_id) =>
        get(
            `SELECT * FROM user_locations
       WHERE user_id = ?
       ORDER BY recorded_at DESC LIMIT 1`,
            [user_id]
        ),
    nearby: (lat, lng, radius_metres = 100) => {
        const deg = radius_metres / 111320;
        return all(
            `SELECT u.id, u.username, u.is_online, l.latitude, l.longitude, l.recorded_at
       FROM v_user_latest_location l
       JOIN users u ON u.id = l.user_id
       WHERE l.latitude  BETWEEN ? AND ?
         AND l.longitude BETWEEN ? AND ?`,
            [lat - deg, lat + deg, lng - deg, lng + deg]
        );
    },
};

const Rooms = {
    findById: (id) => get('SELECT * FROM rooms WHERE id = ?', [id]),
    listPublic: () => all("SELECT * FROM rooms WHERE type = 'public'"),
    create: ({ name, type = 'public', latitude, longitude, radius_metres = 100, created_by }) =>
        run(
            `INSERT INTO rooms (name, type, latitude, longitude, radius_metres, created_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
            [name, type, latitude, longitude, radius_metres, created_by]
        ),
};

const Messages = {
    forRoom: (room_id, limit = 50) =>
        all(
            `SELECT m.*, u.username AS sender_name
       FROM messages m JOIN users u ON u.id = m.sender_id
       WHERE m.room_id = ?
       ORDER BY m.created_at DESC LIMIT ?`,
            [room_id, limit]
        ),
    create: ({ room_id, sender_id, content, message_type = 'text' }) =>
        run(
            `INSERT INTO messages (room_id, sender_id, content, message_type)
       VALUES (?, ?, ?, ?)`,
            [room_id, sender_id, content, message_type]
        ),
};

const ProximitySessions = {
    start: (user_id, latitude, longitude) =>
        run(
            `INSERT INTO proximity_sessions (user_id, latitude, longitude)
       VALUES (?, ?, ?)`,
            [user_id, latitude, longitude]
        ),
    end: (id) =>
        run(
            `UPDATE proximity_sessions SET ended_at = datetime('now') WHERE id = ? AND ended_at IS NULL`,
            [id]
        ),
    active: () =>
        all('SELECT * FROM proximity_sessions WHERE ended_at IS NULL'),
};

module.exports = { run, get, all, exec, Users, Locations, Rooms, Messages, ProximitySessions };
