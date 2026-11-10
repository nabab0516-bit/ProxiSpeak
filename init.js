const path = require('path');
const fs = require('fs');
const initSqlJs = require('sql.js');

const DB_PATH = path.join(__dirname, 'proxispeak.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');
const SEED_PATH = path.join(__dirname, 'seed.sql');

async function init() {
    const withSeed = process.argv.includes('--seed');

    console.log('🗄️  Initializing ProxiSpeak database...');
    console.log(`   DB path : ${DB_PATH}`);

    const SQL = await initSqlJs();

    let db;
    if (fs.existsSync(DB_PATH)) {
        const fileBuffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(fileBuffer);
    } else {
        db = new SQL.Database();
    }

    const schema = fs.readFileSync(SCHEMA_PATH, 'utf8');
    db.run(schema);
    console.log('✅  Schema applied (tables + indexes + views created).');

    if (withSeed) {
        const seed = fs.readFileSync(SEED_PATH, 'utf8');
        db.run(seed);
        console.log('🌱  Seed data inserted.');
    }

    const data = db.export();
    fs.writeFileSync(DB_PATH, Buffer.from(data));
    db.close();
    console.log('✔️  Done. Database is ready at:', DB_PATH);
}

init().catch(err => { console.error('❌ Init failed:', err.message); process.exit(1); });
