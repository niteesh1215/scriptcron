const path = require('path');   

process.env.QR_SYS_CRON_PATH = path.join(__dirname, '../config.json')

const { loadConf, ensurePath } = require('./core/utils/app.util');
const { confPath, defaultConf } = require('./core/constants');
const { makeLogger } = require('./core/utils/logger.utils');
const { makeAgent } = require('./core/agent');


const makeApp = () => {

    console.log(__dirname, __filename)

    if (!confPath) throw new Error('QR_SYS_CRON_PATH environment variable is required')

    const config = loadConf(confPath, defaultConf)

    // Create logs directory if it doesn't exist
    ensurePath(config.logSettings.baseDir)


    const appLogger = makeLogger({ dirPath: config.logSettings.baseDir, filenamePrefix: 'qrsyscronapp' });

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


const app = makeApp();

process.on('SIGINT', () => {
    app.stop();
    process.exit();
})

module.exports = {
    makeApp,
    app
}