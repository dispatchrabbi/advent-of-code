import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { type Range, normalizeRanges } from '#utils/span';
import { sum } from '#utils/maths';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const {ranges, ingredients} = parseInput(input);

  const normalized = normalizeRanges(ranges);
  const freshIngredients = ingredients.filter(ingredient => normalized.some(range => range[0] <= ingredient && ingredient <= range[1]));

  return freshIngredients.length;
}

async function* part2(input, options = {}) {
  const { ranges } = parseInput(input);
  const normalized = normalizeRanges(ranges);

  const freshIngredientsCount = sum(normalized.map(range => ((range[1] - range[0]) + 1)));

  return freshIngredientsCount;
}

function parseInput(input: string) {
  const [ rangeLines, ingredientLines ] = input.trimEnd().split('\n\n').map(lines => lines.split('\n'));

  const ranges = rangeLines.map(line => line.split('-').map(x => +x)) as Range[];

  const ingredients = ingredientLines.map(x => +x);

  return { ranges, ingredients };
}

export default { part1, part2 };
