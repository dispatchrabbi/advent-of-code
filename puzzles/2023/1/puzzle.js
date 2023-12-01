import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

import { sum } from '#utils/maths';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const parsed = parseInput(input);

  const INTS_REGEX = /\d/g;
  const values = parsed.map(line => {
    const ints = line.match(INTS_REGEX);
    const val = +(ints[0] + ints[ints.length - 1]);

    return val;
  });

  return sum(values);
}

async function* part2(input, options = {}) {
  const parsed = parseInput(input);

  const NUMS_MAP = {
    one: '1',
    two: '2',
    three: '3',
    four: '4',
    five: '5',
    six: '6',
    seven: '7',
    eight: '8',
    nine: '9',
  };
  const NUMS_REGEX = /\d|one|two|three|four|five|six|seven|eight|nine/g;
  const values = parsed.map(line => {
    const ints = [];

    let match = NUMS_REGEX.exec(line);
    while(match) {
      if(NUMS_MAP[match[0]]) {
        NUMS_REGEX.lastIndex -= 1; // need to account for overlapping number strings
      }
      ints.push(NUMS_MAP[match[0]] || match[0]);
      match = NUMS_REGEX.exec(line);
    }

    const val = +(ints[0] + ints[ints.length - 1]);
    log.debug(line, ints, val);

    return val;
  });

  return sum(values);
}

function parseInput(input) {
  return input.trimEnd().split('\n');
}

export default { part1, part2 };
