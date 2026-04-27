const { Router } = require('express');
const { getDb, saveDb } = require('../../db/database');

const router = Router();

router.get('/', (req, res, next) => {
  try {
    const db = getDb();
    const result = db.exec('SELECT id, name, created_at FROM items ORDER BY id');
    const items = result.length
      ? result[0].values.map(([id, name, created_at]) => ({ id, name, created_at }))
      : [];
    res.json(items);
  } catch (err) {
    next(err);
  }
});

router.post('/', (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      const err = new Error('name is required');
      err.status = 400;
      return next(err);
    }

    const db = getDb();
    db.run('INSERT INTO items (name) VALUES (?)', [name.trim()]);
    const result = db.exec('SELECT id, name, created_at FROM items WHERE id = last_insert_rowid()');
    const [id, itemName, created_at] = result[0].values[0];
    saveDb();

    res.status(201).json({ id, name: itemName, created_at });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      const err = new Error('id must be a number');
      err.status = 400;
      return next(err);
    }

    const { name } = req.body;
    if (!name || typeof name !== 'string' || !name.trim()) {
      const err = new Error('name is required');
      err.status = 400;
      return next(err);
    }

    const db = getDb();
    const existing = db.exec('SELECT id FROM items WHERE id = ?', [id]);
    if (!existing.length || !existing[0].values.length) {
      const err = new Error('Item not found');
      err.status = 404;
      return next(err);
    }

    db.run('UPDATE items SET name = ? WHERE id = ?', [name.trim(), id]);
    const result = db.exec('SELECT id, name, created_at FROM items WHERE id = ?', [id]);
    const [itemId, itemName, created_at] = result[0].values[0];
    saveDb();

    res.json({ id: itemId, name: itemName, created_at });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', (req, res, next) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      const err = new Error('id must be a number');
      err.status = 400;
      return next(err);
    }

    const db = getDb();
    const existing = db.exec('SELECT id FROM items WHERE id = ?', [id]);
    if (!existing.length || !existing[0].values.length) {
      const err = new Error('Item not found');
      err.status = 404;
      return next(err);
    }

    db.run('DELETE FROM items WHERE id = ?', [id]);
    saveDb();

    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
