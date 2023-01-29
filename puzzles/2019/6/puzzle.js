import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { sum } from '#utils/maths';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const orbits = parseInput(input);

  const parentChains = orbitPairsToParentChains(orbits);
  const totalOrbits = sum(Object.values(parentChains).map(arr => arr.length));

  return totalOrbits;
}

async function* part2(input, options = {}) {
  const orbits = parseInput(input);

  const parentChains = orbitPairsToParentChains(orbits);
  const youChain = parentChains['YOU'];
  const sanChain = parentChains['SAN'];

  const transfers = computeOrbitalTransfers(youChain, sanChain);
  return transfers.length - 1;
}

function parseInput(input) {
  return input.trimEnd().split('\n').map(line => line.split(')'));
}

function orbitPairsToParentChains(orbits) {
  const lookup = { 'COM': null };

  for(let [ parent, child ] of orbits) {
    if(!lookup[parent]) {
      lookup[parent] = null;
    }

    lookup[child] = parent;
  }

  const chains = { 'COM': [] };
  for(let orbiter of Object.keys(lookup)) {
    const chain = [];

    let parent = lookup[orbiter];
    while(parent !== null) {
      chain.push(parent);

      if(chains[parent]) {
        chain.push(...chains[parent]);
        parent = null;
      } else {
        parent = lookup[parent];
      }
    }

    chains[orbiter] = chain;
  }

  return chains;
}

function computeOrbitalTransfers(chain1, chain2) {
  chain1 = chain1.slice().reverse();
  chain2 = chain2.slice().reverse();

  // take off all except the last common element
  while(chain1[1] === chain2[1]) {
    chain1.shift();
    chain2.shift();
  }

  // take off one copy so there isn't a duplicate of the last common element
  chain2.shift();
  return [ ...chain1, ...chain2.reverse() ];
}

export default { part1, part2 };
