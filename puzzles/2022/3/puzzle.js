import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

const log = loglevel.getLogger('puzzle');

import { intersect } from "#utils/arr";
import { sum } from '#utils/maths';

async function* part1(input, options = {}) {
  const rucksacks = parseInput(input);

  const totalPriorityOfCommonItems = sum(rucksacks.map(findCommonItem).map(getItemPriority));

  return totalPriorityOfCommonItems;
}

async function* part2(input, options = {}) {
  const rucksacks = parseInput(input);

  const badges = [];
  for(let i = 0; i < rucksacks.length; i += 3) {
    badges.push(findBadge([rucksacks[i], rucksacks[i + 1], rucksacks[i + 2]]));
  }

  const totalPriorityOfBadges = sum(badges.map(getItemPriority));
  return totalPriorityOfBadges;
}

function parseInput(input) {
  return input.trim().split('\n').map(line => line.split(''));
}

function findCommonItem(rucksack) {
  return intersect(
    rucksack.slice(0, rucksack.length / 2),
    rucksack.slice(rucksack.length / 2)
  )[0];
}

function findBadge(group) {
  return intersect(intersect(group[0], group[1]), group[2])[0];
}

const UPPERCASE_A_CHAR_CODE = 65;
const LOWERCASE_A_CHAR_CODE = 97;
function getItemPriority(item) {
  const itemCharCode = item.charCodeAt(0);
  if(itemCharCode >= LOWERCASE_A_CHAR_CODE) {
    return itemCharCode - LOWERCASE_A_CHAR_CODE + 1;
  } else {
    return itemCharCode - UPPERCASE_A_CHAR_CODE + 27;
  }
}

export default { part1, part2 };
