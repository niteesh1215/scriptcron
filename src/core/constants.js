
const isTestEnv = process.env.NODE_ENV === 'test';

const confPath = process.env.QR_SYS_CRON_PATH;

const defaultConf = {
    logSettings: {
        baseDir: './logs'
    }
}

module.exports = {
    isTestEnv,
    confPath,
    defaultConf,
}