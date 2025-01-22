# scriptcron

## What is scriptcron?
**scriptcron** is a simple, no-fuss tool to schedule and run scripts based on a configuration file. Whether you need to run shell scripts or JavaScript files on a regular schedule, scriptcron has you covered. Plus, it comes with built-in logging and graceful shutdown support, so everything runs smoothly.

---

## Why use scriptcron?
- **Easy scheduling**: Use familiar cron expressions to set up jobs.  
- **Run any script**: Supports shell scripts, JavaScript files, and customizable arguments.  
- **Customizable logging**: Log to the console, files, or turn it off entirely.  
- **Graceful stops**: Cleanly shuts down all jobs when the process ends.  

---

## Getting Started

### Step 1: Install the package
First, install **scriptcron** using npm:

```bash
npm install scriptcron
```

---

### Step 2: Set up your configuration
Create a file to define your jobs and logging preferences. Here's an example:

#### Example `config.js`:
```javascript
module.exports = {
  scripts: [
    {
      path: "test.sh", // A shell script
      enabled: true,   // Turn this job on or off
      args: ["arg1", "arg2"], // Arguments for the script
      frequency: "*/5 * * * * *" // Every 5 seconds
    },
    {
      path: "test.js", // A JavaScript file
      enabled: true,
      args: ["arg1", "arg2"],
      frequency: "*/5 * * * *" // Every 5 minutes
    },
    {
      path: "/vol/scripts/example.js", // Absolute path example
      enabled: true,
      args: ["arg1", "arg2"],
      frequency: "*/10 * * * *" // Every 10 minutes
    }
  ],
  logSettings: { // Optional
    logTo: "file", // Options: "none", "console", "file"
    baseDir: "/vol1/logs/scriptcron" // Where to store log files
  },
  defaultScriptDir: __dirname // Where to look for relative script paths
};
```

---

### Step 3: Run the scheduler
Create a simple script to start the agent and load your configuration:

#### Example `main.js`:
```javascript
const { makeScriptCronAgent } = require('scriptcron');
const path = require('path');

const agent = makeScriptCronAgent({ configPath: path.join(__dirname, './config.js') });

// Graceful shutdown when you stop the process
process.on('SIGINT', () => {
    console.log("Shutting down...");
    agent.stop();
    process.exit(0);
});
```

Run it with Node.js:

```bash
node main.js
```

And that's it! Your scripts will now run on the schedule you defined.

---

## Contributing
We’d love your help to make scriptcron even better! Found a bug? Have an idea? Open an issue or send us a pull request on GitHub.

---

## License
**scriptcron** is licensed under the ISC License. Do whatever you like with it—just give credit where it’s due.