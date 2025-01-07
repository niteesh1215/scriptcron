const { exec } = require('child_process');
const cron = require('node-cron');
const path = require('path');


function getAbsolutePath({ path, defaultScriptDir }) {
    return path.startsWith('/') ? path : path.join(defaultScriptDir, path);
}

function executeScript({ script, options, helpers }) {
    return new Promise((resolve, reject) => {

        const { path: scriptPath, args, logSettings } = script;

        const { baseLogSettings, defaultScriptDir } = options;
        const { makeLogger } = helpers;

        const logFilenamePrefix = logSettings?.filenamePrefix || scriptPath.split('/').pop()
        const logDir = path.join(baseLogSettings.baseDir, logSettings?.dirname || logFilenamePrefix.split('.').shift());


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
        const command = `${isJavaScript ? 'node' : 'bash'} ${absoluteScriptPath} ${args.join(' ')}`;

        logger.info(`Executing: ${command}`);

        const child = exec(command, (error, stdout, stderr) => {
            if (error) {
                logger.error(`Error: message=${error.message} stack=${error.stack}`);
                reject(error);
            }
            if (stderr) {
                logger.error(`stderr: ${stderr}`);
            }
            logger.info(`stdout: ${stdout}`);
            logger.close()
            resolve(stdout);
        });

        child.stdout.on('data', (data) => {
            logger.info(data);
        });

        child.stderr.on('data', (data) => {
            logger.error(data);
        });
    });
}

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
                            baseLogSettings: config.logSettings
                        },
                        helpers: {
                            makeLogger
                        }
                    })
                        .then(output => logger.info(`Executed ${scriptConfig.path} successfully.`))
                        .catch(err => logger.error(`Failed to execute ${scriptConfig.path}: message=${err.message} stack=${err.stack}`));
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
