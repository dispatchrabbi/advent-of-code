import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

import { knotHash } from '../common/knothash.js';
import { sum } from '#utils/maths';
import { orthogonal } from '#utils/grid';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const key = parseInput(input);

  const filledSlots = countFilledMemorySlots(key);

  return filledSlots;
}

async function* part2(input, options = {}) {
  const key = parseInput(input);

  const memory = fillMemory(key);
  const regionCount = findRegions(memory);

  return regionCount;
}

function parseInput(input) {
  return input.trim();
}

const ONES = {
  '0': 0, '1': 1, '2': 1, '3': 2, '4': 1, '5': 2, '6': 2, '7': 3,
  '8': 1, '9': 2, 'a': 2, 'b': 3, 'c': 2, 'd': 3, 'e': 3, 'f': 4,
};
function countFilledMemorySlots(key) {
  return Array(128).fill(0)
    .map((_, ix) => knotHash(`${key}-${ix}`))
    .reduce((total, row) => {
      return total + sum(row.split('').map(h => ONES[h]));
    }, 0);
}

function fillMemory(key) {
  return [].concat(...Array(128).fill(0)
    .map((_, ix) => {
      const hash = knotHash(`${key}-${ix}`);
      const row = [].concat(...hash.split('').map(h => nybble2bools(parseInt(h, 16))));
      return row;
    }));
}

function nybble2bools(nybble) {
  const bools = [
    !!(nybble & 0x08),
    !!(nybble & 0x04),
    !!(nybble & 0x02),
    !!(nybble & 0x01),
  ];
  return bools;
}

function findRegions(memory) {
  let regionCount = 0;
  const seen = new Set();

  for(let i = 0; i < 128 * 128; ++i) {
    if(!memory[i]) { continue; }
    if(seen.has(i)) { continue; }

    const regionCells = new Set([i]);
    regionCells.forEach(cell => {
      seen.add(cell);
      orthogonalMemoryCoords(cell).filter(c => memory[c] && !seen.has(c)).forEach(c => regionCells.add(c));
    });

    regionCount++;
  }

  return regionCount;
}

function orthogonalMemoryCoords(loc) {
  return orthogonal({
    x: loc % 128,
    y: Math.floor(loc / 128),
  })
    .filter(({x, y}) => x >= 0 && x < 128 && y >= 0 && y < 128)
    .map(({x, y}) => (y * 128) + x);
}

export default { part1, part2 };
