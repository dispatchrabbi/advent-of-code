import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const instructions = parseInput(input);
  const code = determineKeypadCode(instructions, NORMAL_KEYPAD, NORMAL_KEYPAD_START);

  return code;
}

async function* part2(input, options = {}) {
  const instructions = parseInput(input);
  const code = determineKeypadCode(instructions, COMMITTEE_KEYPAD, COMMITTEE_KEYPAD_START);

  return code;
}

function parseInput(input) {
  return input.trim().split('\n').map(line => line.split(''));
}

const NORMAL_KEYPAD = [
  [ '1', '2', '3' ],
  [ '4', '5', '6' ],
  [ '7', '8', '9' ],
];
const NORMAL_KEYPAD_START = { x: 1, y: 1 };

const ___ = null; // blank space
const COMMITTEE_KEYPAD = [
  [ ___, ___, '1', ___, ___ ],
  [ ___, '2', '3', '4', ___ ],
  [ '5', '6', '7', '8', '9' ],
  [ ___, 'A', 'B', 'C', ___ ],
  [ ___, ___, 'D', ___, ___ ]
];
const COMMITTEE_KEYPAD_START = { x: 0, y: 2 };

function determineKeypadCode(instructions, keypad = NORMAL_KEYPAD, start = { x: 1, y: 1 }) {
  const DIRECTIONS = {
    'U': { x:  0, y: -1 },
    'D': { x:  0, y:  1 },
    'L': { x: -1, y: -0 },
    'R': { x:  1, y:  0 },
  };


  let code = '';
  for(let instruction of instructions) {
    log.debug(instruction);
    for(let move of instruction) {
      const direction = DIRECTIONS[move];
      const pos = { x: start.x + direction.x, y: start.y + direction.y };
      if(
        pos.x >= 0 && pos.x < keypad[0].length && // cannot move off the keypad
        pos.y >= 0 && pos.y < keypad[0].length && // cannot move off the keypad
        keypad[pos.y][pos.x] !== null // can't move onto a blank space
      ) {
        log.debug({ move, pos });
        start = pos;
      }
    }

    log.debug(keypad[start.y][start.x]);
    code += keypad[start.y][start.x];
  }

  return code;
}

export default { part1, part2 };
