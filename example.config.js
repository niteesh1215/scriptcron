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
    "baseDir": "/vol1/logs/scriptcron"
  },
  "defaultScriptDir": __dirname
}
