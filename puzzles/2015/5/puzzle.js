import chalk from 'chalk';
import loglevel from 'loglevel';
const log = loglevel.getLogger('puzzle');

async function part1(input) {
  const strings = parseInput(input);

  return strings.filter(str => isNice(str)).length;
}

async function part2(input) {
  const strings = parseInput(input);

  return strings.filter(str => isNice2(str)).length;
}

function parseInput(input) {
  return input.trim().split('\n');
}

const HAS_THREE_VOWELS = /[aeiou].*[aeiou].*[aeiou]/;
const HAS_DOUBLE_LETTER = /(.)\1/;
const INCLUDES_FORBIDDEN_STRING = /ab|cd|pq|xy/;
function isNice(str) {
  const hasThreeVowels = HAS_THREE_VOWELS.test(str);
  const hasDoubleLetter = HAS_DOUBLE_LETTER.test(str);
  const includesForbiddenString = INCLUDES_FORBIDDEN_STRING.test(str);

  return hasThreeVowels && hasDoubleLetter && !includesForbiddenString;
}

const HAS_REPEATED_TWO_STRING = /(..).*\1/;
const HAS_LETTER_SANDWICH = /(.).\1/;
function isNice2(str) {
  return HAS_REPEATED_TWO_STRING.test(str) && HAS_LETTER_SANDWICH.test(str);
}

export default { part1, part2 };
