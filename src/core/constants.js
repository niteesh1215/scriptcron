
const isTestEnv = process.env.NODE_ENV === 'test';

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