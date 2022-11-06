import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

import { adjacent } from '#utils/grid';
import { sum } from '#utils/maths';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const position = parseInput(input);
  const coords = ulam2coords(position);

  return Math.abs(coords.x) + Math.abs(coords.y);
}

async function* part2(input, options = {}) {
  const parsed = parseInput(input);

  const fillMemoryGenerator = fillMemory();
  let cell;
  do {
    cell = fillMemoryGenerator.next().value;
  } while(cell.value <= parsed);

  return cell.value;
}

function parseInput(input) {
  return +input.trim();
}

function ulam2coords(index) {
  // with thanks to Kevin Ryde (https://oeis.org/A174344, https://oeis.org/A274923)
  // x-coord: a(n) = n--; my(m=sqrtint(n), k=ceil(m/2)); n -= 4*k^2; if(n<0, if(n<-m, k, -k-n), if(n<m, -k, n-3*k));
  // y-coord: a(n) = n--; my(m=sqrtint(n), k=ceil(m/2)); n -= 4*k^2; if(n<0, if(n<-m, 3*k+n, k), if(n<m, k-n, -k));

  if(index < 1) { throw new Error(`index must be 1 or greater (index was: ${index}).`); }

  const m = Math.floor(Math.sqrt(index - 1));
  const k = Math.ceil(m / 2);
  const n = (index - 1) - 4 * (k ** 2);

  let x, y;
  if(n < 0) {
    if(n < -m) {
      x = k;
      y = (3 * k) + n;
    } else {
      x = -k - n;
      y = k;
    }
  } else {
    if(n < m) {
      x = -k;
      y = k - n;
    } else {
      x = n - (3 * k);
      y = -k;
    }
  }

  return { x, y };
}

function coords2ulam({x, y}) {
  const layer = Math.max(Math.abs(x), Math.abs(y)); // the center is layer 0
  const sideLength = layer * 2;

  if(layer === 0) {
    return 1;
  }

  let side, offset;
  if(y > -layer && x === layer) { // right
    side = 0;
    offset = y + layer - 1;
  } else if(x < layer && y === layer) { // top
    side = 1;
    offset = (-x) + layer - 1;
  } else if(y < layer && x === -layer) { // left
    side = 2;
    offset = (-y) + layer - 1;
  } else if(x > -layer && y === -layer) { // bottom
    side = 3;
    offset = x + layer - 1;
  } else {
    throw new Error(`What side are you even on? point was (${x}, ${y})`);
  }

  const core = (((layer - 1) * 2) + 1) ** 2;
  return core + (side * sideLength) + offset + 1;
}

function* fillMemory() {
  // there is no 0 index in the memory here
  const memory = [ null, 1 ];

  while(true) {
    yield { index: memory.length - 1, value: memory[memory.length - 1] };

    // calculate the next memory spot's value
    const adjacentValues = adjacent(ulam2coords(memory.length))
      .map(coords2ulam)
      .filter(x => x < memory.length)
      .map(x => memory[x]);

    memory.push(sum(adjacentValues));
  }
}

export default { part1, part2 };
