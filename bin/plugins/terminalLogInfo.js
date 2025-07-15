const fs = require('fs');
const path = require('path');

function removeColorCodes(text) {
    const colorRegex = /\x1B\[[0-?]*[ -/]*[@-~]/g;
    return text.replace(colorRegex, '');
}

const logsDir = path.join(__dirname, '..', '..', 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const baseLogFile = path.join(logsDir, 'system_log.log');
const timestamp = new Date().toISOString().replace(/:/g, '-').replace('T', '_').split('.')[0];
const uniqueLogFile = path.join(logsDir, `${timestamp}-system.log`);

function writeLog(filePath, message) {
    fs.appendFile(filePath, removeColorCodes(message) + '\n', (err) => {
        if (err) console.error('Erro ao escrever no log:', err);
    });
}

function logMessage(level = 'LOG', tag = 'GENERAL', ...args) {
    const now = new Date().toISOString();
    const formattedTag = (`[${tag.toUpperCase()}]`);
    const prefix = `${(`[${now}]`)} ${formattedTag}`;
    const message = args.map(arg => (typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg))).join(' ');
    const fullMessage = `${prefix} ${message}`;

    console._stdout.write(fullMessage + '\n');
    writeLog(baseLogFile, fullMessage);
    writeLog(uniqueLogFile, fullMessage);
}

console.log = (...args) => logMessage('LOG', 'SYSTEM', ...args);
console.info = (...args) => logMessage('INFO', 'INFO', ...args);
console.warn = (...args) => logMessage('WARN', 'WARNING', ...args);
console.error = (...args) => logMessage('ERROR', 'ERROR', ...args);
console.debug = (...args) => logMessage('DEBUG', 'DEBUG', ...args);

console.success = (...args) => logMessage('SUCCESS', 'SUCCESS', ...args);

module.exports = {
    log: (tag, ...args) => logMessage('LOG', tag, ...args),
    info: (tag, ...args) => logMessage('INFO', tag, ...args),
    warn: (tag, ...args) => logMessage('WARN', tag, ...args),
    error: (tag, ...args) => logMessage('ERROR', tag, ...args),
    debug: (tag, ...args) => logMessage('DEBUG', tag, ...args),
    success: (tag, ...args) => logMessage('SUCCESS', tag, ...args)
};
