const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

let db = null;
let dbPath = null;

async function initDb(filePath) {
  if (db) closeDb(); // close existing before reinitializing
  dbPath = path.resolve(filePath || process.env.DB_PATH || path.join(__dirname, 'app.db'));
  const SQL = await initSqlJs();

  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  return db;
}

function getDb() {
  if (!db) throw new Error('Database not initialized. Call initDb() first.');
  return db;
}

function saveDb() {
  if (!db || !dbPath) throw new Error('Database not initialized.');
  const data = db.export();
  fs.mkdirSync(path.dirname(dbPath), { recursive: true });
  const tmp = dbPath + '.tmp';
  fs.writeFileSync(tmp, Buffer.from(data));
  fs.renameSync(tmp, dbPath);
}

function closeDb() {
  if (db) {
    db.close();
    db = null;
    dbPath = null;
  }
}

module.exports = { initDb, getDb, saveDb, closeDb };
