// @ts-check
const CONFIG = {
  npm: false,
  typescript: true,
  destination: `dist`,

  extension: [`LICENSE.txt`, `manifest.json`, `_locales`, `assets/icons/icon128.png`],
  userscript: [`manifest.user.js`],
};



import * as fs from "fs";
import * as fsp from "fs/promises";
import * as cp from "child_process";

const release = process.argv.includes(`--release`);
const include = process.argv.filter(option => !option.startsWith(`--`))[2] ?? `default`;
const includes = /** @type {{[k: string]: string[]}} */ (Object.fromEntries(
  Object.entries(CONFIG)
        .filter(([name, value]) => ![`npm`, `typescript`, `destination`].includes(name))
));

await validate();
await clean();
await build();
await postprocess();

async function validate()
{
  if ([`.`, `./`, `./src`, `src`].includes(CONFIG.destination))
  {
    console.error(`\x1B[91mERROR: Are you sure you want to delete all your sources on build ?) (why destination includes source files?)`);
    process.exit(1);
  }

  if (!fs.existsSync(`package.json`))
  {
    console.error(`\x1B[91mERROR: 'package.json' was not found, are you running from correct directory?`);
    process.exit(1);
  }

  if (fs.existsSync(CONFIG.destination) && !fs.readdirSync(CONFIG.destination).some(name => name.endsWith(`.js`)))
  {
    console.error(`\x1B[91mERROR: No .js files found in '${CONFIG.destination}', is destination specified correctly? Remove '${CONFIG.destination}' manually if you are sure that this is correct behaviour.`);
    process.exit(1);
  }

  if (CONFIG.typescript && (!fs.existsSync(`tsconfig.json`) || !fs.existsSync(`tsconfig.release.json`)))
  {
    console.error(`\x1B[91mERROR: Typescript build config (tsconfig.json or tsconfig.release.json) was not found.`);
    process.exit(1);
  }

  if (!Object.keys(includes).includes(include))
  {
    console.error(`\x1B[91mERROR: Include configuration '${include}' does not exists in ['${Object.keys(includes).join(`', '`)}']. Have you even passed include configuration?`);
    process.exit(1);
  }
}
async function clean()
{
  if (!release) return; // Clean only in Release

  let tasks = [];

  // Remove typescript build cache (like .tsbuildinfo)
  if (CONFIG.typescript)
  {
    tasks.push([
      spawnAsync(`tsc`, [`--build`, `--clean`, `tsconfig.json`], {stdio: `inherit`}),
      spawnAsync(`tsc`, [`--build`, `--clean`, `tsconfig.release.json`], {stdio: `inherit`}),
    ]);
  }

  // Remove build artifacts
  tasks.push(
    fsp.rm(CONFIG.destination, {recursive: true, force: true})
  );

  await Promise.all(tasks);
}
async function build()
{
  if (CONFIG.npm && !fs.existsSync(`node_modules`))
  {
    await spawnAsync(`npm`, [`install`], {stdio: `inherit`})
  }

  let tasks = [];

  // Copy includes
  tasks.push(
    includes[include].map(includeItem =>
      fsp.cp(includeItem, CONFIG.destination + `/` + includeItem, {recursive: true})
    )
  );

  // Compile
  tasks.push(
    spawnAsync(
      `tsc`,
      [`--build`, (release ? `tsconfig.release.json` : `tsconfig.json`)],
      {stdio: `inherit`}
    ).then(code => process.exitCode = code ?? -1)
  );

  await Promise.all(tasks);
}
async function postprocess()
{
  let packageInfoJson = (await fsp.readFile(`package.json`)).toString();
  let packageInfo = JSON.parse(packageInfoJson);
  let version = packageInfo[`version`] ?? `$(VERSION)`;

  let buildArtifacts = /** @type {string[]} */ (fs.readdirSync(CONFIG.destination, {recursive: true}));

  let tasks = [];

  tasks.push(
    buildArtifacts.map(async (name) => {
      let path = CONFIG.destination + `/` + name;

      let stat = await fsp.stat(path);
      if (!stat.isFile()) return;

      let content = (await fsp.readFile(path)).toString();
      content = content.replace(`$(VERSION)`, version);

      await fsp.writeFile(path, content);
    })
  );

  await Promise.all(tasks);
}

/**
 * @param {string} command 
 * @param {readonly string[]} args
 * @param {cp.SpawnSyncOptions} options
 * @returns {Promise<number|null>}
 */
function spawnAsync(command, args, options)
{
  return new Promise(resolve =>
    cp.spawn(command, args, options)
      .on(`exit`, code => resolve(code))
  );
}