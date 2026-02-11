// electron/utils/logger.js
const fs = require('fs');
const path = require('path');

const LOG_DIR = path.resolve(__dirname, '../../data/logs');
const LOG_FILE = path.join(LOG_DIR, 'app.log');

function ensureLogDir() {
  try {
    if (!fs.existsSync(LOG_DIR)) {
      fs.mkdirSync(LOG_DIR, { recursive: true });
    }
  } catch (err) {
    console.error('Failed to create log directory:', err);
  }
}

ensureLogDir();

function format(level, message, meta) {
  const ts = new Date().toISOString();
  let line = `[${ts}] [${level.toUpperCase()}] ${message}`;
  if (meta) {
    try {
      line += ` ${JSON.stringify(meta)}`;
    } catch {
      // ignore
    }
  }
  return line;
}

function write(line) {
  try {
    fs.appendFileSync(LOG_FILE, `${line}\n`, { encoding: 'utf8' });
  } catch (err) {
    console.error('Failed to write log file:', err);
  }
}

function log(level, message, meta) {
  const line = format(level, message, meta);
  // console
  // eslint-disable-next-line no-console
  console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](line);
  // file
  write(line);
}

module.exports = {
  info: (msg, meta) => log('info', msg, meta),
  warn: (msg, meta) => log('warn', msg, meta),
  error: (msg, meta) => log('error', msg, meta),
  debug: (msg, meta) => {
    if (process.env.DEBUG || process.env.NMP_DEBUG) {
      log('debug', msg, meta);
    }
  },
};
