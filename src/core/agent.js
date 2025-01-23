/**
 * Agent module for managing scheduled tasks using cron.
 * This module exports a function to create an agent that executes scripts based on a schedule.
 */

const { spawn } = require('child_process');
const cron = require('node-cron');
const pathUtil = require('path');

/**
 * Gets the absolute path of a script.
 * 
 * @param {Object} options - Options for getting the absolute path.
 * @param {string} options.path - The path to the script.
 * @param {string} options.defaultScriptDir - The default directory for scripts.
 * @returns {string} The absolute path of the script.
 */
const getAbsolutePath = ({ path, defaultScriptDir }) =>
    path.startsWith('/') ? path : pathUtil.join(defaultScriptDir, path);

/**
 * Executes a script with the specified options.
 * 
 * @param {Object} options - Options for executing the script.
 * @param {Object} options.script - The script configuration.
 * @param {string} options.script.path - The path to the script to execute.
 * @param {Array} options.script.args - Arguments to pass to the script.
 * @param {Object} options.script.logSettings - Logging settings for the script.
 * @param {Object} options.options - Additional options for execution.
 * @param {Object} options.helpers - Helper functions for logging.
 * @returns {Promise} A promise that resolves when the script execution is complete.
 * @throws {Error} Throws an error if the script format is unsupported.
 */
const executeScript = ({ script, options, helpers }) => {
    return new Promise((resolve, reject) => {
        try {
            const { path: scriptPath, args, logSettings } = script;
            const { baseLogSettings, defaultScriptDir } = options;
            const { makeLogger } = helpers;

            const logFilenamePrefix = (logSettings && logSettings.filenamePrefix) || scriptPath.split('/').pop();
            const logDir = pathUtil.join(baseLogSettings.baseDir, (logSettings && logSettings.dirname) || logFilenamePrefix.split('.').shift());

            const logger = makeLogger({ dirPath: logDir, filenamePrefix: logFilenamePrefix });

            const isJavaScript = scriptPath.endsWith('.js');
            const isShell = scriptPath.endsWith('.sh');

            if (!isJavaScript && !isShell) {
                const errorMessage = `Unsupported file format: ${scriptPath}`;
                logger.error(errorMessage);
                return reject(new Error(errorMessage));
            }

            const absoluteScriptPath = getAbsolutePath({ path: scriptPath, defaultScriptDir });

            // Construct the command with arguments
            const command = isJavaScript ? 'node' : 'bash';

            logger.info(`Executing: ${command} ${absoluteScriptPath} ${args.join(' ')}`);

            const child = spawn(command, [absoluteScriptPath, ...args]);

            child.stdout.on('data', (data) => {
                logger.info(data.toString());
            });

            child.stderr.on('data', (data) => {
                logger.error(data.toString());
            });

            child.on('close', (code) => {
                if (code !== 0)
                    return reject(new Error(`Script execution failed with code ${code}`));

                resolve();
            })

            child.on('error', (error) => {
                logger.error(`Error executing script: msg=${error.message} stack=${error.stack}`);
            })
        } catch (err) {
            reject(err);
        }
    });
}

/**
 * Creates an agent that manages scheduled tasks.
 * 
 * @param {Object} options - Configuration options for the agent.
 * @param {Object} options.config - The configuration for the scripts.
 * @param {Object} options.appLogger - The logger instance for the application.
 * @param {Object} options.helpers - Helper functions for the agent.
 * @returns {Object} An object with a stop method to stop the agent.
 */
const makeAgent = ({ config, appLogger, helpers }) => {
    const { makeLogger } = helpers;
    const logger = appLogger;

    const scheduledTasks = [];
    config.scripts.forEach(scriptConfig => {
        if (scriptConfig.enabled) {
            try {
                logger.info(`Scheduling ${scriptConfig.path} with frequency: ${scriptConfig.frequency}`);
                const task = cron.schedule(scriptConfig.frequency, () => {
                    executeScript({
                        script: scriptConfig,
                        options: {
                            baseLogSettings: config.logSettings,
                            defaultScriptDir: config.defaultScriptDir
                        },
                        helpers: {
                            makeLogger
                        }
                    })
                        .then(() => logger.info(`Executed ${scriptConfig.path} successfully.`))
                        .catch(err => logger.error(`Failed to execute ${scriptConfig.path} message=${err.message} stack=${err.stack}`));
                });
                scheduledTasks.push(task);
            } catch (error) {
                logger.error(`Error scheduling ${scriptConfig.name}: ${error.message}`);
            }
        }
    });

    return {
        stop: () => {
            scheduledTasks.forEach(task => task.stop());
            logger.info('All scheduled tasks have been stopped.');
        }
    }
}

module.exports = { makeAgent };
