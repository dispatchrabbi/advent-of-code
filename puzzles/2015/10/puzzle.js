import chalk from 'chalk';
import loglevel from 'loglevel';
const log = loglevel.getLogger('puzzle');

async function part1(input) {
  let str = parseInput(input);
  for(let i = 0; i < 40; ++i) {
    str = lookAndSay(str);
  }
  return str.length;
}

async function part2(input) {
  let str = parseInput(input);
  for(let i = 0; i < 50; ++i) {
    str = lookAndSay(str);
  }
  return str.length;
}

function parseInput(input) {
  return input.trim();
}

const RUN_REGEX = /1+|2+|3+|4+|5+|6+|7+|8+|9+/g;
function lookAndSay(str) {
  const look = [...str.matchAll(RUN_REGEX)].map(match => match[0]);
  const say = look.map(run => run.length.toString() + run[0]).join('');
  return say;
}

export default { part1, part2 };
