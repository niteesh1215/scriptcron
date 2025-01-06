const fs = require('fs');
const path = require('path');
const { executeScript, cleanup } = require('../src/agent'); // Adjust the import based on your structure

// Helper function to generate a random string
function generateRandomString(length) {
    return Math.random().toString(36).substring(2, length + 2);
}

function getAbsolutePath(name) {
    return path.join(__dirname, `../src/scripts/${name}`)
}

// Helper function to create example files with random names
function createExampleFiles() {
    const randomSuffix = generateRandomString(5);
    const exampleFiles = [
        {
            name: randomSuffix + '.js',
            content: 'console.log("Script 3 executed at " + new Date().toISOString());'
        },
        {
            name: randomSuffix + '.py',
            content: 'import datetime\nprint("Example Python script executed at " + str(datetime.datetime.now()))'
        },
        {
            name: randomSuffix + '.sh',
            content: '#!/bin/bash\necho "Script 1 executed"'
        }
    ];

    exampleFiles.forEach(file => {
        const path = getAbsolutePath(file.name);
        fs.writeFileSync(path, file.content);
        fs.chmodSync(path, '755'); // Make shell script executable
    });

    return exampleFiles.map(file => file.name); // Return the names for cleanup
}

// Helper function to delete example files
function deleteExampleFiles(exampleFiles) {
    exampleFiles.forEach(file => {
        const path = getAbsolutePath(file);
        if (fs.existsSync(path)) {
            fs.unlinkSync(path);
        }
    });
}

describe('Agent Script Execution', () => {
    let exampleFiles;

    beforeAll(() => {
        exampleFiles = createExampleFiles(); // Create necessary example files
    });

    afterAll(() => {
        cleanup(); // Call cleanup to stop all scheduled tasks
        deleteExampleFiles(exampleFiles); // Delete example files after tests
    });

    test('should handle unsupported file format', async () => {
        const unsupportedScript = 'unsupported_file.txt';
        await expect(executeScript(unsupportedScript, []))
            .rejects
            .toThrow(`Unsupported file format: ${unsupportedScript}`);
    });

    test('should execute JavaScript file successfully', async () => {
        const script = exampleFiles.find(file => file.endsWith('.js')); // Get the random JS file
        await expect(executeScript(script, []))
            .resolves
            .toBeDefined();
    });

    test('should execute Python file successfully', async () => {
        const script = exampleFiles.find(file => file.endsWith('.py')); // Get the random Python file
        await expect(executeScript(script, []))
            .resolves
            .toBeDefined();
    });

    test('should execute shell script successfully', async () => {
        const script = exampleFiles.find(file => file.endsWith('.sh')); // Get the random shell script
        await expect(executeScript(script, []))
            .resolves
            .toBeDefined();
    });

    test('should log error for failed script execution', async () => {
        const failingScript = 'failing_script.js'; // Ensure this script exists and is invalid
        await expect(executeScript(failingScript, []))
            .rejects
            .toThrow();
    });

    test('should log execution messages', async () => {
        const script = exampleFiles.find(file => file.endsWith('.js')); // Get the random JS file
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(); // Mock console.log

        await executeScript(script, []);
        
        expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Executing:'));
        consoleSpy.mockRestore(); // Restore original console.log
    });
});
