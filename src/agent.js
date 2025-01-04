const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const cron = require('node-cron');

// Load configuration
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Function to execute scripts
function executeScript(script, args) {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, 'scripts', script);
        const logFile = path.join(logsDir, `${script}.log`);
        const command = `bash ${scriptPath} ${args.join(' ')}`;

        const logStream = fs.createWriteStream(logFile, { flags: 'a' });
        logStream.write(`Executing: ${command}\n`);

        const child = exec(command, (error, stdout, stderr) => {
            if (error) {
                logStream.write(`Error: ${error.message}\n`);
                reject(error);
            }
            if (stderr) {
                logStream.write(`stderr: ${stderr}\n`);
            }
            logStream.write(`stdout: ${stdout}\n`);
            logStream.end(); // Close the log stream here
            resolve(stdout);
        });

        child.stdout.on('data', (data) => {
            logStream.write(data);
        });

        child.stderr.on('data', (data) => {
            logStream.write(data);
        });
    });
}

// Schedule tasks based on configuration
config.scripts.forEach(scriptConfig => {
    if (scriptConfig.enabled) {
        try {
            console.log(`Scheduling ${scriptConfig.name} with frequency: ${scriptConfig.frequency}`);
            cron.schedule(scriptConfig.frequency, () => {
                executeScript(scriptConfig.name, scriptConfig.args)
                    .then(output => console.log(`Executed ${scriptConfig.name} successfully.`))
                    .catch(err => console.error(`Failed to execute ${scriptConfig.name}: ${err.message}`));
            });
        } catch (error) {
            console.error(`Error scheduling ${scriptConfig.name}: ${error.message}`);
        }
    }
});

console.log('Agent is running...');
