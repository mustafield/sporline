const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

const logFile = path.join(logsDir, `app-${new Date().toISOString().split('T')[0]}.log`);

const formatMessage = (level, message, meta = {}) => {
    const timestamp = new Date().toISOString();
    const metaStr = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] [${level.toUpperCase()}] ${message}${metaStr}`;
};

const writeLog = (level, message, meta) => {
    const formatted = formatMessage(level, message, meta);
    console[level === 'error' ? 'error' : 'log'](formatted);
    fs.appendFileSync(logFile, formatted + '\n');
};

module.exports = {
    info: (msg, meta) => writeLog('info', msg, meta),
    warn: (msg, meta) => writeLog('warn', msg, meta),
    error: (msg, meta) => writeLog('error', msg, meta)
};
