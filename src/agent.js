const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const cron = require('node-cron');

// Load configuration
const config = JSON.parse(fs.readFileSync('config.json', 'utf8'));

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir);
}

// Function to get current timestamp
function getCurrentTimestamp() {
    return new Date().toISOString();
}

// Asynchronous logging function
function logMessage(message) {
    const logFile = path.join(logsDir, 'agent.log');
    const logEntry = JSON.stringify({ timestamp: getCurrentTimestamp(), message }) + '\n';
    fs.appendFile(logFile, logEntry, (err) => {
        if (err) {
            console.error('Failed to write log:', err);
        }
    });
}

// Function to execute scripts
function executeScript(script, args) {
    return new Promise((resolve, reject) => {
        const scriptPath = path.join(__dirname, 'scripts', script);
        const logFile = path.join(logsDir, `${script}.log`);
        const isJavaScript = script.endsWith('.js');
        const isPython = script.endsWith('.py');
        const isShell = script.endsWith('.sh');

        if (!isJavaScript && !isPython && !isShell) {
            const errorMessage = `Unsupported file format: ${script}`;
            logMessage(errorMessage);
            return reject(new Error(errorMessage));
        }

        const command = isJavaScript ? `node ${scriptPath}` : isPython ? `python ${scriptPath}` : `bash ${scriptPath}`;

        const logStream = fs.createWriteStream(logFile, { flags: 'a' });

        const logEntry = (message) => {
            logStream.write(JSON.stringify({ timestamp: getCurrentTimestamp(), message }) + '\n');
        };

        logEntry(`Executing: ${command}`);

        const child = exec(command, (error, stdout, stderr) => {
            if (error) {
                logEntry(`Error: ${error.message}`);
                reject(error);
            }
            if (stderr) {
                logEntry(`stderr: ${stderr}`);
            }
            logEntry(`stdout: ${stdout}`);
            logStream.end(); // Close the log stream here
            resolve(stdout);
        });

        child.stdout.on('data', (data) => {
            logEntry(data);
        });

        child.stderr.on('data', (data) => {
            logEntry(data);
        });
    });
}

// Schedule tasks based on configuration
const scheduledTasks = [];
config.scripts.forEach(scriptConfig => {
    if (scriptConfig.enabled) {
        try {
            logMessage(`Scheduling ${scriptConfig.name} with frequency: ${scriptConfig.frequency}`);
            const task = cron.schedule(scriptConfig.frequency, () => {
                executeScript(scriptConfig.name, scriptConfig.args)
                    .then(output => logMessage(`Executed ${scriptConfig.name} successfully.`))
                    .catch(err => logMessage(`Failed to execute ${scriptConfig.name}: ${err.message}`));
            });
            scheduledTasks.push(task);
        } catch (error) {
            logMessage(`Error scheduling ${scriptConfig.name}: ${error.message}`);
        }
    }
});

console.log('Agent is running...');

// Cleanup function to stop all scheduled tasks
function cleanup() {
    scheduledTasks.forEach(task => task.stop());
    logMessage('All scheduled tasks have been stopped.');
}

// Export the executeScript function and cleanup function
module.exports = { executeScript, cleanup };
