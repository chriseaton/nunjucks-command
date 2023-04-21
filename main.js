#! /usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { resolve, basename, dirname } from 'path';
import nunjucks from 'nunjucks';
import chokidar from 'chokidar';
import { Glob, glob } from 'glob';
import yargs from 'yargs';
import path from 'path';
import fs from 'fs/promises';

const { argv } = yargs(process.argv.slice(2))
    .usage('Usage: nunjucks <file|glob> [context] [options]')
    .example('nunjucks foo.tpl data.json', 'Compile foo.tpl to foo.html')
    .example('nunjucks *.tpl -w -p src -o dist', 'Watch .tpl files in ./src, compile them to ./dist')
    .demandCommand(1, 'You must provide at least a file/glob path')
    .epilogue('For more information on Nunjucks: https://mozilla.github.io/nunjucks/')
    .help()
    .alias('help', 'h')
    .locale('en')
    .version(false)
    .option('path', {
        alias: 'p',
        string: true,
        requiresArg: true,
        nargs: 1,
        describe: 'Path where templates live',
    })
    .option('out', {
        alias: 'o',
        string: true,
        requiresArg: true,
        nargs: 1,
        describe: 'Output folder',
    })
    .option('watch', {
        alias: 'w',
        boolean: true,
        describe: 'Watch files change, except files starting by "_"',
    })
    .option('extension', {
        alias: 'e',
        string: true,
        requiresArg: true,
        default: 'html',
        describe: 'Extension of the rendered files',
    })
    .option('options', {
        alias: 'O',
        string: true,
        requiresArg: true,
        nargs: 1,
        describe: 'Nunjucks options file',
    });

(async () => {
    const inputDir = resolve(process.cwd(), argv.path) || '';
    const outputDir = argv.out || '';

    const context = argv._[1] ? JSON.parse(await fs.readFile(argv._[1], 'utf8')) : {};
    // Expose environment variables to render context
    context.env = process.env;

    /** @type {nunjucks.ConfigureOptions} */
    const nunjucksOptions = argv.options
        ? JSON.parse(await fs.readFile(argv.options, 'utf8'))
        : { trimBlocks: true, lstripBlocks: true, noCache: true };

    const nunjucksEnv = nunjucks.configure(inputDir, nunjucksOptions);

    const render = async (files) => {
        for (const file of files) {
            // No performance benefits in async rendering
            // https://mozilla.github.io/nunjucks/api.html#asynchronous-support
            const res = nunjucksEnv.render(file, context);
            let outputFile = file.replace(/\.\w+$/, `.${argv.extension}`);
            if (outputDir) {
                try {
                    await fs.mkdir(outputDir, true);
                } catch (err) {
                    //it's ok if the dir aready exists
                    if (!err.code === 'EEXIST') {
                        console.error(err);
                        return;
                    }
                }
            }
            console.log('Rendering: ' + file);
            await fs.writeFile(path.join(outputDir, outputFile), res);
            console.log('wrote', outputFile)
        }
    }

    /** @type {glob.IOptions} */
    const globOptions = { strict: true, cwd: inputDir, ignore: '**/_*.*', nonull: true };

    // Render the files given a glob pattern (except the ones starting with "_")
    try {
        let files = [];
        for (let file of new Glob(argv._[0], globOptions)) {
            files.push(file);
        }
        console.log(files);
        await render(files);
    } catch (err) {
        console.error(err);
    }
    // Watcher
    if (argv.watch) {
        const layouts = [];
        const templates = [];
        /** @type {chokidar.WatchOptions} */
        const watchOptions = { persistent: true, cwd: inputDir };
        const watcher = chokidar.watch(argv._[0], watchOptions);
        watcher.on('ready', () => console.log('Watching templates...'));
        // Sort files to not render partials/layouts
        watcher.on('add', (file) => {
            if (basename(file).indexOf('_') === 0) layouts.push(file)
            else templates.push(file)
        });
        // if the file is a layout/partial, render all other files instead
        watcher.on('change', (file) => {
            if (layouts.indexOf(file) > -1) render(templates)
            else render([file])
        });
    }
})();