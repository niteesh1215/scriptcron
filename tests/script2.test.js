const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

describe('script2.sh', () => {
    const scriptPath = path.join(__dirname, '../src/scripts/script2.sh');

    test('should execute script2.sh with arguments', (done) => {
        const args = ['arg1'];

        exec(`bash ${scriptPath} ${args.join(' ')}`, (error, stdout, stderr) => {
            expect(stdout).toContain('Script 2 executed with arguments: arg1');
            expect(error).toBeNull();
            done();
        });
    });
});
