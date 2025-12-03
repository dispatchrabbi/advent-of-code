import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { normalizeRanges } from '#utils/span';
import { divisors, sum } from '#utils/maths';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const ranges = parseInput(input);
  const normalized = normalizeRanges(ranges);

  const doublets = normalized.flatMap(([start, end]) => generateDoublets(start, end));
  const summed = sum(doublets);

  return summed;
}

function generateDoublets(start, end) {
  const repeaters = [];
  for(const range of createMagnitudeRanges(start, end)) {
    repeaters.push(..._generateDoublets(...range));
  }

  const unique = Array.from(new Set(repeaters));
  return unique;
}

function _generateDoublets(start, end) {
  const startStr = start.toString();
  const endStr = end.toString();

  if(startStr.length % 2 !== 0) {
    return [];
  }

  const repeaters = [];
  const length = startStr.length / 2;
  
  const min = parseInt(startStr.substring(0, length), 10);
  const max = parseInt(endStr.substring(0, length), 10);
  for(let i = min; i <= max; ++i) {
    const candidate = +(i.toString().repeat(2));
    if(start <= candidate && candidate <= end) {
      repeaters.push(candidate);
    }
  }

  return repeaters;
}

function createMagnitudeRanges(start, end) {
  const minExp = Math.floor(Math.log10(start));
  const maxExp = Math.floor(Math.log10(end));

  const ranges = [];
  for(let digits = minExp; digits <= maxExp; ++digits) {
    ranges.push([
      Math.max(10 ** digits, start),
      Math.min((10 ** (digits + 1)) - 1, end),
    ]);
  }

  return ranges;
}

async function* part2(input, options = {}) {
  const ranges = parseInput(input);
  const normalized = normalizeRanges(ranges);

  const doublets = normalized.flatMap(([start, end]) => generateRepeaters(start, end));
  const summed = sum(doublets);

  return summed;
}

function generateRepeaters(start, end) {
  const repeaters = [];
  for(const range of createMagnitudeRanges(start, end)) {
    repeaters.push(..._generateRepeaters(...range));
  }

  const unique = Array.from(new Set(repeaters));
  return unique;
}

function _generateRepeaters(start, end) {
  const startStr = start.toString();
  const endStr = end.toString();

  const repeaters = [];
  const lengths = divisors(startStr.length);
  
  for(const length of lengths) {
    const min = parseInt(startStr.substring(0, length), 10);
    const max = parseInt(endStr.substring(0, length), 10);
    const repeats = startStr.length / length;

    for(let i = min; i <= max; ++i) {
      const candidate = +(i.toString().repeat(repeats));
      if(start <= candidate && candidate <= end) {
        repeaters.push(candidate);
      }
    }
  }

  return repeaters;
}

function parseInput(input) {
  return input.trimEnd().split(',').map(rangeStr => rangeStr.split('-').map(n => parseInt(n, 10)));
}

export default { part1, part2 };
