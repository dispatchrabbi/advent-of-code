import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { arr2coords, coords2str, str2coords } from '#utils/grid';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const jetPattern = parseInput(input);
  const rockOrder = [ ROCK_SHAPES.DASH, ROCK_SHAPES.CROSS, ROCK_SHAPES.CORNER, ROCK_SHAPES.PIPE, ROCK_SHAPES.SQUARE ];
  const rockLimit = 2022;

  const rocks = simulateRocksFalling(jetPattern, rockOrder, rockLimit);
  const height = getTallestPoint(rocks).y;

  return height;
}

async function* part2(input, options = {}) {
  const jetPattern = parseInput(input);
  const rockOrder = [ ROCK_SHAPES.DASH, ROCK_SHAPES.CROSS, ROCK_SHAPES.CORNER, ROCK_SHAPES.PIPE, ROCK_SHAPES.SQUARE ];
  const rockLimit = 1000000000000;

  const height = getTallestPoint(simulateRocksFalling(jetPattern, rockOrder, rockLimit)).y;

  return height;
}

function parseInput(input) {
  return input.trim();
}

const ROCK_SHAPES = {
  DASH: [ [2,0], [3,0], [4,0], [5,0] ].map(arr2coords),
  CROSS: [ [2,1], [3,2], [3,1], [3,0], [4,1] ].map(arr2coords),
  CORNER: [ [2,0], [3,0], [4,2], [4,1], [4,0] ].map(arr2coords),
  PIPE: [ [2,0], [2,1], [2,2], [2,3] ].map(arr2coords),
  SQUARE: [ [2,0], [2,1], [3,0], [3,1] ].map(arr2coords),
};

class SimulationCache {
  constructor() { this.cache = {}; }

  _key(jetIndex, rockIndex) {
    return jetIndex + ':' + rockIndex;
  }

  add(jetIndex, rockIndex, rockNumber, height) {
    const key = this._key(jetIndex, rockIndex);
    if(!this.cache[key]) { this.cache[key] = []; }
    this.cache[key].push({ rockNumber, height });
  }

  getPeriodIfExists(jetIndex, rockIndex, cycles = 3) {
    let hits = this.cache[this._key(jetIndex, rockIndex)];
    if(hits.length < (cycles + 1)) {
      return null;
    } else {
      hits = hits.slice(-(cycles + 1));
    }

    const differences = [];
    for(let i = 1; i < cycles + 1; ++i) {
      differences.push(hits[i].height - hits[i - 1].height);
    }
    if(differences.every(d => d === differences[0])) {
      return {
        offset: hits[0].rockNumber,
        offsetHeight: hits[0].height,
        rockPeriod: hits[1].rockNumber - hits[0].rockNumber,
        heightGain: hits[1].height - hits[0].height,
      };
    } else {
      return null;
    }
  }
}

function simulateRocksFalling(jetPattern, rockOrder, rockLimit) {
  let cache = new SimulationCache();

  let turn = 0;
  let settledRock = [];

  for(let rockNumber = 0; rockNumber < rockLimit; ++rockNumber) {
    settledRock = pruneSettledRock(settledRock);
    const tallestPoint = getTallestPoint(settledRock);
    let fallingRock = getNewFallingRock(rockOrder[rockNumber % rockOrder.length], tallestPoint);

    while(fallingRock) {
      const shifted = shift(fallingRock, DIRECTIONS[jetPattern[turn % jetPattern.length]]);
      if(canMoveTo(shifted, settledRock)) {
        fallingRock = shifted;
      }

      const fallen = shift(fallingRock, DIRECTIONS['v']);
      if(canMoveTo(fallen, settledRock, true)) {
        fallingRock = fallen;
      } else {
        settledRock.push(...fallingRock);
        fallingRock = null;
      }
      ++turn;
    }

    cache.add(turn % jetPattern.length, rockNumber % rockOrder.length, rockNumber, getTallestPoint(settledRock).y);

    // check if a period has been found yet - and if it has, fast-forward
    const PERIOD_CHECK_THRESHOLD = 3;
    const period = cache.getPeriodIfExists(turn % jetPattern.length, rockNumber % rockOrder.length, PERIOD_CHECK_THRESHOLD);
    if(period) {
      const { offset, rockPeriod, heightGain } = period;

      // raise the roof!
      const rocksLeft = rockLimit - offset;
      const periodsToCome = Math.floor(rocksLeft / rockPeriod) - PERIOD_CHECK_THRESHOLD;
      const boostHeight = heightGain * periodsToCome;
      settledRock = shift(settledRock, { x: 0, y: boostHeight });

      const rocksToSkip = periodsToCome * rockPeriod;
      rockNumber += rocksToSkip;
    }
  }

  return settledRock;
}

function formatRockfall(settledRock, fallingRock = []) {
  const settledSet = new Set(settledRock.map(coords2str));
  const fallingSet = new Set(fallingRock.map(coords2str));
  const maxY = getTallestPoint([...settledRock, ...fallingRock]).y;

  const out = ['+-------+'];
  for(let y = Math.max(0, maxY - 40); y <= maxY; ++y) {
    let row = '';
    for(let x = 0; x < 7; ++x) {
      row += settledSet.has(coords2str({x, y})) ? '#' : fallingSet.has(coords2str({x, y})) ? '@' : '.';
    }
    out.push(`${y} |` + row + '|');
  }

  return out.reverse().join('\n');
}

function canMoveTo(fallingRock, settledRock) {
  return fallingRock.every(({x, y}) => (x >= 0 && x < 7 && y > 0 && !isThereARockAt(settledRock, {x, y})));
}

function isThereARockAt(rocks, {x, y}) {
  return rocks.some(rock => rock.x === x && rock.y === y);
}

function getTallestPoint(rocks) {
  return rocks.reduce((max, rock) => rock.y > max.y ? rock : max, { x: 0, y: 0 });
}

function pruneSettledRock(settledRock, threshold = 40) {
  const floor = Math.max(0, getTallestPoint(settledRock).y - threshold);
  return settledRock.filter(rock => rock.y >= floor);
}

function getNewFallingRock(shape, tallestPoint) {
  return shape.map(({x, y}) => ({ x, y: y + tallestPoint.y + 4 }));
}

const DIRECTIONS = {
  'v': { x: 0, y: -1 },
  '<': { x: -1, y: 0 },
  '>': { x: 1, y: 0 },
};
function shift(rock, direction) {
  return rock.map(({x, y}) => ({x: x + direction.x, y: y + direction.y}));
}

export default { part1, part2 };
