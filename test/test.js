import { spawnSync } from 'child_process';
import fs from 'fs/promises';
import { ok, deepStrictEqual } from 'assert';

process.env.NODE_ENV = 'development';

const src = `test/fixtures`;
const dist = `test/fixtures/dist`;
const context = `test/fixtures/data.json`;
const glob = `**/*.tpl`;
const cmd = `node main.js ${glob} ${context} -s -p ${src} -o ${dist}`;

(async () => {
    spawnSync(cmd, { shell: true, stdio: 'inherit' });
    let filesCompiled = await fs.readdir(dist);
    deepStrictEqual(filesCompiled, ['first.html', 'second.html', 'third'], 'Templates not rendered correctly');
    for (const file of filesCompiled) {
        if (file.match(/.*\.html$/i)) {
            const content = await fs.readFile(`${dist}/${file}`, 'utf8');
            ok(content.startsWith('<!DOCTYPE html>'), 'Layout not extended');
            if (file === 'first.html') {
                ok(content.includes('json,file'), 'Context not interpolated');
                ok(content.includes('first-tpl'), 'Failed to include template slug.');
            }
            if (file === 'second.html') {
                ok(content.includes('development'), 'Env variable not passed');
            }
        }
    }
    filesCompiled = await fs.readdir(dist + '/third');
    deepStrictEqual(filesCompiled, ['third.html'], 'Templates not rendered correctly');
    for (const file of filesCompiled) {
        if (file.match(/.*\.html$/i)) {
            const content = await fs.readFile(`${dist}/third/${file}`, 'utf8');
            if (file === 'third.html') {
                ok(content.includes('hello mars!'), 'Front-matter not parsed');
            }
        }
    }
    // await fs.rm(dist, { recursive: true, force: true });
})();