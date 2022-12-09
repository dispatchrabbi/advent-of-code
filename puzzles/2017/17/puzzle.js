import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const stepsForward = parseInput(input);
  const { buffer, lastPosition } = spinlock(stepsForward, 2017);

  return buffer[lastPosition + 1];
}

async function* part2(input, options = {}) {
  const stepsForward = parseInput(input);
  const lastValueAtIndex1 = spinlock2(stepsForward, 50000000);

  return lastValueAtIndex1;
}

function parseInput(input) {
  return +input.trim();
}

function spinlock(stepsForward, rounds) {
  let buffer = [ 0 ];
  let position = 0;
  for(let i = 1; i <= rounds; ++i) {
    position = (position + stepsForward) % buffer.length;
    buffer.splice(position + 1, 0, i);
    position++;
  }

  return {
    buffer,
    lastPosition: position,
  };
}

function spinlock2(stepsForward, rounds) {
  let position = 0;
  let lastValueAtIndex1 = null;
  for(let i = 1; i <= rounds; ++i) {
    position = (position + stepsForward) % i; // the buffer length will always be i
    if(position === 0) {
      lastValueAtIndex1 = i;
    }
    position++;
  }

  return lastValueAtIndex1;
}

export default { part1, part2 };
