import path from 'path';
import fs from 'fs/promises';

import log from 'loglevel';
import parseArgs from 'minimist';

import makeDir from 'make-dir';

const __filename = import.meta.url.replace('file://', '');
const __dirname = path.dirname(__filename);

main().catch(
  e => { log.error(e); process.exit(process.exitCode === 0 ? 1 : process.exitCode); }
);

async function main() {
  log.setDefaultLevel('info');

  const argv = parseArgs(process.argv.slice(2), {
    string: ['input', 'log-level'],
    boolean: [
      'help', 'new',
      'silent', 'debug',
      'use-input-only', 'use-examples-only', 'use-input-and-examples',
      'timer', 'no-timer',
    ],
    default: { 'log-level': 'info' },
  });

  // Display help text?
  if(argv.help) {
    log.info(help());
    return;
  }

  // Set the log level
  const VALID_LOG_LEVELS = [ 'trace', 'debug', 'info', 'warn', 'error', 'silent' ];
  if(argv['silent']) {
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
      real: true,
      examples: false,
      file: null,
    },
  };

  if(argv['no-timer']) {
    options.timer = false;
  } else if(argv['timer']) {
    options.timer = true;
  }

  if(argv.input) {
    options.input = {
      file: argv.input,
      real: false,
      examples: false,
    };
  } else if(argv['use-input-and-examples']) {
    options.input = {
      file: null,
      real: true,
      examples: true,
    };
  } else if(argv['use-input-only']) {
    options.input = {
      file: null,
      real: true,
      examples: false,
    };
  } else if(argv['use-examples-only']) {
    options.input = {
      file: null,
      real: false,
      examples: true,
    };
  }

  run(year, day, part, options);
}

async function run(year, day, part, options) {
  // Determine if the desired puzzle does in fact exist


  // Gather the input files and expected outputs

  // Run each example input

  // Run the real input
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
