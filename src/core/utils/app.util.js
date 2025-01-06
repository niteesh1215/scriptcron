const fs = require('fs');

const ensurePath = (path) => {
    if (fs.existsSync(path)) return;
    fs.mkdirSync(path, {
        recursive: true
    });
}

const loadConf = (confPath, defaultConf = {}) => {
    const providedConf = require(confPath);
    return Object.assign(defaultConf, providedConf);
}


module.exports = {
    ensurePath,
    loadConf,
}