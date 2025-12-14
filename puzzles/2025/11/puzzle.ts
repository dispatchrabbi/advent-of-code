import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { addNode, createEmptyGraph } from '#utils/graph-utils';

const log = loglevel.getLogger('puzzle');

async function* part1(input: string, options = {}) {
  const mapping = parseInput(input);

  const paths = findNumberOfPaths('you', 'out', mapping);

  return paths;
}

async function* part2(input: string, options = {}) {
  const mapping = parseInput(input);

  const paths = findNumberOfPaths2(mapping);

  return paths;
}

function parseInput(input: string) {
  const mapping: Record<string, string[]> = {};

  const lines = input.trimEnd().split('\n');
  for(const line of lines) {
    let [source, ...outputs] = line.split(' ');
    source = source.slice(0, -1); // get rid of the colon at the end

    mapping[source] = outputs;
  }

  return mapping;
}

function findNumberOfPaths(start: string, end: string, mapping: Record<string, string[]>) {
  const found: string[][] = [];
  
  const queue: string[][] = [ [start] ];
  while(queue.length > 0) {
    const path = queue.shift()!;
    const nexts = (mapping[path.at(-1)!] ?? []);
    for(const next of nexts) {
      if(next === end) {
        found.push([...path, next]);
        continue;
      } else if(path.includes(next)) {
        // looped! crash out
        continue;
      } else {
        queue.push([...path, next]);
      }
    }
  }

  return found.length;
}

function findNumberOfPaths2(mapping: Record<string, string[]>) {
  const memo = new Map<string, number>();
  const findPaths = function(from: string, seenDac: boolean, seenFft: boolean) {
    const key = `${from}${seenDac ? 0 : 1}${seenFft ? 0 : 1}`;
    if(memo.has(key)) {
      return memo.get(key)!;
    }

    let totalPaths = 0;
    for(const next of mapping[from]) {
      if(next === 'out' && seenDac && seenFft) {
        totalPaths++;
      } else if(next !== 'out') {
        totalPaths += findPaths(next, seenDac || next === 'dac', seenFft || next === 'fft');
      }
    }

    memo.set(key, totalPaths);
    return totalPaths;
  }

  return findPaths('svr', false, false);
}

export default { part1, part2 };
