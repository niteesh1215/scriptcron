const fs = require('fs');
const winston = require('winston');
require('winston-daily-rotate-file');

const DailyRotateFile = require('winston-daily-rotate-file');

const makeLogger = ({ dirPath, filenamePrefix, options = { useConsoleLog: true } }) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true }); // Create parent directories if needed
    }

    const useConsoleLog = options.useConsoleLog;

    const transport = useConsoleLog
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
        format: winston.format.json(),
        transports: [
            transport,
        ],
    });
};

module.exports = {
    makeLogger,
}
