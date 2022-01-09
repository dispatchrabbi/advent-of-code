import path from 'path';
import fs from 'fs/promises';

import log from 'loglevel';
import parseArgs from 'minimist';

import makeDir from 'make-dir';

import timeSpan from 'time-span';
import prettyMilliseconds from 'pretty-ms';

const __filename = import.meta.url.replace('file://', '');
const __dirname = path.dirname(__filename);

main().catch(
  e => { log.error(e); process.exit(process.exitCode === 0 ? 1 : process.exitCode); }
);

async function main() {
  log.setDefaultLevel('info');

  const argv = parseArgs(process.argv.slice(2), {
    string: ['inputs', 'file', 'log-level'],
    boolean: [
      'help', 'new',
      'silent', 'debug',
      'timer',
    ],
    default: {
      'log-level': 'info',
      'inputs': 'real',
      'timer': true
    },
  });

  // Display help text?
  if(argv.help) {
    log.info(help());
    return;
  }

  // Set the log level
  const VALID_LOG_LEVELS = [ 'trace', 'debug', 'info', 'warn', 'error', 'silent' ];
  if(argv.silent) {
    argv['log-level'] = 'silent';
  } else if(argv.debug) {
    argv['log-level'] = 'debug';
  }

  if(argv['log-level'] && VALID_LOG_LEVELS.includes(argv['log-level'])) {
    log.setLevel(argv['log-level']);
  }

  // Validate puzzle address inputs
  const [ year, day, part ] = argv._;
  validatePuzzleAddress(year, day, argv.new ? null : part);

  // Are we creating a new puzzle scaffold?
  if(argv.new) {
    await create(year, day);
    return;
  }

  // Set the run options
  const options = {
    timer: true,
    input: {
      real: false,
      examples: false,
      file: null,
    },
  };

  if(['real', 'all'].includes(argv.inputs)) {
    options.input.real = true;
  }

  if(['examples', 'all'].includes(argv.inputs)) {
    options.input.examples = true;
  }

  if(argv.file) {
    options.input.file = argv.file;
  }

  // passing --no-timer will set timer to false
  options.timer = argv.timer;

  run(year, day, part, options);
}

async function run(year, day, part, options = { timer: true, input: { file: null, real: true, examples: false }}) {
  log.info(`Running 📯 ${year} 🌅 ${day} 🧩 ${part}...`);
  log.info('');

  const puzzleDir = path.join(__dirname, `puzzles/${year}/${day}`);

  // Import the puzzle function
  const parts = await import(path.join(puzzleDir, 'puzzle.js'));
  const fn = parts.default['part' + part];
  if(typeof fn !== 'function') {
    throw new Error(`Puzzle ${year}/${day} part ${part} is not a function (which probably means it doesn't exist)!`);
  }

  // Gather the input files and expected outputs
  const files = { real: null, examples: [] };

  if(options.input.real || options.input.file) {
    const realFilename = options.input.file || 'input.txt';
    files.real = await fs.readFile(path.join(puzzleDir, realFilename), { encoding: 'utf-8' });
  }

  if(options.input.examples) {
    const expectedContents = await fs.readFile(path.join(puzzleDir, 'expected.json'), { encoding: 'utf-8' });
    const expected = JSON.parse(expectedContents).filter(obj => obj.part === part);

    const exampleFileFilter = file => {
      if(!file.isFile()) { return false; }
      const DIFFERENT_PART_REGEX = new RegExp(`\\.part[^${part}]\\.txt$`);
      if(DIFFERENT_PART_REGEX.test(file.name)) { return false; }
      return file.name.endsWith('.txt') && file.name !== 'input.txt';
    };
    let exampleFiles = await fs.opendir(puzzleDir);
    for await(let file of exampleFiles) {
      if(exampleFileFilter(file)) {
        const contents = await fs.readFile(path.join(puzzleDir, file.name), { encoding: 'utf-8' });
        const expectedEntry = expected.find(obj => obj.file === file.name);

        files.examples.push({
          name: file.name,
          contents,
          expected: expectedEntry === undefined ? null : expectedEntry.output,
        });
      }
    }
  }

  // Run each example input
  for(let example of files.examples) {
    log.info(`🧪  ${example.name}...`);
    const { result, elapsed } = await runFn(fn, example.contents);

    if(example.expected) {
      if(result === example.expected) {
        log.info(`✅ The results match! Both say: ${result}`);
      } else {
        log.info(`❌ The results do not match. Expected ${example.expected} but got ${result}`);
      }
    } else {
      log.info(`🎱 The result is: ${result}`);
    }

    if(options.timer) {
      log.info(`🏁 ${prettyMilliseconds(elapsed, {formatSubMilliseconds: true})}`);
    }
    log.info('');
  }

  // Run the real input
  if(files.real) {
    log.info(`🧮 Calculating for real` + (options.input.file ? ` with ${options.input.file}` : '') + '...');
    const { result, elapsed } = await runFn(fn, files.real);

    log.info(`⭐️ The result is: ${result}`);
    if(options.timer) {
      log.info(`🏁 ${prettyMilliseconds(elapsed, {formatSubMilliseconds: true})}`);
    }
    log.info('');
  }
}

async function runFn(fn, input) {
  console.group();
  const end = timeSpan();
  const result = await fn(input);
  const elapsed = end();
  console.groupEnd();

  return {
    result,
    elapsed
  };
}

async function create(year, day) {
  log.info(`Creating a puzzle scaffold for ${year}/${day}...`);

  // Determine if the desired puzzle does in fact exist
  const puzzleDir = path.join(__dirname, `puzzles/${year}/${day}`);
  log.debug(`Checking if ${puzzleDir} exists...`);
  try {
    await fs.access(puzzleDir);

    // if we're here, the directory exists, so warn and bail
    log.warn(`The puzzle directory for ${year}/${day} (${puzzleDir}) already exists! Nothing left to do.`);
    return;
  } catch(e) {
    // keep going to create the directory
  }

  // Create the new puzzle directory
  log.debug(`Creating ${puzzleDir}...`);
  await makeDir(puzzleDir);

  const skelDir = path.join(__dirname, 'skel');
  log.debug(`Cloning the skeleton directory from ${skelDir} into ${puzzleDir}...`);
  const skelFiles = await fs.opendir(skelDir);
  for await(let file of skelFiles) {
    if(file.isFile()) {
      log.debug(`  - copying ${file.name}`);
      await fs.copyFile(path.join(skelDir, file.name), path.join(puzzleDir, file.name));
    }
  }
  log.debug('Cloning complete.');
}

function validatePuzzleAddress(year, day, part = null) {
  if(!/\d{4}/.test(year.toString(10))) {
    throw new Error(`YEAR must be a 4-digit number (YEAR was: ${year})`);
  }

  if(!/\d{1,2}/.test(day.toString(10))) {
    throw new Error(`DAY must be a 1- or 2-digit number (DAY was: ${day})`);
  }

  if(part !== null && !/\d{1}/.test(part.toString(10))) {
    throw new Error(`PART must be a 1-digit number (PART was: ${part})`);
  }
}

function help() {
  const HELP_TEXT = `
Advent of Code Puzzle Runner

  node ./index.js [options] <YEAR> <DAY> <PART>
  node ./index.js --new <YEAR> <DAY>
  node ./index.js --help

  Running with --new will create and pre-populate the given puzzle directory if
  it does not already exist. Running with --help will display this help text.
  Otherwise, this will attempt to run the puzzle from year YEAR, day DAY,
  part PART.

OPTIONS:
  (TK)
  `;

  return HELP_TEXT.trim() + '\n';
}
