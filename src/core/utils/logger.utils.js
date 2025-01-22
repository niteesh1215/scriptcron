/**
 * Logger utility module for creating a logger instance using Winston.
 * This module exports a function to create a logger that can log to the console
 * or to daily rotated log files.
 */

const fs = require('fs');
const winston = require('winston');
require('winston-daily-rotate-file');

const DailyRotateFile = require('winston-daily-rotate-file');

/**
 * Creates a logger instance with specified options.
 * 
 * @param {Object} options - Configuration options for the logger.
 * @param {string} options.dirPath - The directory path where log files will be stored.
 * @param {string} options.filenamePrefix - The prefix for the log file names.
 * @param {Object} [options.options] - Additional options for logging.
 * @param {string} [options.options.logTo='none'] - Specifies where to log ('none', 'console', or file).
 * @returns {Object} A Winston logger instance.
 */
const makeLogger = ({ dirPath, filenamePrefix, options = { logTo: 'none' } }) => {
    const { logTo } = options;

    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true }); // Create parent directories if needed
    }

    const transport = logTo !== 'file'
        ? new winston.transports.Console()
        : new DailyRotateFile({
            filename: `${filenamePrefix}-%DATE%.log`,
            dirname: dirPath,
            datePattern: 'YYYY-MM-DD',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '10d'
        });

    transport.silent = logTo === 'none';

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
