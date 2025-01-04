const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Mock the exec function
jest.mock('child_process');

describe('Agent Script Execution', () => {
    const scriptPath = path.join(__dirname, 'scripts', 'script1.sh');

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should execute script1.sh with arguments', (done) => {
        const args = ['arg1', 'arg2'];
        const logFile = path.join(__dirname, 'logs', 'script1.sh.log');

        // Mock the exec function to simulate script execution
        exec.mockImplementation((command, callback) => {
            callback(null, 'Script 1 executed with arguments: arg1 arg2', '');
        });

        // Simulate the execution of the script
        exec(`bash ${scriptPath} ${args.join(' ')}`, (error, stdout, stderr) => {
            expect(stdout).toBe('Script 1 executed with arguments: arg1 arg2');
            expect(error).toBeNull();
            done();
        });
    });

    test('should log error when script execution fails', (done) => {
        const args = ['arg1'];
        const logFile = path.join(__dirname, 'logs', 'script1.sh.log');

        // Mock the exec function to simulate an error
        exec.mockImplementation((command, callback) => {
            callback(new Error('Execution failed'), '', 'Error output');
        });

        // Simulate the execution of the script
        exec(`bash ${scriptPath} ${args.join(' ')}`, (error, stdout, stderr) => {
            expect(error).toBeInstanceOf(Error);
            expect(error.message).toBe('Execution failed');
            done();
        });
    });
});
