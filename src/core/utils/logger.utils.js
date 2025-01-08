const fs = require('fs');
const winston = require('winston');
const { isTestEnv } = require('../constants');
require('winston-daily-rotate-file');

const { DailyRotateFile } = require('winston-daily-rotate-file');

const makeLogger = ({ dirPath, filenamePrefix, options = { isTestEnv: true } }) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true }); // Create parent directories if needed
    }

    const isTestEnv = options.isTestEnv;

    const transport = isTestEnv
        ? new winston.transports.Console()
        : new DailyRotateFile({
            filename: `${filenamePrefix}-%DATE%.log`,
            dirname: dirPath,
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '10d'
        });

    return winston.createLogger({
        level: 'error',
        format: winston.format.json(),
        transports: [
            transport,
        ],
    });
};

module.exports = {
    makeLogger,
}
