import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

import { knotHash, knotHashRound } from '../common/knothash';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = { listLength: 256 }) {
  const swaps = parseInput(input).split(',').map(x => +x);

  let list = Array(options.listLength).fill(0).map((el, ix) => ix);
  list = knotHashRound(swaps, list).list;

  return list[0] * list[1];
}

async function* part2(input, options = {}) {
  const parsed = parseInput(input);

  const hashed = knotHash(parsed);

  return hashed;
}

function parseInput(input) {
  return input.trim();
}

export default { part1, part2 };
