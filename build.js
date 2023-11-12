const CONFIG = {
  resources: {
    name: "Shikiplayer",
    version: "5.3.0",
    author: "Kaneko Qt",
    homepage_url: "https://github.com/qt-kaneko/Shikiplayer",
    icon: "file://assets/icons/icon128-light.png",
    unwrapped_window: "lib/UnwrappedWindow/inject.js",

    description: "Adds Kodik player to Shikimori website",
    description_ru: "Добавляет плеер Kodik на сайт Shikimori",

    kodik_token: "447d179e875efe44217f20d1ee2146be",
    poster: "//raw.github.com/qt-kaneko/Shikiplayer/main/assets/poster.jpg",

    userscript: "file://dist/Shikiplayer.js"
  },

  esbuild: {
    outfile: "Shikiplayer.js",
    entry: "src/index.ts",
  },

  destination: "dist",
  includes: {
    extension: ["LICENSE.txt", "manifest.json", "_locales", "assets/icons/icon128.png", "lib/UnwrappedWindow/inject.js"],
    userscript: ["manifest.user.js"]
  }
};

"use strict";
const fs = require("fs");
const fsp = require("fs/promises");
class BuildError {
    name = BuildError.prototype.constructor.name;
    message;
    constructor(message) {
        this.message = message;
    }
}
async function build(config) {
    let tasks = [];
    if (!fs.existsSync(config.destination))
        fs.mkdirSync(config.destination);
    let includes = (config.includes instanceof Array) ? config.includes
        : config.includes[config.configuration];
    if (includes.length === 0)
        console.log(`  Nothing to include ¯\\_(ツ)_/¯`);
    else {
        console.log(`  Copying includes -> ${config.destination}`);
        tasks.push(...includes.map(include => {
            let source;
            let destination;
            if (typeof include === `string`)
                source = destination = include;
            else
                [source, destination] = [include[0], include[1]];
            return fsp.cp(source, config.destination + `/` + destination, { recursive: true });
        }));
    }
    let releaseTsConfigExists = fs.existsSync(`tsconfig.release.json`);
    if (config.typescript && config.esbuild == null) {
        console.log(`  Compiling...`);
        tasks.push(spawnAsync(`tsc`, [`--build`, (config.release && releaseTsConfigExists ? `tsconfig.release.json` : `tsconfig.json`)], { stdio: `inherit` })
            .then(exitCode => exitCode !== 0 ? Promise.reject() : Promise.resolve()));
    }
    if (config.esbuild != null) {
        let options = [
            config.esbuild.entry,
            `--bundle`,
            `--outfile=${config.destination}/${config.esbuild.outfile}`,
            `--log-level=warning`
        ];
        if (config.typescript)
            options.push(config.release && releaseTsConfigExists ? `--tsconfig=tsconfig.release.json` : `--tsconfig=tsconfig.json`);
        if (!config.release)
            options.push(`--sourcemap`);
        console.log(`  Bundling...`);
        tasks.push(spawnAsync(`esbuild`, options, { stdio: `inherit` })
            .then(exitCode => exitCode !== 0 ? Promise.reject() : Promise.resolve()));
    }
    try {
        await Promise.all(tasks);
    }
    catch (e) {
        if (e instanceof Error) {
            throw new BuildError(e.message);
        }
        else
            throw e;
    }
    let outFile = config.tsconfig?.[`compilerOptions`]?.[`outFile`];
    if (config.main && config.typescript && outFile != null) {
        const mainInvoke = `\nif (typeof main === "function") main(); // Build.js auto-generated`;
        let content = await fsp.readFile(outFile);
        let contentString = content.toString();
        if (!contentString.includes(mainInvoke)) {
            contentString += mainInvoke;
            await fsp.writeFile(outFile, contentString);
        }
    }
    if (tasks.length > 0) {
        config.buildArtifacts = fs.readdirSync(config.destination, { recursive: true })
            .map(name => config.destination + `/` + name);
    }
}
async function clean(config) {
    let tasks = [];
    if (!config.release)
        return;
    if (config.typescript && !config.esbuild) {
        tasks.push(spawnAsync(`tsc`, [`--build`, `--clean`, `tsconfig.json`], { stdio: `inherit` }), spawnAsync(`tsc`, [`--build`, `--clean`, `tsconfig.release.json`], { stdio: `inherit` }));
    }
    tasks.push(fsp.rm(config.destination, { recursive: true, force: true }));
    console.log(`  Cleaning...`);
    try {
        await Promise.all(tasks);
    }
    catch (e) {
        if (e instanceof Error) {
            throw new BuildError(e.message);
        }
        else
            throw e;
    }
}
async function main() {
    console.time(`Elapsed`);
    console.log(`Build.js`);
    try {
        if (typeof CONFIG === `undefined`)
            throw new BuildError(`Build config is not defined.`);
        CONFIG.destination ??= ``;
        CONFIG.includes ??= [];
        CONFIG.resources ??= {};
        if (!fs.existsSync(`build.js`)) {
            throw new BuildError(`'build.js' was not found in working directory, are you running in correct folder?`);
        }
        if (fs.existsSync(`package.json`)) {
            CONFIG.npm ??= true;
            CONFIG.package = JSON.parse(fs.readFileSync(`package.json`).toString());
        }
        else
            CONFIG.npm ??= false;
        let args = process.argv.slice(2);
        CONFIG.options = args.filter(arg => !arg.startsWith(`-`));
        CONFIG.parameters = args.filter(arg => arg.startsWith(`-`));
        CONFIG.configuration = CONFIG.options.at(0);
        CONFIG.release = CONFIG.parameters.includes(`--release`);
        if (fs.existsSync(`tsconfig.json`)) {
            CONFIG.typescript ??= true;
            CONFIG.tsconfig = JSON.parse(fs.readFileSync(`tsconfig.json`).toString());
        }
        else
            CONFIG.typescript ??= false;
        CONFIG.main ??= (!CONFIG.esbuild ? true : false);
        console.log(`Building`
            + (CONFIG.configuration != null ? ` configuration '${CONFIG.configuration}'`
                : ` without configuration`)
            + ` in ${CONFIG.release ? `release` : `debug`} mode:`);
        await validate(CONFIG);
        await clean(CONFIG);
        await restore(CONFIG);
        await build(CONFIG);
        await postprocess(CONFIG);
        console.log();
        console.log(`\x1B[32mBuild succeeded.\x1B[0m`);
    }
    catch (e) {
        if (e instanceof BuildError) {
            if (e.message !== ``) {
                console.log();
                console.log(`\x1B[91mError: ${e.message}\x1B[0m`);
            }
            console.log();
            console.log(`\x1B[91mBuild FAILED.\x1B[0m`);
            process.exitCode = -1;
        }
        else
            throw e;
    }
    console.log();
    console.timeEnd(`Elapsed`);
}
main();
const buffer = require("buffer");
async function postprocess(config) {
    console.log(`  Post-processing...`);
    await Promise.all(config.buildArtifacts.map(async (path) => {
        let stat = await fsp.stat(path);
        if (!stat.isFile())
            return;
        let content = await fsp.readFile(path);
        if (!buffer.isUtf8(content))
            return;
        let contentString = content.toString();
        let anyReplaced = false;
        for (let replaced = false;; replaced = false) {
            for (let [key, value] of Object.entries(config.resources)) {
                let target = `$(` + key.toUpperCase() + `)`;
                let replacement;
                const filePrefix = `file://`;
                if (value.startsWith(filePrefix)) {
                    let filePath = value.slice(filePrefix.length);
                    let fileReplacement = await fsp.readFile(filePath);
                    replacement = buffer.isUtf8(fileReplacement)
                        ? fileReplacement.toString()
                        : fileReplacement.toString(`base64`);
                }
                else
                    replacement = value;
                if (!replaced && contentString.includes(target))
                    anyReplaced = replaced = true;
                contentString = contentString.replaceAll(target, replacement);
            }
            if (!replaced)
                break;
        }
        if (anyReplaced)
            await fsp.writeFile(path, contentString);
    }));
}
async function restore(config) {
    if (!config.npm)
        return;
    if (fs.existsSync(`node_modules`))
        return;
    let dependencies = config.package[`dependencies`] ?? [];
    let devDependencies = config.package[`devDependencies`] ?? [];
    if (dependencies.length === 0 && devDependencies.length === 0)
        return;
    console.log(`  Restoring...`);
    if (await spawnAsync(`npm`, [`install`], { stdio: [`inherit`, `ignore`, `inherit`] }) !== 0) {
        throw new BuildError(``);
    }
}
async function validate(config) {
    if (config.destination === ``) {
        throw new BuildError(`No destination specified.`);
    }
    if ([`.`, `./`, `./src`, `src`].includes(config.destination)) {
        throw new BuildError(`Are you sure you want to delete all your sources on build ?) (why destination includes source files?)`);
    }
    if (fs.existsSync(config.destination) && !fs.readdirSync(config.destination).some(name => name.endsWith(`.js`))) {
        throw new BuildError(`No .js files found in '${config.destination}', is destination specified correctly?\n` +
            `Remove '${config.destination}' manually if you are sure that this is correct behaviour.`);
    }
    if (!(config.includes instanceof Array)) {
        let configurations = Object.keys(config.includes);
        if (config.configuration == null) {
            throw new BuildError(`Configuration option was not provided, but multiple ['${configurations.join(`', '`)}'] configuratons exists.`);
        }
        if (!configurations.includes(config.configuration)) {
            throw new BuildError(`Configuration '${config.configuration}' does not exists in ['${configurations.join(`', '`)}'].`);
        }
    }
}
const cp = require("child_process");
function spawnAsync(command, args, options) {
    return new Promise(resolve => cp.spawn(command, args, options)
        .on(`exit`, code => resolve(code)));
}
