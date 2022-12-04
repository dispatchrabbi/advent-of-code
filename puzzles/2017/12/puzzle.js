import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const pipes = parseInput(input);
  const group = findProgramGroup(pipes, 0);

  return group.length;
}

async function* part2(input, options = {}) {
  const pipes = parseInput(input);
  const allGroups = findAllGroups(pipes);

  log.debug(allGroups);
  return allGroups.length;
}

function parseInput(input) {
  return input.trim().split('\n')
    .map(line => line.split(' <-> '))
    .reduce((map, [fromStr, toStr]) => map.set(+fromStr, toStr.split(', ').map(x => +x)), new Map());
}

function findProgramGroup(pipes, startId) {
  const group = [ startId ];
  for(let i = 0; i < group.length; ++i) {
    group.push(...pipes.get(group[i]).filter(id => !group.includes(id)));
  }
  return group;
}

function findAllGroups(pipes) {
  const seen = [];
  const groups = [];
  for(let id of pipes.keys()) {
    if(seen.includes(id)) { continue; }

    const group = findProgramGroup(pipes, id);
    groups.push(group);
    seen.push(...group);
  }

  return groups;
}

export default { part1, part2 };
