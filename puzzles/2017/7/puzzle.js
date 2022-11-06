import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

import { sum } from '#utils/maths';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const programs = parseInput(input);
  const base = findBaseProgram(programs);

  return base.name;
}

async function* part2(input, options = {}) {
  const programs = parseInput(input);

  const root = buildTree(programs);
  populateTotalWeights(root);
  const desiredWeight = findBalancedDiscWeight(root);

  return desiredWeight;
}

function parseInput(input) {
  return input.trim().split('\n').map(line => {
    const [ base, children ] = line.split(' -> ');
    const [ _, name, weight ] = base.match(/^([a-z]+) \((\d+)\)$/);

    return {
      name,
      weight: +weight,
      children: children ? children.split(', ') : [],
    };
  });
}

function findBaseProgram(programs) {
  function findParent(child, programs) {
    return programs.find(p => p.children.includes(child.name));
  }

  let current = programs[0];
  while(true) {
    let next = findParent(current, programs);
    if(!next) { return current; }
    current = next;
  }
}

function buildTree(programs) {
  const nodes = {};
  for(let program of programs) {
    nodes[program.name] = program;
  }

  for(let program of programs) {
    program.children = program.children.map(childName => nodes[childName]);
    program.children.forEach(child => child.parent = program);
  }

  let root = programs[0];
  while(root.parent) {
    root = root.parent;
  }

  return root;
}

function populateTotalWeights(program) {
  let totalWeight = program.weight;

  if(program.children) {
    totalWeight += sum(program.children.map(populateTotalWeights));
  }

  program.totalWeight = totalWeight;
  return totalWeight;
}

function findWeightDiscrepancy(programs) {
  // bail if there are no programs to find discrepancies for
  if(programs.length < 1) { return null; }

  // collate the programs by weight
  const counts = programs.reduce((counts, program) => {
    if(!counts.has(program.totalWeight)) { counts.set(program.totalWeight, []); }
    counts.get(program.totalWeight).push(program);
    return counts;
  }, new Map());

  // sorting them means the odd one out will be at index 0, the majority weight at index 1
  const weights = [...counts.keys()].sort((a, b) => counts.get(a).length - counts.get(b).length);
  // bail if they're all the same
  if(weights.length === 1) { return null; }

  const difference = weights[1] - weights[0];
  const desiredWeight = counts.get(weights[0])[0].weight + difference;

  return desiredWeight;
}

function findBalancedDiscWeight(program) {
  for(let child of program.children) {
    const result = findBalancedDiscWeight(child);
    if(result !== null) {
      return result;
    }
  }

  const desiredWeight = findWeightDiscrepancy(program.children);
  if(desiredWeight !== null) {
    return desiredWeight;
  }

  return null;
}

export default { part1, part2 };
