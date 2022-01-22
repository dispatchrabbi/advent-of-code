import chalk from 'chalk';
import loglevel from 'loglevel';
const log = loglevel.getLogger('puzzle');

import { sum } from '#utils/maths';

async function part1(input, options = { liters: 150 }) {
  const containers = parseInput(input);

  const ways = fillContainersExactly(containers, options.liters);

  return ways.length;
}

async function part2(input, options = { liters: 150 }) {
  const containers = parseInput(input);

  const ways = fillContainersExactly(containers, options.liters);

  const minimumContainersUsed = ways.reduce((min, way) => Math.min(min, way.length), Infinity);
  const waysUsingMinimumContainers = ways.filter(way => way.length === minimumContainersUsed);

  return waysUsingMinimumContainers.length;
}

function parseInput(input) {
  return input.trim().split('\n').map(x => +x);
}

function fillContainersExactly(containers, liters) {
  if(containers.length === 0 || sum(containers) < liters) {
    return [];
  }

  const ways = [];

  const sortedContainers = containers.sort((a, b) => b - a); // largest to smallest
  const firstContainer = sortedContainers[0];
  if(firstContainer === liters) {
    ways.push([firstContainer]);
  } else if(firstContainer < liters) {
    const litersLeft = liters - firstContainer;
    const waysWithFirstContainer = fillContainersExactly(sortedContainers.slice(1), litersLeft);
    ways.push(...waysWithFirstContainer.map(way => [firstContainer, ...way]));
  }

  const waysWithoutFirstContainer = fillContainersExactly(sortedContainers.slice(1), liters);
  ways.push(...waysWithoutFirstContainer);

  return ways;
}

export default { part1, part2 };
