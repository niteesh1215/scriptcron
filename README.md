# scriptcron

## Description
Node.js-based cron scheduler.


## Usage
1. Install from npm:
```bash
npm install scriptcron
```

2. Create configuration file
// config.js
```javascript
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
const { makeScriptCronAgent } = require('scriptcron');
const path = require('path');

// Function to resolve the configuration path
const resolveConfigPath = (configPath) => {
    return path.isAbsolute(configPath)
        ? configPath // Use absolute path directly
        : path.resolve(process.cwd(), configPath); // Resolve relative path to absolute
};

  // Get the config path from the command-line arguments or use a default
  const configPath = process.argv[3]
  if (!configPath) throw new Error('Config file path is required');

  const resolvedConfigPath = resolveConfigPath(configPath);

  console.log(`Using config file: ${resolvedConfigPath}`);

  // Create the app with the resolved config path
  const agent = makeScriptCronAgent({ configPath: resolvedConfigPath });

  // Handle graceful shutdown on SIGINT
  process.on('SIGINT', () => {
      agent.stop();
      process.exit(0);
  });

```

## Contributing
Feel free to submit issues and pull requests.

## License
This project is licensed under the ISC License.
