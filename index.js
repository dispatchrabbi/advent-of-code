#!/usr/bin/env node

import path from 'path';
import fs from 'fs/promises';

import commander from 'commander';

import makeDir from 'make-dir';

import { LiveContainer } from 'clui-live';
import timeSpan from 'time-span';

import {
  processYearDayArgument, processYearDayPartArgument,
  validateYear, validateDay, validatePart, parsePuzzleString
} from '#lib/puzzle-string';

import configurePuzzleLogging from '#lib/log';
import { ConsoleRenderer, AttemptState, AnimationState } from '#lib/puzzle-renderer';
import { isAsyncFunction, isAsyncGeneratorFunction } from '#lib/is-function';
import delay from '#lib/delay';

import { downloadPuzzleInput } from '#lib/aoc-api';

import dotenv from 'dotenv-safe';
dotenv.config({ allowEmptyValues: true });

const __filename = import.meta.url.replace('file://', '');
const __dirname = path.dirname(__filename);

main().catch(
  e => { console.error(e); process.exit(process.exitCode === 0 ? 1 : process.exitCode); }
);

async function main() {
  const program = new commander.Command();

  // new
  program
    .command('new')
    .description('Create a new puzzle folder.')
    .argument(
      '[puzzle]',
      'The puzzle to create a folder for, formatted as `YEAR/DAY`. If omitted, it will create the next puzzle in the current year.',
      processYearDayArgument,
      'latest'
    )
    .action(handleNewSubcommand);

  // run
  program
    .command('run')
    .description('Run a puzzle solution.')
    .argument(
      '<puzzle>',
      'The puzzle to run, formatted as `PART` or `YEAR/DAY/PART`. If omitted, it will run the latest puzzle.',
      processYearDayPartArgument,
      'latest'
    )
    .option('--tests', 'run test cases instead of the real puzzle input')
    .option('--debug', 'enable debug logging within puzzles (implied by --tests)')
    .option('--silent', 'disable debug logging within puzzles')
    .option('--submit', 'submit the answer to adventofcode.com after the puzzle is run (has no effect when used with --tests)')
    .action(handleRunSubcommand);

  // test
  program
    .command('test')
    .description('Run puzzle test cases. Alias for using --tests with the `run` command.')
    .argument(
      '<puzzle>',
      'The puzzle to run, formatted as `PART` or `YEAR/DAY/PART`. If omitted, it will run the latest puzzle.',
      processYearDayPartArgument,
      'latest'
    )
    .option('--silent', 'disable debug logging within puzzles')
    .action(async (puzzle, options, command) => {
      options.tests = true;
      return handleRunSubcommand(puzzle, options, command);
    });

  // submit
  program
    .command('submit')
    .description('Run the puzzle and submit the answer to adventofcode.com. Alias for using --submit with the `run` command.')
    .argument(
      '<puzzle>',
      'The puzzle to run, formatted as `PART` or `YEAR/DAY/PART`. If omitted, it will run the latest puzzle.',
      processYearDayPartArgument,
      'latest'
    )
    .option('--debug', 'enable debug logging within puzzles')
    .action(async (puzzle, options, command) => {
      options.submit = true;
      return handleRunSubcommand(puzzle, options, command);
    });

  program.parse(process.argv);
}

async function handleNewSubcommand(puzzle, options, command) {
  let year = null, day = null;

  if(puzzle === 'latest') {
    year = await getLatestYear();
    day = await getLatestDay(year);

    day += 1; // we want to create the NEXT day after the latest one
    if(!validateDay(day)) {
      console.error(`Cowardly refusing to create ${year}/${day}. Try giving a specific YEAR/DAY.`);
      process.exitCode = 1;
      return;
    }
  } else {
    let parsed = parsePuzzleString(puzzle);
    year = parsed.year;
    day = parsed.day;
  }

  createPuzzle(year, day);
}

async function handleRunSubcommand(puzzle, options, command) {
  const runTests = options.tests;
  const submitAnswer = runTests ? false : options.submit;
  const logLevel = runTests ?
    (options.silent ? 'silent' : 'debug') :
    (options.debug ? 'debug' : 'silent');

  configurePuzzleLogging(logLevel);

  let year = null, day = null, part = null;
  if(puzzle !== 'latest') {
    let parsed = parsePuzzleString(puzzle);
    year = parsed.year;
    day = parsed.day;
    part = parsed.part;
  }

  if(year === null) {
    year = await getLatestYear();
  }
  if(day === null) {
    day = await getLatestDay(year);
  }
  if(part === null) {
    part = 1;
  }

  // run the puzzle
  run(year, day, part, {
    inputs: { real: !runTests, tests: runTests, file: null }, // TODO: remove file
    submit: submitAnswer,
  });
}

async function getLatestYear() {
  const entries = await fs.readdir(path.join(__dirname, 'puzzles'));
  const EXCLUDE = process.env.EXCLUDE_YEARS ? process.env.EXCLUDE_YEARS.split(',') : [];
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

  if(process.env.DOWNLOAD_INPUTS === '1') {
    const downloadArea = container.createLiveArea();
    downloadArea.write(`Downloading input for ${year}/${day}...`);

    try {
      const puzzleInput = await downloadPuzzleInput(year, day);
      await fs.writeFile(path.join(PUZZLE_DIR, 'input.txt'), puzzleInput);
      downloadArea.write(`Downloading input for ${year}/${day}... done!`);
    } catch(err) {
      downloadArea.append(err.message);
    } finally {
      downloadArea.close();
    }
  }
}
