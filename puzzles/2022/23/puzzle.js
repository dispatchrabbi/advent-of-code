import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

import { adjacent } from '#utils/grid';
import { sum } from '#utils/maths';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const elves = parseInput(input);

  const finalElfPositions = checkThatElvesHaveSpreadOut(elves);

  const emptySquares = countEmptySquares(finalElfPositions);

  return emptySquares;
}

async function* part2(input, options = {}) {
  const elves = parseInput(input);

  const roundsUntilStopped = spreadOutElvesUntilTheyStop(elves);

  return roundsUntilStopped;
}

function parseInput(input) {
  const lines = input.trimEnd().split('\n');

  const elves = [];
  for(let y = 0; y < lines.length; ++y) {
    for(let x = 0; x < lines[y].length; ++x) {
      if(lines[y][x] === '#') {
        elves.push({
          position: {x, y},
          proposed: null,
        });
      }
    }
  }

  return elves;
}

// the relevant indexes based on the orthogonal() function
const DIRECTIONS = [
  { name: 'NORTH', indices: [5, 6, 7], step: { x:  0, y: -1 } },
  { name: 'SOUTH', indices: [0, 1, 2], step: { x:  0, y:  1 } },
  { name: 'WEST',  indices: [0, 3, 5], step: { x: -1, y:  0 } },
  { name: 'EAST',  indices: [2, 4, 7], step: { x:  1, y:  0 } },
];

function checkThatElvesHaveSpreadOut(elves, startingDirection = 0) {
  let elvesThatMoved = 0;
  let rounds = 0;

  // log.debug(formatElves(elves));

  do {
    elvesThatMoved = takeAStep(elves, (startingDirection + rounds) % DIRECTIONS.length);
    rounds++;

    // log.debug(`== End of Round ${rounds} ==`);
    // log.debug(formatElves(elves));
  } while(rounds < 10);

  return elves;
}

function spreadOutElvesUntilTheyStop(elves, startingDirection = 0) {
  let elvesThatMoved = Infinity;
  let rounds = 0;

  // log.debug(formatElves(elves));

  do {
    elvesThatMoved = takeAStep(elves, (startingDirection + rounds) % DIRECTIONS.length);
    rounds++;

    // log.debug(`== End of Round ${rounds} ==`);
    // log.debug(formatElves(elves));
  } while(elvesThatMoved > 0);

  return rounds;
}

function takeAStep(elves, primaryDirectionIndex) {
  // get all the current positions
  const currentPositions = elves.reduce((current, elf) => current.set(elf.position, 1), new GridMap());
  const propsedPositions = new GridMap();

  for(let elf of elves) {
    // get all the spots around
    const adjacentElfCount = adjacent(elf.position).map(pos => currentPositions.get(pos) || 0);

    // if there's no one around, stay put
    if(sum(adjacentElfCount) === 0) {
      continue;
    }

    // otherwise, start checking each direction
    for(let directionOffset = 0; directionOffset < DIRECTIONS.length; ++directionOffset) {
      const direction = DIRECTIONS[(primaryDirectionIndex + directionOffset) % DIRECTIONS.length];
      const relevantIndices = direction.indices;
      const directionalElfCount = relevantIndices.reduce((total, index) => total + adjacentElfCount[index], 0);

      // when you find one that works, propose that step
      if(directionalElfCount === 0) {
        elf.proposed = { x: elf.position.x + direction.step.x, y: elf.position.y + direction.step.y };
        propsedPositions.increment(elf.proposed);
        break;
      }
    }
  }

  // wish I didn't have to do two loops, but I can't think of a clever way to optimize it away
  for(let elf of elves) {
    if(elf.proposed !== null) {
      // check if any other elf has proposed moving there
      if(propsedPositions.get(elf.proposed) === 1) {
        // if so, go!
        elf.position = elf.proposed;
      }

      elf.proposed = null;
    }
  }

  // return the number of elves that moved
  const elvesThatMoved = propsedPositions.values().filter(n => n === 1).length;
  return elvesThatMoved;
}

function countEmptySquares(elves) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  for(let elf of elves) {
    if(elf.position.x < minX) { minX = elf.position.x; }
    if(elf.position.x > maxX) { maxX = elf.position.x; }
    if(elf.position.y < minY) { minY = elf.position.y; }
    if(elf.position.y > maxY) { maxY = elf.position.y; }
  }

  const xRange = maxX - minX + 1;
  const yRange = maxY - minY + 1;

  const emptySquares = (xRange * yRange) - elves.length;
  return emptySquares;
}

function formatElves(elves) {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  const positions = new GridMap();

  for(let elf of elves) {
    if(elf.position.x < minX) { minX = elf.position.x; }
    if(elf.position.x > maxX) { maxX = elf.position.x; }
    if(elf.position.y < minY) { minY = elf.position.y; }
    if(elf.position.y > maxY) { maxY = elf.position.y; }

    positions.increment(elf.position);
  }

  let out = '\n';
  for(let y = minY; y <= maxY; ++y) {
    for(let x = minX; x <= maxX; ++x) {
      out += positions.has({x, y}) ? '#' : '.';
    }
    out += '\n';
  }

  return out;
}

class GridMap {
  constructor() {
    this._arr = [];
  }

  set({x, y}, val) {
    if(!this._arr[x]) {
      this._arr[x] = [];
    }

    this._arr[x][y] = val;

    return this;
  }

  get({x, y}) {
    return this._arr[x] && this._arr[x][y];
  }

  has({x, y}) {
    return !!this.get({x, y});
  }

  increment({x, y}) {
    if(!this.has({x, y})) {
      this.set({x, y}, 0);
    }

    this._arr[x][y]++;
    return this;
  }

  keys() {
    return this._arr.flatMap((subarr, x) => subarr.map((_, y) => ({ x, y })));
  }

  values() {
    return this._arr.flatMap(el => el);
  }

  entries() {
    return this._arr.flatMap((subarr, x) => subarr.map((val, y) => ([ { x, y }, val ])));
  }
}


export default { part1, part2 };
