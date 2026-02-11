// electron/db/database.js
// Temporary in-memory DB stub so the app runs without native SQLite.
// Later you can replace this with better-sqlite3 or any real database.

const logger = require('../utils/logger');

const state = {
  // We don't actually use these directly here – IPC handlers manage their own in-memory data.
};

function getDb() {
  logger.info('Using in-memory database stub (no persistent SQLite).');
  return state;
}

// Export in same style as before so require('../db/database') still works.
const exported = getDb;
exported.getDb = getDb;
exported.db = state;

module.exports = exported;
