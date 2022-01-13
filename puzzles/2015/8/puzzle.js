import chalk from 'chalk';
import loglevel from 'loglevel';
const log = loglevel.getLogger('puzzle');

import { sum } from '../../../utils/math.js';

async function part1(input) {
  const strings = parseInput(input).map(str => ({ raw: str, decoded: decodeString(str) }));

  const differences = strings.map(strs => strs.raw.length - strs.decoded.length);
  return sum(differences);
}

async function part2(input) {
  const strings = parseInput(input).map(str => ({ raw: str, encoded: encodeString(str) }));

  const differences = strings.map(strs => strs.encoded.length - strs.raw.length);
  return sum(differences);
}

function parseInput(input) {
  return input.trim().split('\n');
}

function decodeString(str) {
  let decoded = '';
  // start at 1 and end 1 early for the two " on either end
  for(let cursor = 1; cursor < str.length - 1; ++cursor) {
    if(str[cursor] === '\\') {
      if(str[cursor+1] === 'x') {
        decoded += String.fromCodePoint('0x' + str.substr(cursor+2, 2));
        cursor += 3;
      } else if(str[cursor+1] === '\\') {
        decoded += '\\';
        cursor += 1;
      } else if(str[cursor+1] === '"') {
        decoded += '"';
        cursor += 1;
      }
    } else {
      decoded += str[cursor];
    }
  }

  return decoded;
}

function encodeString(str) {
  let encoded = '';

  for(let char of str) {
    switch(char) {
      case '"':
        encoded += '\\"';
        break;
      case '\\':
        encoded += '\\\\';
        break;
      default:
        encoded += char;
        break;
    }
  }

  return `"${encoded}"`;
}

export default { part1, part2 };
