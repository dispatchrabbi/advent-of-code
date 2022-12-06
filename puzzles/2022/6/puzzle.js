import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const dataStream = parseInput(input);

  const startOfFirstPacket = findStartMarker(dataStream, 4);
  return startOfFirstPacket;
}

async function* part2(input, options = {}) {
  const dataStream = parseInput(input);

  const startOfFirstMessage = findStartMarker(dataStream, 14);
  return startOfFirstMessage;
}

function parseInput(input) {
  return input.trim();
}

function findStartMarker(stream, numberOfUniqueCharsToDetect) {
  let i = 0, buffer = [];
  while(i < stream.length && buffer.length < numberOfUniqueCharsToDetect) {
    const bufferPos = buffer.lastIndexOf(stream[i]);
    if(bufferPos > -1) {
      buffer = [ ...buffer.slice(bufferPos + 1), stream[i] ];
    } else {
      buffer.push(stream[i]);
    }

    ++i;
  }
  return i;
}

export default { part1, part2 };
