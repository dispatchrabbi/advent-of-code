import path from 'path';
import fs from 'fs/promises';

import commander from 'commander';

import makeDir from 'make-dir';

import { LiveContainer } from 'clui-live';
import timeSpan from 'time-span';

import configurePuzzleLogging from '#lib/log';
import { ConsoleRenderer, AttemptState, AnimationState } from '#lib/puzzle-renderer';
import { isFunction, isAsyncFunction, isAsyncGeneratorFunction } from '#lib/is-function';
import delay from '#lib/delay';

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
    .argument('[puzzle]', 'which puzzle to run, formatted [YEAR-DAY-]PART (defaults to the latest, part 1)', createTestValidator(validatePuzzleAddress, 'a puzzle formatted [YEAR-DAY-]PART'), 1)
    .action(async (puzzle, options, command) => {
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
      let { year, day, part } = decodePuzzleAddress(puzzle);
      if(year === null) {
        year = await getLatestYear();
      }

      if(day === null) {
        day = await getLatestDay(year);
      }

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

function createTestValidator(testFn, mustBeDescription) {
  return function(value) {
    if(!testFn(value)) {
      throw new commander.InvalidArgumentError(`Must be ${mustBeDescription}.`);
    }

    return value;
  }
}

async function getLatestYear() {
  const entries = await fs.readdir(path.join(__dirname, 'puzzles'));
  const EXCLUDE = [ /* '2022' */ ]; // exclude the latest year when working on older puzzles
  const years = entries.filter(name => validateYear(name)).filter(name => !EXCLUDE.includes(name)).map(x => +x);
  return Math.max(...years);
}

async function getLatestDay(year) {
  try {
    const entries = await fs.readdir(path.join(__dirname, 'puzzles', year.toString(10)));
    const days = entries.filter(name => validateDay(name)).map(x => +x);
    return Math.max(...days);
  } catch (ex) {
    // we're here if the year directory doesn't exist yet
    return 0;
  }
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

function validatePuzzleAddress(addressStr) {
  const address = decodePuzzleAddress(addressStr);
  if(!address) {
    return false;
  }

  const isYearValid = address.year === null || validateYear(address.year);
  const isDayValid = address.day === null || validateDay(address.day);
  const isPartValid = validatePart(address.part);

  return isYearValid && isDayValid && isPartValid;
}

function decodePuzzleAddress(addressStr) {
  const decoded = { year: null, day: null, part: null };

  const matches = /^(?:(\d{4})-(\d{1,2})-)?(\d)$/.exec(addressStr);
  if(!matches) {
    return null;
  }

  const [ year, day, part ] = [ matches[1], matches[2], matches[3] ];
  decoded.year = year ? +year : null;
  decoded.day = day ? +day : null;
  decoded.part = +part;

  return decoded;
}

async function run(year, day, part, options = { inputs: { file: null, real: true, tests: false } }) {
  // gather everything we'll need
  const PUZZLE_DIR = path.join(__dirname, `puzzles/${year}/${day}`);
  const fn = await getPuzzleFn(PUZZLE_DIR, part);
  const attempts = await gatherAttempts(PUZZLE_DIR, part, options.inputs);

  console.log(`Running puzzle 📯 ${year} 🌅 ${day} 🧩 ${part}:`);

  // first, run the tests
  for(let attempt of attempts.tests) {
    await runAttempt(fn, attempt);
  }

  // then run the real thing
  if(attempts.real) {
    await runAttempt(fn, attempts.real);
  }
}

async function getPuzzleFn(puzzleDir, part) {
  const parts = await import(path.join(puzzleDir, 'puzzle.js'));

  const fn = parts.default['part' + part];
  if(!isAsyncFunction(fn) && !isAsyncGeneratorFunction(fn)) {
    throw new Error(`Puzzle ${year}/${day} part ${part} is not an async function or an async generator function! (This may mean it doesn't exist or isn't getting exported.)`);
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
      isTest: false,
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
        isTest: true,
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

async function runAttempt(fn, attempt) {
  const attemptState = new AttemptState(attempt.name, attempt.isTest, attempt.expected);
  const statusRenderer = new ConsoleRenderer(attemptState);
  statusRenderer.open(true);
  statusRenderer.render();

  let result, elapsed;
  if(isAsyncGeneratorFunction(fn)) {
    ({ result, elapsed } = await runGeneratorFn(fn, attempt, statusRenderer));
  } else if(isAsyncFunction(fn)) {
    ({ result, elapsed } = await runAsyncFn(fn, attempt));
  } else {
    throw new Error('Unknown puzzle function type! Use an async function or an async generator function.');
  }

  attemptState.finish(result, elapsed);
  statusRenderer.render();
  statusRenderer.close();
}

async function runAsyncFn(fn, attempt) {
  const end = timeSpan();
  const result = await fn(attempt.input, attempt.options || undefined);
  const elapsed = end();

  return {
    result,
    elapsed
  };
}

const UPDATE_DELAY_MS = 100;
async function runGeneratorFn(fn, attempt, statusRenderer) {
  const animationState = new AnimationState();
  const animationRenderer = new ConsoleRenderer(animationState);
  animationRenderer.open();

  const end = timeSpan();

  const generator = fn(attempt.input, attempt.options || undefined);
  let next, result;
  while(next = await generator.next()) {
    if(next.done) {
      result = next.value;
      break;
    }

    const { frame, msg } = next.value;

    animationRenderer.update(frame);
    statusRenderer.update(msg);

    await delay(UPDATE_DELAY_MS);
  }

  const elapsed = end();

  animationRenderer.close();

  return { result, elapsed };
}

async function createPuzzle(year, day) {
  const SKELETON_DIR = path.join(__dirname, 'skel');
  const YEAR_DIR = path.join(__dirname, 'puzzles', year.toString(), day.toString());
  const PUZZLE_DIR = path.join(__dirname, 'puzzles', year.toString(), day.toString());

  const container = new LiveContainer().hook();

  // first, determine if the desired puzzle already exists
  const checkArea = container.createLiveArea();
  checkArea.write(`Checking if the puzzle directory for ${year}/${day} (${PUZZLE_DIR}) exists...`);
  try {
    await fs.access(YEAR_DIR);
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
