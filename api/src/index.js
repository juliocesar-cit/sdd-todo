require('dotenv').config();
const express = require('express');
const corsMiddleware = require('./middleware/cors');
const errorHandler = require('./middleware/errorHandler');
const itemsRouter = require('./routes/items');
const { initDb } = require('../db/database');

function createApp() {
  const app = express();
  app.use(corsMiddleware);
  app.use(express.json());
  app.use('/api/items', itemsRouter);
  app.use(errorHandler);
  return app;
}

async function start() {
  await initDb();
  const app = createApp();
  const port = process.env.PORT || 3000;
  app.listen(port, () => console.log(`API running on http://localhost:${port}`));
}

module.exports = { createApp };

if (require.main === module) {
  start().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
