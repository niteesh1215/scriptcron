
const isProdEnv = process.env.NODE_ENV === 'production';

const defaultConf = {
    logSettings: {
        baseDir: './logs'
    }
}

module.exports = {
    isProdEnv,
    defaultConf,
}