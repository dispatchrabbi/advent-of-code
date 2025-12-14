import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { addNode, createEmptyGraph } from '#utils/graph-utils';

const log = loglevel.getLogger('puzzle');

async function* part1(input: string, options = {}) {
  const mapping = parseInput(input);

  const paths = findNumberOfPathsVia('you', 'out', [], mapping);

  return paths;
}

async function* part2(input: string, options = {}) {
  const mapping = parseInput(input);

  const paths = findNumberOfPathsVia('svr', 'out', ['dac', 'fft'], mapping);

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

function findNumberOfPathsVia(start: string, end: string, via: string[], mapping: Record<string, string[]>) {
  const memo = new Map<string, number>();
  const findPaths = function(from: string, seenVias: boolean[]) {
    const key = `${from}${seenVias.map(b => b ? 1 : 0).join('')}`;
    if(memo.has(key)) {
      return memo.get(key)!;
    }

    let totalPaths = 0;
    for(const next of mapping[from]) {
      if(next !== end) {
        const nextSeenVias = seenVias.map((v, ix) => v || next === via[ix]);
        totalPaths += findPaths(next, nextSeenVias);
      } else if(seenVias.every(v => v)) {
        totalPaths++;
      }
    }

    memo.set(key, totalPaths);
    return totalPaths;
  }

  return findPaths(start, Array(via.length).fill(false));
}

export default { part1, part2 };
