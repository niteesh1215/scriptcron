# scriptcron

## Description
Node.js-based cron scheduler.


## Usage
1. Install from npm:
```bash
npm install scriptcron
```

2. Create configuration file
```javascript
// config.js
module.exports = {
  "scripts": [
    {
      "path": "test.sh",
      "enabled": true,
      "args": ["arg1", "arg2"],
      "frequency": "*/5 * * * * *" // every 5 seconds
    },
    {
      "path": "test.js",
      "enabled": true,
      "args": ["arg1", "arg2"],
      "frequency": "*/5 * * * *" // every 5 minutes
    }
    {
      "path": "/vol/scripts/example.js",
      "enabled": true,
      "args": ["arg1", "arg2"],
      "frequency": "*/10 * * * *" // every 10 minutes
    }
  ],
  "logSettings": { // optional
    "logTo": "file", // none, console, file
    "baseDir": "/vol1/logs/scriptcron" // log directory
  },
  "defaultScriptDir": __dirname // optional, directory to look for script incase of non absolute path
}
```
3. Import and run the scheduler

```javascript
// main.js
const { makeScriptCronAgent } = require('scriptcron');
const path = require('path');

const agent = makeScriptCronAgent({ configPath: path.join(__dirname, './example.config.js') });

// Handle graceful shutdown on SIGINT
process.on('SIGINT', () => {
    agent.stop();
    process.exit(0);
});
```
4. Run the script
```bash
node main.js
```

## Contributing
Feel free to submit issues and pull requests.

## License
This project is licensed under the ISC License.
