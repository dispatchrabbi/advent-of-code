import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { sum } from '#utils/maths';
import { deepEquals } from '#utils/obj';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const packetPairs = parseInput(input);

  const sumOfCorrectlySortedPairIndices = packetPairs.reduce((sum, pair, ix) => pairIsCorrectlyOrdered(pair[0], pair[1]) ? sum + ix + 1 : sum, 0);

  return sumOfCorrectlySortedPairIndices;
}

async function* part2(input, options = {}) {
  const packets = parseInput(input).flat();

  const DIVIDER_PACKETS = [ [[2]], [[6]] ];
  const sortedPackets = [...packets, ...DIVIDER_PACKETS].sort(comparePair);

  const decoderKey = sortedPackets.reduce((prod, packet, ix) => DIVIDER_PACKETS.some(div => deepEquals(div, packet)) ? prod * (ix + 1) : prod, 1);
  return decoderKey;
}

function parseInput(input) {
  return input.trim().split('\n\n').map(pair => pair.split('\n').map(line => JSON.parse(line)));
}

function pairIsCorrectlyOrdered(packet1, packet2, ix) {
  const result = comparePair(packet1, packet2);
  return result < 0;
}

function comparePair(a, b, depth = 0) {
  // const padding = ' '.repeat(depth) + '- ';
  // log.debug(`${padding}Compare ${JSON.stringify(a)} vs ${JSON.stringify(b)}`);

  if(a === undefined) {
    // log.debug(`${padding}Left side ran out of items, so inputs are in the right order`);
    return -1;
  } else if(b === undefined) {
    // log.debug(`${padding}Right side ran out of items, so inputs are ${chalk.red('not')} in the right order`);
    return 1;
  }

  if(typeof a !== typeof b) {
    if(typeof a === 'number') {
      a = [ a ];
      // log.debug(`${padding}Mixed types; convert left to ${JSON.stringify(a)} and retry comparison`);
    }
    if(typeof b === 'number') {
      b = [ b ];
      // log.debug(`${padding}Mixed types; convert right to ${JSON.stringify(b)} and retry comparison`);
    }
    return comparePair(a, b, depth + 1);
  }

  if(typeof a === 'number' && typeof b === 'number') {
    if(a < b) {
      // log.debug(`${padding}Left side is smaller, so inputs are in the right order`);
      return -1;
    } else if(a > b) {
      // log.debug(`${padding}Right side is smaller, so inputs are ${chalk.red('not')} in the right order`);
      return 1;
    } else {
      return 0;
    }
  }

  if(Array.isArray(a) && Array.isArray(b)) {
    for(let i = 0; i < Math.max(a.length, b.length); ++i) {
      const result = comparePair(a[i], b[i], depth + 1);
      if(result !== 0) {
        return result;
      }
    }
  }

  return 0;
}

export default { part1, part2 };
