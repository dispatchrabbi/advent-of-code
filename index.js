import path from 'path';
import fs from 'fs/promises';

import log from 'loglevel';
import commander from 'commander';
import chalk from 'chalk';

import makeDir from 'make-dir';

import { LiveArea, LiveContainer } from 'clui-live';
import timeSpan from 'time-span';
import prettyMilliseconds from 'pretty-ms';

import configurePuzzleLogging from './lib/log.js';

const __filename = import.meta.url.replace('file://', '');
const __dirname = path.dirname(__filename);

main().catch(
  e => { console.error(e); process.exit(process.exitCode === 0 ? 1 : process.exitCode); }
);

async function main() {
  const program = new commander.Command();

  const VALID_INPUT_TYPES = ['all', 'real', 'tests'];
  const VALID_LOG_LEVELS = [ 'trace', 'debug', 'info', 'warn', 'error', 'silent' ];
  program
    .command('run', { isDefault: true })
    .description('run a puzzle')
    .option('-i, --inputs <type>', 'designate which input types to use (`all`, `real`, `tests`)', createEnumValidator(VALID_INPUT_TYPES), 'real')
    .option('--all', 'alias for --inputs=all')
    .option('--tests', 'alias for --inputs=tests')
    .option('-f, --file <file>', 'use the given file (relative to puzzle directory) as input (overrides --inputs)')
    .option('--log-level <level>', 'set the logging level (`trace`, `debug`, `info`, `warn`, `error`, `silent`)', createEnumValidator(VALID_LOG_LEVELS), 'warn')
    .option('-d, --debug', 'alias for --log-level=debug (overrides --log-level)')
    .option('-s, --silent', 'alias for --log-level=silent (overrides --log-level')
    .argument('[year]', 'the year of the puzzle to run', createTestValidator(value => value === 'latest' || validateYear(value), 'a four-digit number'), 'latest')
    .argument('[day]', 'the day of the puzzle to run', createTestValidator(value => value === 'latest' || validateDay(value), 'a one- or two-digit number'), 'latest')
    .argument('[part]', 'the part of the puzzle to run', createTestValidator(validatePart, 'a one-digit number'), 1)
    .action(async (year, day, part, options, command) => {
      // set logging within puzzles
      let logLevel = options.logLevel;
      if(options.debug) {
        logLevel = 'debug';
      } else if(options.silent) {
        logLevel = 'silent';
      }
      configurePuzzleLogging(logLevel);

      // figure out inputs
      const inputs = {
        file: null,
        real: false,
        tests: false,
      }

      if(options.tests) {
        options.inputs = 'tests';
      } else if(options.all) {
        options.inputs = 'all';
      }

      if(['real', 'all'].includes(options.inputs)) {
        inputs.real = true;
      }
      if(['tests', 'all'].includes(options.inputs)) {
        inputs.tests = true;
      }
      if(options.file) {
        inputs.file = options.file;
      }

      // fill in year/day/part
      if(year === 'latest') {
        year = await getLatestYear();
      } else {
        year = +year;
      }

      if(day === 'latest') {
        day = await getLatestDay(year);
      } else {
        day = +day;
      }

      part = +part;

      // run the puzzle
      run(year, day, part, { inputs });
    });

  program
    .command('new')
    .description('set up files for a new puzzle')
    .argument('[year]', 'which year the new puzzle is in', createTestValidator(value => value === 'next' || validateYear(value), 'a four-digit number'), 'next')
    .argument('[day]', 'which day the new puzzle is for', createTestValidator(value => value === 'next' || validateDay(value), 'a one- or two-digit number'), 'next')
    .action(async (year, day, options, command) => {
      // fill in year/day/part
      if(year === 'next' && day === 'next') {
        year = await getLatestYear();
        day = await getLatestDay(year);

        day++;
        if(day > 25) {
          year++;
          day = 1;
        }
      } else if(day === 'next') {
        year = +year;
        day = await getLatestDay(year);

        day++;
        if(day > 25) {
          console.warn(`All the days for ${year} are accounted for. Cowardly refusing to create ${year + 1} Day 1 when ${year} was explicitly specified.`);
          process.exitCode = 1;
          return;
        }
      } else if(year === 'next') {
        console.warn(`You want me to create a specific day but in whatever the next year is? That's probably not actually what you want me to do. Please specify the year.`);
        process.exitCode = 1;
        return;
      }

      createPuzzle(year, day);
    });

  program.parse(process.argv);
}

function createEnumValidator(validValues) {
  return function(value) {
    if(!validValues.includes(value)) {
      throw new commander.InvalidArgumentError(`Valid values are: ${validValues.join(', ')}.`);
    }

    return value;
  };
}

function createTestValidator(testFn, optionName, mustBeDescription) {
  return function(value) {
    if(!testFn(value)) {
      throw new commander.InvalidArgumentError(`Must be ${mustBeDescription}.`);
    }

    return value;
  }
}

async function getLatestYear() {
  const entries = await fs.readdir(path.join(__dirname, 'puzzles'));
  const EXCLUDE = [ '2021' ]; // exclude 2021 because it's already done; will disable next year
  const years = entries.filter(name => validateYear(name)).filter(name => !EXCLUDE.includes(name)).map(x => +x);
  return Math.max(...years);
}

async function getLatestDay(year) {
  const entries = await fs.readdir(path.join(__dirname, 'puzzles', year.toString(10)));
  const days = entries.filter(name => validateDay(name)).map(x => +x);
  return Math.max(...days);
}

function validateYear(year) {
  return /^\d{4}$/.test(year.toString(10));
}

function validateDay(day) {
  return /^\d{1,2}$/.test(day.toString(10));
}

function validatePart(part) {
  return /^\d$/.test(part.toString(10));
}

async function run(year, day, part, options = { inputs: { file: null, real: true, tests: false } }) {
  // gather everything we'll need
  const PUZZLE_DIR = path.join(__dirname, `puzzles/${year}/${day}`);
  const fn = await getPuzzleFn(PUZZLE_DIR, part);
  const attempts = await gatherAttempts(PUZZLE_DIR, part, options.inputs);

  console.log(`Running puzzle 📯 ${year} 🌅 ${day} 🧩 ${part}:`);

  // first, run the tests
  for(let attempt of attempts.tests) {
    const updateState = makeUpdateState(attempt.name, true, attempt.expected);
    await runAttempt(fn, attempt, updateState);
  }

  // then run the real thing
  if(attempts.real) {
    const updateState = makeUpdateState(attempts.real.name);
    await runAttempt(fn, attempts.real, updateState);
  }
}

async function getPuzzleFn(puzzleDir, part) {
  const parts = await import(path.join(puzzleDir, 'puzzle.js'));

  const fn = parts.default['part' + part];
  if(typeof fn !== 'function') {
    throw new Error(`Puzzle ${year}/${day} part ${part} is not a function (which probably means it doesn't exist)!`);
  }

  return fn;
}

async function gatherAttempts(puzzleDir, part, inputTypes = { file: null, real: true, tests: false }) {
  const attempts = { real: null, tests: [] };

  if(inputTypes.real || inputTypes.file) {
    const filename = inputTypes.file || 'input.txt';
    const contents = await fs.readFile(path.join(puzzleDir, filename), { encoding: 'utf-8' });

    attempts.real = {
      name: filename,
      input: contents,
      expected: null,
      options: null,
    };
  }

  if(inputTypes.tests) {
    const expected = (await gatherExpectedValues(puzzleDir)).filter(obj => obj.part === part);

    for(let entry of expected) {
      const contents = await fs.readFile(path.join(puzzleDir, entry.file), { encoding: 'utf-8' });
      attempts.tests.push({
        name: entry.file,
        input: contents,
        expected: entry.output === undefined ? null : entry.output,
        options: entry.options === undefined ? null : entry.options,
      });
    }
  }

  return attempts;
}

async function gatherExpectedValues(puzzleDir) {
  let expected = [];

  try {
    const expectedContents = await fs.readFile(path.join(puzzleDir, 'expected.json'), { encoding: 'utf-8' });
    expected = JSON.parse(expectedContents);
  } catch(e) {
    console.warn(`Could not load or parse expected.json (${e.message}). Continuing without it...`);
  }

  return expected;
}

async function runAttempt(fn, attempt, updateState) {
  const updateArea = new LiveArea().hook().pin();
  drawStatusArea(updateArea, updateState);

  const { result, elapsed } = await runFn(fn, attempt.input, attempt.options);

  updateState.result = result;
  updateState.elapsed = elapsed;
  if(attempt.expected !== null) {
    updateState.isPass = result === attempt.expected;
  }
  drawStatusArea(updateArea, updateState);
  updateArea.close();
}

async function runFn(fn, input, options = null) {
  console.group();
  const end = timeSpan();
  const result = await fn(input, options === null ? undefined : options);
  const elapsed = end();
  console.groupEnd();

  return {
    result,
    elapsed
  };
}

function makeUpdateState(name, isTest = false, expected = null) {
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

async function createPuzzle(year, day) {
  const SKELETON_DIR = path.join(__dirname, 'skel');
  const PUZZLE_DIR = path.join(__dirname, 'puzzles', year.toString(), day.toString());

  const container = new LiveContainer().hook();

  // first, determine if the desired puzzle already exists
  const checkArea = container.createLiveArea();
  checkArea.write(`Checking if the puzzle directory for ${year}/${day} (${PUZZLE_DIR}) exists...`);
  try {
    await fs.access(PUZZLE_DIR);
    // if we're still here, the directory exists, so warn and bail
    checkArea.write(`Checking if the puzzle directory for ${year}/${day} (${PUZZLE_DIR}) exists... it does! Nothing left to do.`);
    checkArea.close();
    return;
  } catch(x) {
    // the directory does not exist, so keep going
    checkArea.write(`Checking if the puzzle directory for ${year}/${day} (${PUZZLE_DIR}) exists... nope. Good!`);
    checkArea.close();
  }

  const createArea = container.createLiveArea();
  createArea.write(`Creating ${PUZZLE_DIR}...`);
  await makeDir(PUZZLE_DIR);
  createArea.write(`Creating ${PUZZLE_DIR}... done!`);
  createArea.close();

  const cloneArea = container.createLiveArea();
  cloneArea.write(`Cloning the puzzle skeleton into ${PUZZLE_DIR}...`);
  const skelFiles = await fs.opendir(SKELETON_DIR);
  for await(let file of skelFiles) {
    if(file.isFile()) {
      console.log(`  - ${file.name}`);
      await fs.copyFile(path.join(SKELETON_DIR, file.name), path.join(PUZZLE_DIR, file.name));
    }
  }

  cloneArea.write(`Cloning the puzzle skeleton into ${PUZZLE_DIR}... done!`);
  cloneArea.close();
}
