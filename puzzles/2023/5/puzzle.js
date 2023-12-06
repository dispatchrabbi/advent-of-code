import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { cmp } from '#utils/arr';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const almanac = parseInput(input);
  almanac.maps = almanac.maps.map(m => m.sort((a, b) => a.source - b.source));

  let numbers = almanac.seeds;
  for(let map of almanac.maps) {
    numbers = numbers.map(seed => src2dst(map, seed));
  }

  return numbers.sort(cmp)[0];
}

async function* part2(input, options = {}) {
  // testFindOverlap(); return 0;
  const almanac = parseInput(input);
  // sort the ranges within maps based on source range start
  almanac.maps = almanac.maps.map(m => m.sort((a, b) => a.source - b.source));

  const seedRanges = [];
  while(almanac.seeds.length > 0) {
    const start = almanac.seeds.shift();
    const range = almanac.seeds.shift();
    seedRanges.push([ start, range ]);
  }

  // given just how many seeds there are in these ranges, there's no way to convert all of them
  // we'll have to convert them range-by-range, and split the ranges when they overlap a boundary
  let ranges = seedRanges;
  for(let map of almanac.maps) {
    const mappedRanges = [];

    for(let range of ranges) {
      for(let mapRange of map) {
        const { before, overlap, after } = findOverlap(range, [ mapRange.source, mapRange.range ]);

        if(before) {
          // "before" range can be directly passed along; we know it does not correspond to any range in the map
          mappedRanges.push(before);
        }

        if(overlap) {
          // "overlap" range must be translated using the current range
          const offset = mapRange.destination - mapRange.source;
          mappedRanges.push([ overlap[0] + offset, overlap[1] ]);
        }

        // "after" range is what's left over to compare against further ranges
        range = after;
        if(!after) {
          // but if there is none, we're done with this loop
          break;
        }
      }

      // if there's still a range left over, pass it through - it didn't map to anything
      if(range) {
        mappedRanges.push(range);
      }
    }

    ranges = mappedRanges;
  }

  return Math.min(...ranges.map(range => range[0]));
}

function parseInput(input) {
  const lines = input.trimEnd().split('\n');

  // seed list is the first line
  const seeds = lines.shift().substring('seeds: '.length).split(' ').map(x => +x);

  // next are:
  const maps = [
    [], // seed to soil
    [], // soil to fertilizer
    [], // fertilizer to water
    [], // water to light
    [], // light to temperature
    [], // temperature to humidity
    [], // humidity to location
  ];

  for(let i = 0, mapIndex = -1; i < lines.length; ++i) {
    const line = lines[i];

    if(line.length === 0) {
      // blank line, skip a line and start on the next map
      i += 1;
      mapIndex += 1;
      continue;
    }

    const [ destination, source, range ] = line.split(' ').map(x => +x);
    maps[mapIndex].push({ source, destination, range });
  }

  return {
    seeds,
    maps
  };
}

function src2dst(map, src) {
  for(let range of map) {
    if(src >= range.source && src < range.source + range.range) {
      return range.destination + (src - range.source);
    }
  }

  // src isn't in any of the ranges, so it maps to itself
  return src;
}

function findOverlap([ srcStart, srcLength ], [ rangeStart, rangeLength ]) {
  const srcEnd = srcStart + srcLength; // srcStart is inclusive; srcEnd is NOT inclusive
  const rangeEnd = rangeStart + rangeLength; // rangeStart is inclusive; rangeEnd is NOT inclusive

  const before = srcStart < rangeStart ? [ srcStart, Math.min(srcLength, rangeStart - srcStart) ] : null;
  const overlap = (srcStart < rangeEnd && srcEnd > rangeStart) ?
    [ Math.max(srcStart, rangeStart), Math.min(srcEnd, rangeEnd) - Math.max(srcStart, rangeStart) ] :
    null;
  const after = srcEnd > rangeEnd ? [ Math.max(srcStart, rangeEnd), srcEnd - Math.max(srcStart, rangeEnd) ] : null

  return { before, overlap, after };
}

function testFindOverlap() {
  log.debug('all before', findOverlap([0, 3], [10, 6]));
  log.debug('start overlap', findOverlap([0, 5], [3, 6]));
  log.debug('totally contained', findOverlap([2, 3], [0, 6]));
  log.debug('end overlap', findOverlap([4, 10], [0, 6]));
  log.debug('all after', findOverlap([10, 3], [0, 6]));
  log.debug('totally overlapped', findOverlap([0, 20], [8, 5]));
}

export default { part1, part2 };
