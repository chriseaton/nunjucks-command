# Nunjucks-Command

A simple Nunjucks command-line (CLI) tool to compile and watch templates into static HTML files. Adds support for 
in-file JSON front-matter via a custom nunjucks extension.

Not locked to any version of nunjucks, uses async/await, and has a small dependency list.

## Installation

```bash
npm i -D nunjucks-command # local
npm i -g nunjucks-command # global
```

## Usage

```bash
nunjucks <file|glob> [context] [options]
```

_For convenience, `process.env` object is added to the context as `env`._

### Front-Matter
Include the supported front-matter start `{% fm %}`  and end `{% endfm %}` tags. Within these tags, add a valid JSON
document. The values in this front-matter are assigned to the current context object for that rendered template only.

This will override any preset or added context data for that template, from that render-point onward.

For example the following would output a "hello mars!" message in the HTML:
```html
{% fm %}
{
    "message": "hello mars!"
}
{% endfm %}
<html>
    {{message}}
</html>
```

#### Basic examples

```bash
nunjucks foo.tpl data.json
```

Compiles `foo.tpl` to `foo.html` with data from `data.json` (and variables from `process.env` as `env`).

```bash
nunjucks **/*.tpl
```

Compiles all `.tpl` files (including subdirectories), except the ones starting by `_` (so you can use them as layouts).

## Options

### `--path <directory>`

`-p <directory>`

Path where the templates live. Default to the current working directory.
See <https://mozilla.github.io/nunjucks/api.html#configure>

### `--out <directory>`

`-o <directory>`

Output directory.

### `--watch`

`-w`

Allows to keep track of file changes and render accordingly (except files starting by `_`).

### `--extension <ext>`

`-e <ext>`

Extension for rendered files. Defaults to `html`.

### `--options <file>`

`-O <file>`

Takes a json file as Nunjucks options. Defaults are :

```json
{
    "trimBlocks": true,
    "lstripBlocks": true,
    "noCache": true
}
```

See <https://mozilla.github.io/nunjucks/api.html#configure>

#### Advanced examples

```bash
nunjucks foo.tpl -p src -o dist -O nj.json
```

Compiles `src/foo.tpl` to `dist/foo.html`, with `nj.json` as nunjucks environnement options.

```bash
nunjucks *.tpl data.json -w -p src
```

Compiles all `.tpl` files (except ones starting with `_`) in the `src` folder to the current working directory, with `data.json` as metadata, and keeps running in the background for files changes.
