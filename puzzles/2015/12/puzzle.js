import chalk from 'chalk';
import loglevel from 'loglevel';
const log = loglevel.getLogger('puzzle');

import { maths, obj } from '#utils';

// for funsies, I'm gonna do part 1 the hacky way, with a regex
// instead of the actual parse-and-walk-the-object way
// weirdly, both ways are about the same time to run
async function part1(input) {
  const NUMBER_REGEX = /[-]?\d+/g;
  let runningTotal = 0;
  for(let match of input.matchAll(NUMBER_REGEX)) {
    const term = +match[0];
    runningTotal += term;
  }

  return runningTotal;
}

// this one needs to be done the actual parse-the-object way
async function part2(input) {
  const data = parseInput(input);

  return reduceToSum(data, filterRed);
}

function filterRed(val) {
  return !(obj.isPlainObject(val) && Object.values(val).includes('red'));
}

function parseInput(input) {
  return JSON.parse(input.trim());
}

function reduceToSum(val, filterFn = (val) => true) {
  if(!filterFn(val)) {
    return 0;
  }

  if(typeof val === 'number') {
    return val;
  }

  if(val instanceof Array) {
    return maths.sum(val.map(el => reduceToSum(el, filterFn)));
  }

  if(obj.isPlainObject(val)) {
    return maths.sum(Object.values(val).map(el => reduceToSum(el, filterFn)));
  }

  return 0;
}

export default { part1, part2 };
