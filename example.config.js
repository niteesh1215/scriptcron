module.exports = {
  "scripts": [
    {
      "path": "test.sh",
      "enabled": true,
      "args": ["arg1", "arg2"],
      "frequency": "*/5 * * * * *"
    },
    {
      "path": "test.js",
      "enabled": true,
      "args": ["arg1", "arg2"],
      "frequency": "*/5 * * * * *"
    }
  ],
  "logSettings": {
    "logTo": 'file', // 'none', 'file', or 'console'
    "baseDir": "/vol1/logs/scriptcron" // base directory for logs, required if logTo is 'file'
  },
  "defaultScriptDir": __dirname
}
