require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { initDb, getDb, saveDb } = require('./database');

async function migrate() {
  await initDb();
  const db = getDb();
  const migrationsDir = path.join(__dirname, 'migrations');

  db.run(`
    CREATE TABLE IF NOT EXISTS _migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      filename TEXT NOT NULL UNIQUE,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  const applied = db
    .exec('SELECT filename FROM _migrations')
    .flatMap(r => r.values.map(v => v[0]));

  const files = fs
    .readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    if (applied.includes(file)) continue;
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    db.run('BEGIN');
    try {
      db.run(sql);
      db.run('INSERT INTO _migrations (filename) VALUES (?)', [file]);
      db.run('COMMIT');
      console.log(`Applied: ${file}`);
    } catch (err) {
      db.run('ROLLBACK');
      throw err;
    }
  }

  saveDb();
  console.log('Migrations complete.');
}

migrate().catch(err => {
  console.error(err);
  process.exit(1);
});
