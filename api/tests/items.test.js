const request = require('supertest');
const os = require('os');
const path = require('path');
const { initDb, closeDb, getDb, saveDb } = require('../db/database');
const fs = require('fs');

const TEST_DB = path.join(os.tmpdir(), `test-items-${Date.now()}.db`);

let app;

beforeAll(async () => {
  process.env.DB_PATH = TEST_DB;
  await initDb(TEST_DB);

  const db = getDb();
  db.run(`
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);
  saveDb();

  const { createApp } = require('../src/index');
  app = createApp();
});

afterAll(() => {
  closeDb();
  if (fs.existsSync(TEST_DB)) fs.unlinkSync(TEST_DB);
});

beforeEach(() => {
  const db = getDb();
  db.run('DELETE FROM items');
  saveDb();
});

describe('GET /api/items', () => {
  it('returns an empty array when no items exist', async () => {
    const res = await request(app).get('/api/items');
    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it('returns all items', async () => {
    const db = getDb();
    db.run("INSERT INTO items (name) VALUES ('Test item')");
    saveDb();

    const res = await request(app).get('/api/items');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);
    expect(res.body[0].name).toBe('Test item');
  });
});

describe('POST /api/items', () => {
  it('creates a new item and returns 201', async () => {
    const res = await request(app)
      .post('/api/items')
      .send({ name: 'New item' });
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('New item');
    expect(res.body.id).toBeDefined();
  });

  it('returns 400 when name is missing', async () => {
    const res = await request(app).post('/api/items').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
  });
});

describe('PUT /api/items/:id', () => {
  it('updates an item and returns the updated record', async () => {
    const create = await request(app)
      .post('/api/items')
      .send({ name: 'Original' });
    const id = create.body.id;

    const res = await request(app)
      .put(`/api/items/${id}`)
      .send({ name: 'Updated' });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('Updated');
  });

  it('returns 404 for a non-existent item', async () => {
    const res = await request(app)
      .put('/api/items/9999')
      .send({ name: 'X' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/items/:id', () => {
  it('deletes an item and returns 204', async () => {
    const create = await request(app)
      .post('/api/items')
      .send({ name: 'To delete' });
    const id = create.body.id;

    const res = await request(app).delete(`/api/items/${id}`);
    expect(res.status).toBe(204);
  });

  it('returns 404 for a non-existent item', async () => {
    const res = await request(app).delete('/api/items/9999');
    expect(res.status).toBe(404);
  });
});
