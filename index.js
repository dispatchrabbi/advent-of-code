import path from 'path';
import fs from 'fs/promises';

import log from 'loglevel';
import parseArgs from 'minimist';
import chalk from 'chalk';

import makeDir from 'make-dir';

import { LiveContainer } from 'clui-live';
import timeSpan from 'time-span';
import prettyMilliseconds from 'pretty-ms';

import configurePuzzleLogging from './lib/log.js';

const __filename = import.meta.url.replace('file://', '');
const __dirname = path.dirname(__filename);

main().catch(
  e => { console.error(e); process.exit(process.exitCode === 0 ? 1 : process.exitCode); }
);

async function main() {
  const argv = parseArgs(process.argv.slice(2), {
    string: ['inputs', 'file'],
    boolean: [
      'help', 'new',
      'silent', 'debug',
      'timer',
    ],
    default: {
      inputs: 'real',
      timer: true,
      logs: 'warn',
    },
  });

  // Display help text?
  if(argv.help) {
    help();
  }

  // Configure the log for logging inside puzzle solutions
  if(argv.silent) {
    argv.logs = 'silent';
  } else if(argv.debug) {
    argv.logs = 'debug';
  }

  const VALID_LOG_LEVELS = [ 'trace', 'debug', 'info', 'warn', 'error', 'silent' ];
  if(!VALID_LOG_LEVELS.includes(argv.logs)) {
    process.exitCode = 1;
    throw new Error(`Invalid log level '${argv.logs}' given. Options are: ${VALID_LOG_LEVELS.join(',')}`);
  }
  configurePuzzleLogging(argv.logs);


  // Validate puzzle address inputs
  const [ year, day, part ] = argv._;
  validatePuzzleAddress(year, day, part, !argv.new);

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
      tests: false,
      file: null,
    },
  };

  if(['real', 'all'].includes(argv.inputs)) {
    options.input.real = true;
  }

  if(['tests', 'all'].includes(argv.inputs)) {
    options.input.tests = true;
  }

  if(argv.file) {
    options.input.file = argv.file;
  }

  // passing --no-timer will set timer to false
  options.timer = argv.timer;

  run(year, day, part, options);
}

async function run(year, day, part, options = { timer: true, input: { file: null, real: true, tests: false }}) {
  const logContainer = new LiveContainer().hook();

  console.log(`Running puzzle 📯 ${year} 🌅 ${day} 🧩 ${part}:`);

  const puzzleDir = path.join(__dirname, `puzzles/${year}/${day}`);

  // Import the puzzle function
  const parts = await import(path.join(puzzleDir, 'puzzle.js'));
  const fn = parts.default['part' + part];
  if(typeof fn !== 'function') {
    throw new Error(`Puzzle ${year}/${day} part ${part} is not a function (which probably means it doesn't exist)!`);
  }

  // Gather the input files and expected outputs
  const files = { real: null, tests: [] };

  if(options.input.real || options.input.file) {
    const realFilename = options.input.file || 'input.txt';
    files.real = await fs.readFile(path.join(puzzleDir, realFilename), { encoding: 'utf-8' });
  }

  if(options.input.tests) {
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

        files.tests.push({
          name: file.name,
          contents,
          expected: expectedEntry === undefined ? null : expectedEntry.output,
        });
      }
    }
  }

  // Run each example input
  for(let example of files.tests) {
    const updateArea = logContainer.createLiveArea().pin();
    const updateState = makeUpdateState(example.name, true, example.expected);
    drawStatusArea(updateArea, updateState);

    const { result, elapsed } = await runFn(fn, example.contents);

    updateState.result = result;
    updateState.elapsed = elapsed;
    updateState.isPass = result === example.expected;
    drawStatusArea(updateArea, updateState);
    updateArea.close();
  }

  // Run the real input
  if(files.real !== null) {
    const updateArea = logContainer.createLiveArea().pin();
    const updateState = makeUpdateState('input.txt', false);
    drawStatusArea(updateArea, updateState);

    const { result, elapsed } = await runFn(fn, files.real);

    updateState.result = result;
    updateState.elapsed = elapsed;
    drawStatusArea(updateArea, updateState);
    updateArea.close();
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

function makeUpdateState(name, isTest, expected = null) {
  return {
    name,
    isTest,
    isPass: null,
    result: null,
    expected,
    elapsed: null
  };
}

function drawStatusArea(area, updateState) {
  let icon = updateState.isTest ? '🧪' : '🧮';
  let color = 'white';
  let message = 'Running...'; // TODO: make this animated
  let time = ''

  if(updateState.elapsed) {
    if(updateState.isTest) {
      if(updateState.isPass === true) {
        icon = '✅';
        color = 'green';
        message = `PASS! The result is: ${chalk.white.bold(updateState.result)}`;
      } else if(updateState.isPass === false) {
        icon = '❌';
        color = 'redBright';
        message = `FAIL. Expected ${chalk.white.bold(updateState.expected)} but got ${chalk.white.bold(updateState.result)}.`;
      } else {
        icon = '🎱';
        color = 'magenta';
        message = `TADA! The result is: ${chalk.white.bold(updateState.result)}`;
      }
    } else {
      icon = '⭐️';
      color = 'blue';
      message = `The result is: ${chalk.white.bold(updateState.result)}`;
    }

    time = ` (${chalk.yellow(prettyMilliseconds(updateState.elapsed, {formatSubMilliseconds: true}))})`;
  }

  area.write(chalk[color](`${icon} ${updateState.name}: ${message}${time}`));
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

function validatePuzzleAddress(year, day, part = null, partRequired = false) {
  if(!/\d{4}/.test(year.toString(10))) {
    throw new Error(`YEAR must be a 4-digit number (YEAR was: ${year})`);
  }

  if(!/\d{1,2}/.test(day.toString(10))) {
    throw new Error(`DAY must be a 1- or 2-digit number (DAY was: ${day})`);
  }

  if(partRequired) {
    if(part === undefined || part === null) {
      throw new Error(`PART is required when running a puzzle. (PART was: ${part})`);
    }

    if(!/\d{1}/.test(part.toString(10))) {
      throw new Error(`PART must be a 1-digit number (PART was: ${part})`);
    }
  }
}

function help(exitCode = 0) {
  const HELP_TEXT = `
${chalk.bold('Advent of Code Puzzle Runner')}

  To run a puzzle:
  ${chalk.bold('node ./index.js [options] <YEAR> <DAY> <PART>')}

  To create a new puzzle template:
  ${chalk.bold('node ./index.js --new <YEAR> <DAY>')}

  To view this help:
  ${chalk.bold('node ./index.js --help')}

${chalk.bold('OPTIONS:')}
  --inputs=<TYPE>   Run the puzzle with the given input types. Options are: ${chalk.yellow('real')}, tests, all.
                    Defaults to '${chalk.yellow('real')}'.
  --file=<FILE>     Run the puzzle using <FILE> as the input. <FILE> is relative to the puzzle directory, so it should
                    probably look like "test.txt" or "input.txt", no other path needed.
  --timer           Display the time the puzzle took to run for each input. ${chalk.yellow('On by default.')}
  --no-timer        Do not display the time the puzzle took to run for each input.
  --logs=<LEVEL>    Set the logging level inside puzzles to <LEVEL>. Options are: trace, debug, info, ${chalk.yellow('warn')}, error,
                    silent. Defaults to '${chalk.yellow('warn')}'.
  --debug           Alias for ${chalk.white('--logs=debug')}.
  --silent          Alias for ${chalk.white('--logs=silent')}.
  `;

  console.log(HELP_TEXT.trim() + '\n');
  process.exit(exitCode);
}
