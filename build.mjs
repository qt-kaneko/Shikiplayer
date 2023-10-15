// @ts-check
import * as fs from "fs";
import * as fsp from "fs/promises";
import * as cp from "child_process";

// CONFIG
const INCLUDE = [`LICENSE.txt`, `manifest.json`, `_locales`, `assets/icons/icon128.png`];
const DESTINATION = `dist`;

if (!fs.existsSync(`package.json`))
{
  console.error(`'package.json' was not found, are you running from correct directory?`);
  process.exit(1);
}
if (fs.existsSync(DESTINATION) && !fs.readdirSync(DESTINATION).some(name => name.endsWith(`.js`)))
{
  console.error(`No .js files found in '${DESTINATION}', is destination specified correctly?\n` +
                `Remove '${DESTINATION}' manually if you are sure that this is correct behaviour.`);
  process.exit(1);
}

let isRelease = process.argv.includes(`release`);

if (!fs.existsSync(`node_modules`))
{
  await spawnAsync(`npm`, [`install`], {stdio: `inherit`})
}

if (isRelease)
{
  await Promise.all([
    spawnAsync(`tsc`, [`--build`, `--clean`, `tsconfig.json`], {stdio: `inherit`}),
    spawnAsync(`tsc`, [`--build`, `--clean`, `tsconfig.release.json`], {stdio: `inherit`}),
    fsp.rm(DESTINATION, {recursive: true, force: true})
  ]);
}

let copyIncludes = INCLUDE.map(includeItem =>
  fsp.cp(includeItem, DESTINATION + `/` + includeItem, {recursive: true})
);

let build = spawnAsync(
  `tsc`,
  [`--build`, (isRelease ? `tsconfig.release.json` : `tsconfig.json`)],
  {stdio: `inherit`}
);
build = build.then(code => process.exitCode = code ?? -1);

await Promise.all([...copyIncludes, build]);

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