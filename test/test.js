import { spawnSync } from 'child_process';
import fs from 'fs/promises';
import { ok, deepStrictEqual } from 'assert';

process.env.NODE_ENV = 'development';

const src = `test/fixtures`;
const dist = `test/fixtures/dist`;
const context = `test/fixtures/data.json`;
const glob = `*.tpl`;
const cmd = `node main.js ${glob} ${context} -p ${src} -o ${dist}`;

(async () => {
    spawnSync(cmd, { shell: true, stdio: 'inherit' });
    const filesCompiled = await fs.readdir(dist);
    deepStrictEqual(filesCompiled, ['first.html', 'second.html'], 'Templates not rendered correctly');
    for (const file of filesCompiled) {
        const content = await fs.readFile(`${dist}/${file}`, 'utf8');
        ok(content.startsWith('<!DOCTYPE html>'), 'Layout not extended');
        if (file === 'first.html') {
            ok(content.includes('json,file'), 'Context not interpolated');
        }
        if (file === 'second.html') {
            ok(content.includes('development'), 'Env variable not passed');
        }
        await fs.unlink(`${dist}/${file}`);
    }
    await fs.rm(dist, { recursive: true, force: true });
})();