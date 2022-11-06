import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const banks = parseInput(input);
  const loopStats = findRebalancingLoop(banks);

  return loopStats.steps;
}

async function* part2(input, options = {}) {
  const banks = parseInput(input);
  const loopStats = findRebalancingLoop(banks);

  return loopStats.loopSize;
}

function parseInput(input) {
  return input.trim().split('\t').map(x => +x);
}

function findRebalancingLoop(banks) {
  function formatBanks(banks) {
    return banks.join('\t');
  }

  const seen = new Map();
  let steps = 0;

  while(!seen.has(formatBanks(banks))) {
    seen.set(formatBanks(banks), steps);
    banks = rebalance(banks);
    steps++;
  }

  return { steps, loopSize: steps - seen.get(formatBanks(banks))};
}

function rebalance(banks) {
  // find the bank with the most blocks
  let fullestBank = banks.reduce((winner, challengerBlocks, challenger) => challengerBlocks > banks[winner] ? challenger : winner, 0);

  // there's likely a smarter way to figure out how many blocks go in each bank
  // but that's premature optimization for now, so let's do it the naive way
  let blocksToDistribute = banks[fullestBank];
  banks[fullestBank] = 0;
  let nextBank = fullestBank;
  while(blocksToDistribute > 0) {
    nextBank = (nextBank + 1) % banks.length;
    banks[nextBank] += 1;
    blocksToDistribute -= 1;
  }

  return banks;
}

export default { part1, part2 };
