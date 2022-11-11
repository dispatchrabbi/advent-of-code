import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

import { sum } from '#utils/maths';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = { multiline: false }) {
  const streams = parseInput(input);
  const scores = streams.map(stream => sum(parseStream(stream).groupScores));

  return options.multiline ? scores : scores[0];
}

async function* part2(input, options = {}) {
  const streams = parseInput(input);
  const removed = streams.map(stream => parseStream(stream).garbageRemoved);

  return options.multiline ? removed : removed[0];
}

function parseInput(input) {
  return input.trim().split('\n');
}

function parseStream(stream) {
  const state = {
    garbage: false,
    depth: 0,
  };

  const groupScores = [];
  let garbageRemoved = 0;

  for(let i = 0; i < stream.length; ++i) {
    switch(stream[i]) {
      case '<':
        if(state.garbage) {
          garbageRemoved++;
          break;
        }
        state.garbage = true;
        break;
      case '!':
        if(state.garbage) {
          i += 1; // ignore the next character, whatever it is
        }
        break;
      case '>':
        if(state.garbage) {
          state.garbage = false;
        }
        break;
      case '{':
        if(state.garbage) {
          garbageRemoved++;
          break;
        }

        state.depth += 1;
        break;
      case '}':
        if(state.garbage) {
          garbageRemoved++;
          break;
        }

        groupScores.push(state.depth); // record that we had a group
        state.depth -= 1;
        if(state.depth < 0) {
          throw new Error(`Unmatched } at position ${i}`);
        }
        break;
      default:
        if(state.garbage) {
          garbageRemoved++;
          break;
        }
        // do nothing, on to the next character
        break;
    }
  }

  if(state.depth > 0) {
    throw new Error(`Unmatched { to depth ${state.depth}`);
  }

  return { groupScores, garbageRemoved };
}

export default { part1, part2 };
