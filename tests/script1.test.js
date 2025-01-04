const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

describe('script1.sh', () => {
    const scriptPath = path.join(__dirname, '../src/scripts/script1.sh');

    test('should execute script1.sh with arguments', (done) => {
        const args = ['arg1', 'arg2'];

        exec(`bash ${scriptPath} ${args.join(' ')}`, (error, stdout, stderr) => {
            expect(stdout).toContain('Script 1 executed with arguments: arg1 arg2');
            expect(error).toBeNull();
            done();
        });
    });
});
