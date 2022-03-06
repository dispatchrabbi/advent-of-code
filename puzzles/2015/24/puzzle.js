import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { sum, product } from '#utils/maths';
import { deepEquals } from '#utils/obj';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const packages = parseInput(input);
  const passengerPartition = findBestPassengerPartition(packages, 3);

  return qe(passengerPartition);
}

async function* part2(input, options = {}) {
  const packages = parseInput(input);
  const passengerPartition = findBestPassengerPartition(packages, 4);

  return qe(passengerPartition);
}

function parseInput(input) {
  return input.trim().split('\n').map(x => +x);
}

function findBestPassengerPartition(weights, numberOfPartitions) {
  const targetWeight = sum(weights) / numberOfPartitions;

  let firstPartitions = findSubsetsThatSumTo(weights, targetWeight).sort((a, b) => a.length - b.length);
  return firstPartitions
    .filter(p => p.length === firstPartitions[0].length) // prefer small sets over big ones
    .reduce((winner, p) => qe(p) < qe(winner) ? p : winner, firstPartitions[0]); // break ties using QE
}

// it's turtles all the way down, baby!
function findSubsetsThatSumTo(elements, targetSum, depth = 0) {
  // log.debug({elements, targetSum});
  if(elements.length === 1) {
    return elements[0] === targetSum ? [ elements[0] ] : [];
  } else if(elements.length === 0 || targetSum <= 0) {
    return [];
  } else if(sum(elements) < targetSum) {
    return [];
  }

  const subsets = [];
  const sortedElements = elements.sort((a, b) => b - a)
  for(let i = 0; i < sortedElements.length; ++i) {
    const el = sortedElements[i];
    if(el === targetSum) {
      subsets.push(el);
    } else if(el < targetSum) {
      const head = [ el ];
      // log.debug(targetSum, el, sortedElements.slice(i + 1));
      const tails = findSubsetsThatSumTo(sortedElements.slice(i + 1), targetSum - el, depth + 1);
      subsets.push(...tails.map(tail => head.concat(tail)));
    }
  }

  return subsets;
}

// get the quantum entanglement score for an array of packages
function qe(packages) {
  return product(packages);
}

export default { part1, part2 };
