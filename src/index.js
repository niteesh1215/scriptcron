/**
 * Main entry point for the ScriptCron application.
 * This module exports a function to create a ScriptCron agent
 * that manages scheduled tasks with logging capabilities.
 */

const { loadConf, ensurePath } = require('./core/utils/app.util');
const { makeLogger } = require('./core/utils/logger.utils');
const { makeAgent } = require('./core/agent');
const path = require('path');


const getConfig = (configPath) => {
    const defaultConf = {
        logSettings: {
            logTo: 'none',
            baseDir: path.join(__dirname, '../logs')
        },
        defaultScriptDir: path.join(__dirname, '../scripts')
    }

    const config = loadConf(configPath, defaultConf)

    config.logSettings = Object.assign(defaultConf.logSettings, config.logSettings || {})

    if (!['none', 'file', 'console'].includes(config.logSettings.logTo)) throw new Error('logSettings.logTo value can only be none, file or console')

    return config
}


/**
 * Creates a ScriptCron agent with specified configuration and logging options.
 * 
 * @param {Object} options - Configuration options for the ScriptCron agent.
 * @param {string} options.configPath - The path to the configuration file.
 * @param {string} [options.logTo] - Specifies where to log ('none', 'file', or 'console').
 * @throws {Error} Throws an error if configPath is not provided or is not a string.
 * @throws {Error} Throws an error if logTo is not one of the allowed values.
 * @returns {Object} An object with a stop method to stop the agent.
 */
const makeScriptCronAgent = ({ configPath }) => {
    if (!configPath) throw new Error('configPath is required')
    if (typeof configPath !== 'string') throw new Error('configPath should be a string')

    const config = getConfig(configPath)

    const logTo = config.logSettings.logTo

    if (logTo === 'file') {
        // Create logs directory if it doesn't exist
        ensurePath(config.logSettings.baseDir)
    }

    const appLogger = makeLogger({ dirPath: config.logSettings.baseDir, filenamePrefix: 'scriptcron', options: { logTo } });

    const agent = makeAgent({
        config,
        appLogger,
        helpers: {
            makeLogger: ({ dirPath, filenamePrefix, options }) => makeLogger({
                dirPath, filenamePrefix, options: Object.assign(options || {}, { logTo })
            })
        }
    })

    return {
        stop: () => {
            appLogger.info('Stopping app');
            agent.stop();
        },
    }
}

module.exports = {
    makeScriptCronAgent
}
