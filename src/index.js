const path = require('path');
const { loadConf, ensurePath } = require('./core/utils/app.util');
const { defaultConf, isProdEnv } = require('./core/constants');
const { makeLogger } = require('./core/utils/logger.utils');
const { makeAgent } = require('./core/agent');


const makeScriptCronAgent = ({ configPath }) => {
    if (!configPath) throw new Error('configPath is required')
    if (typeof configPath !== 'string') throw new Error('configPath should be a string')

    const config = loadConf(configPath, defaultConf)

    // Create logs directory if it doesn't exist
    ensurePath(config.logSettings.baseDir)

    const appLogger = makeLogger({ dirPath: config.logSettings.baseDir, filenamePrefix: 'scriptcron', options: { useConsoleLog: !isProdEnv } });

    const agent = makeAgent({
        config,
        appLogger,
        helpers: {
            makeLogger
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