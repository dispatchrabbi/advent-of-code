import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { transpose } from '#utils/arr';

const log = loglevel.getLogger('puzzle');

const STARTING_PATTERN = '.#./..#/###';

async function* part1(input, options = { rounds: 5 }) {
  const rules = parseInput(input);
  const rulebook = makeRulebook(rules);

  let img = str2img(STARTING_PATTERN);
  for(let round = 0; round < options.rounds; ++round) {
    img = enhance(img, rulebook);
    yield frame('', `${countLitPixels(img)} pixels lit`);
  }

  const litPixels = countLitPixels(img);
  return litPixels;
}

async function* part2(input, options = { rounds: 18 }) {
  const rules = parseInput(input);
  const rulebook = makeRulebook(rules);

  let img = str2img(STARTING_PATTERN);
  for(let round = 0; round < options.rounds; ++round) {
    // heck yeah brute force!
    img = enhance(img, rulebook);
    yield frame('', `${countLitPixels(img)} pixels lit`);
  }

  const litPixels = img.flat().filter(pixel => pixel).length;
  return litPixels;
}

function parseInput(input) {
  return input.trim().split('\n').map(pattern => pattern.split(' => ')).map(([before, after]) => ({ before, after }));
}

function str2img(str) {
  return str.split('/').map(line => line.split('').map(char => char === '#'));
}

function img2str(img) {
  return img.map(row => row.map(pixel => pixel ? '#' : '.').join('')).join('/');
}

function makeRulebook(rules) {
  const rulebook = new Map();
  for(let rule of rules) {
    const orientations = getAllOrientations(str2img(rule.before));
    for(let orientation of orientations) {
      rulebook.set(img2str(orientation), rule.after);
    }
  }

  return rulebook;
}

function countLitPixels(imgOrStr) {
  if(typeof imgOrStr === 'string') {
    return str.split('').filter(c => c === '#').length;
  } else {
    return imgOrStr.flat().filter(pixel => pixel).length
  }
}

function getAllOrientations(pattern) {
  // normal
  // A B  C D  B A  D C
  // C D  A B  D C  B A

  // transposed
  // A C  B D  C A  D B
  // B D  A C  D B  C A

  const orientations = [ pattern, transpose(pattern) ].map(grid => {
    return [
      grid, // AB/CD
      grid.slice().reverse(), // CD/AB
      grid.map(row => row.slice().reverse()), // BA/DC
      grid.map(row => row.slice().reverse()).reverse() ,// DC/BA
    ]
  }).flat();

  return orientations;
}

function enhance(img, rulebook) {
  const squares = divideIntoSquares(img, img.length % 2 === 0 ? 2 : 3);
  const enhancedSquares = squares.map(square => str2img(rulebook.get(img2str(square))));
  const knitted = knitSquaresTogether(enhancedSquares);
  return knitted;
}

function divideIntoSquares(img, size) {
  if(img.length % size !== 0) {
    throw new Error(`Image side length ${img.length} is not divisible by given size ${size}`);
  }

  const squares = [];
  for(let y = 0; y < img.length; y += size) {
    for(let x = 0; x < img[y].length; x += size) {
      squares.push(img.slice(y, y + size).map(row => row.slice(x, x + size)));
    }
  }

  return squares;
}

function knitSquaresTogether(squares) {
  const knitted = [];

  const rowLengthInSquares = Math.sqrt(squares.length);
  for(let i = 0; i < squares.length; i += rowLengthInSquares) {
    const rowOfSquares = squares.slice(i, i + rowLengthInSquares);
    for(let rowIx = 0; rowIx < rowOfSquares[0].length; ++rowIx) {
      knitted.push(rowOfSquares.map(sq => sq[rowIx]).flat());
    }
  }

  return knitted;
}

function renderImage(img) {
  return img.map(row => row.map(pixel => pixel ? chalk.yellow('#') : chalk.gray('.')).join('')).join('\n');
}

export default { part1, part2 };
