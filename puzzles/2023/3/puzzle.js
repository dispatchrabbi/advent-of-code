import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

import { product, sum } from '#utils/maths';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const { symbols, numbers } = parseInput(input);

  const partNumbers = numbers.filter(num => {
    // is there a symbol that's adjacent to this number?
    return symbols.some(sym => isAdjacent(sym, num));
  });

  return sum(partNumbers.map(n => n.value));
}

async function* part2(input, options = {}) {
  const parsed = parseInput(input);

  const { symbols, numbers } = parseInput(input);

  const gearRatios = symbols
    .filter(s => s.value === '*')
    .map(gear => {
      const adjacentNumbers = numbers.filter(num => isAdjacent(gear, num));
      if(adjacentNumbers.length === 2) {
        return product(adjacentNumbers.map(n => n.value));
      } else {
        return 0; // 0 entries won't affect the sum we're about to do
      }
    });

  return sum(gearRatios);
}

function parseInput(input) {
  const NUMBER_REGEX = /\d+/g;
  const SYMBOL_REGEX = /[^0-9a-z.]/ig;
  return input.trimEnd().split('\n').reduce((obj, line, ix) => {
    // pull out symbols
    for(let symbolMatch of line.matchAll(SYMBOL_REGEX)) {
      obj.symbols.push({
        value: symbolMatch[0],
        x: symbolMatch.index,
        y: ix,
      });
    }

    // pull out ints
    for(let numberMatch of line.matchAll(NUMBER_REGEX)) {
      obj.numbers.push({
        value: +numberMatch[0],
        xMin: numberMatch.index,
        xMax: numberMatch.index + numberMatch[0].length - 1,
        y: ix,
      });
    }

    return obj;
  }, { symbols: [], numbers: [] });
}

function isAdjacent(symbol, number) {
  return (
    Math.abs(number.y - symbol.y) <= 1 &&
    symbol.x >= (number.xMin - 1) &&
    symbol.x <= (number.xMax + 1)
  );
}

export default { part1, part2 };
