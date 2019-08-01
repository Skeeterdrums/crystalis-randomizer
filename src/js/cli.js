#!/usr/bin/env node

require = require('esm')(module);

const {EXPECTED_CRC32} = require('./rom.js');
const {FlagSet, PRESETS} = require('./flagset.js');
const {crc32} = require('./crc32.js');
const fs = require('fs');
const patch = require('./patch.js');
const {UsageError, breakLines} = require('./util.js');
const {NodeReader} = require('./nodereader.js');
const version = require('./version.js');
const {disableAsserts} = require('./assert.js');

// Usage: node cli.js [--flags=<FLAGS>] [--seed=<SEED>] rom.nes

const usage = (code) => {
  console.log(`Crystalis Randomizer v${version.VERSION}
Usage: cryr [OPTIONS...] rom.nes

Options
  --flags=FLAGSET    Specify the flagset.
  --preset=PRESET    Specify the preset by name.
                     Spaces and capitalization are ignored.
  --seed=SEED        Specify the seed.
  --output=PATTERN   Specify the output filename pattern.
                     May include placeholders:
                       %n: input base filename
                       %v: cryr version hash
                       %s: seed
                       %f: flagset
                       %c: checksum
                     The default pattern is "%n_%c".
  --count=NUMBER     Number of shuffled roms to generate.
                     This flag is not compatible with specifying
                     a seed manually, nor with output patterns
                     that don't include %s or %c.
  --force            Don't fail due to wrong input file checksum.

Flags
  The randomizer supports a number of options, documented in detail
  at https://crystalisrandomizer.com.  Spaces are ignored.

Presets
${PRESETS.map(showPreset).join('\n\n')}`);
  process.exit(code);
};

const showPreset = ({title, flags, descr}) => {
  const LINE_LENGTH = 68;
  const flagLen = LINE_LENGTH - title.length - 6;
  const flagLines = breakLines(flags, flagLen);
  const descrLines = breakLines(descr, LINE_LENGTH - 2);
  const indent = '\n' + ' '.repeat(title.length + 5);
  return `  ${title}: "${flagLines.join(indent)}"
  ${descrLines.join('\n  ')}`;
};

const main = (...args) => {
  let flags = '@FullShuffle';
  let count = 1;
  let seed = '';
  let output = '%n_%c';
  let force = false;
  while (args[0] && args[0].startsWith('--')) {
    let arg = args.shift().substring(2);
    let value = undefined;
    const eq = arg.indexOf('=');
    if (eq >= 0) {
      value = arg.substring(eq + 1);
      arg = arg.substring(0, eq);
    } else {
      value = args.shift();
    }
    if (arg == 'flags') {
      flags = value;
    } else if (arg == 'preset') {
      flags = '@' + value.replace(/ /g, '');
    } else if (arg == 'output') {
      output = value;
    } else if (arg == 'seed') {
      seed = value;
    } else if (arg == 'count') {
      count = Number(value);
    } else if (arg == 'force') {
      force = true;
      disableAsserts();
      if (value != null) args.unshift(value);
    } else if (arg == 'help') {
      usage(0);
    } else if (arg == 'version' || arg == '-v') {
      console.log(version.VERSION);
      process.exit(0);
    } else if (arg == 'list-presets') {
      // undocumented flag
      for (const {title} of PRESETS) {
        console.log(title.replace(/ /g, ''));
      }
      process.exit(0);
    } else {
      console.error(`Bad argument: ${arg}`);
      usage(1);
    }
  }

  if (args.length != 1) usage(1);
  if (count > 1) {
    if (seed) fail('Cannot specify both --count and --seed');
    if (!/%[sc]/.test(output)) {
      fail('--output must have a %c or %s placeholder when --count is given');
    }
  }

  const flagset = new FlagSet(flags);
  const rom = new Uint8Array(fs.readFileSync(args[0]).buffer);
  if (crc32(rom) != EXPECTED_CRC32) {
    console.error(`WARNING: Bad CRC for input rom: ${crc32(rom).toString(16)}`);
    if (!force) fail('Run with --force to proceed anyway');
    console.error('Proceeding anyway');
  }

  return Promise.all(new Array(count).fill(0).map(async () => {
    const s = patch.parseSeed(seed);
    const shuffled = rom.slice();
    const c = await patch.shuffle(shuffled, s, flagset, new NodeReader());
    const n = args[0].replace('.nes', '');
    const f = String(flagset).replace(/ /g, '');
    const v = patch.BUILD_HASH;
    const filename = fillTemplate(output, {c, n, s, v, f, '%': '%'}) + '.nes';
    await new Promise(
        (resolve, reject) => fs.writeFile(
            filename, shuffled, (err) => err ? reject(err) : resolve()));
    console.log(`Wrote ${filename}`);
  }));
};

const fail = (message) => {
  console.error(message);
  process.exit(2);
};

const fillTemplate = (str, arg) => {
  const terms = [];
  while (str) {
    const index = str.indexOf('%');
    if (index < 0) {
      terms.push(str);
      str = '';
    } else {
      terms.push(str.substring(0, index));
      const ch = str[index + 1];
      if (!(ch in arg)) throw new Error(`Bad placeholder: %${ch}`);
      terms.push(arg[ch]);
      str = str.substring(index + 2);
    }
  }
  return terms.join('');
};

process.on('unhandledRejection', error => {
  console.error(
      typeof error === 'string' ?
          error :
          error instanceof UsageError ? error.message : error.stack);
  process.exit(1);
});

const asyncMain =
    async () => {
  try {
    await main(...process.argv.slice(2));
  } catch (error) {
    if (error instanceof UsageError) {
      console.error(error.message);
      console.error(`Try passing --help for documentation.`);
      process.exit(1);
    }
    throw error;
  }
}

                asyncMain()
                    .then(() => process.exit(0));
