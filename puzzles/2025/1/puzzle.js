import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { mod } from '#utils/maths';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const turns = parseInput(input);

  const DIAL_SIZE = 100;
  let zeroes = 0;
  let dial = 50;
  for(const turn of turns) {
    dial += turn;

    if(mod(dial, DIAL_SIZE) === 0) {
      zeroes += 1;
    }
  }

  return zeroes;
}

async function* part2(input, options = {}) {
  const turns = parseInput(input);

  const DIAL_SIZE = 100;
  let zeroes = 0;
  let dial = 50;

  for(const turn of turns) {
    const startingPoint = dial;
    
    dial = mod(dial + turn, DIAL_SIZE);

    // extra zeroes from going around more than once
    let additionalZeroes = Math.floor(Math.abs(turn) / DIAL_SIZE);
    // starting at zero would always count as crossing unless we ruled it out here
    if(startingPoint !== 0) {
      if(turn < 0 && dial > startingPoint) {
        // turning left, it crossed zero if the dial ended up on a higher number
        additionalZeroes += 1;
      } else if(turn > 0 && dial < startingPoint) {
        // turning right, it crossed zero if the dial ended up on a lower number
        additionalZeroes += 1;
      } else if(dial === 0) {
        additionalZeroes += 1;
      }
    }

    zeroes += additionalZeroes;

    log.debug(`Started at ${startingPoint}. Turned ${turn}. Ended at ${dial}. Crossed ${additionalZeroes} times. Total: ${zeroes}`);
  }

  return zeroes;
}

function parseInput(input) {
  const turns = input.trimEnd().split('\n').map(line => {
    const direction = line.substring(0, 1);
    const distance = parseInt(line.substring(1), 10);

    return direction === 'L' ? -distance : distance;
  });

  return turns;
}

export default { part1, part2 };
