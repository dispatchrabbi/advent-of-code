import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const triangles = parseInput1(input);

  const validTriangles = triangles.filter(isValidTriangle);
  return validTriangles.length;
}

async function* part2(input, options = {}) {
  const triangles = parseInput2(input);

  const validTriangles = triangles.filter(isValidTriangle);
  return validTriangles.length;
}

function parseInput1(input) {
  const LINE_REGEX = /(\d+)\s+(\d+)\s+(\d+)/;
  return input.trim().split('\n').map(line => {
    const matches = line.match(LINE_REGEX);
    return [ +matches[1], +matches[2], +matches[3] ];
  });
}

function parseInput2(input) {
  const parsedNumberRows = parseInput1(input);
  const triangles = [];
  for(let i = 0; i < parsedNumberRows.length; i += 3) {
    triangles.push(
      [ parsedNumberRows[i][0], parsedNumberRows[i+1][0], parsedNumberRows[i+2][0] ],
      [ parsedNumberRows[i][1], parsedNumberRows[i+1][1], parsedNumberRows[i+2][1] ],
      [ parsedNumberRows[i][2], parsedNumberRows[i+1][2], parsedNumberRows[i+2][2] ],
    );
  }

  return triangles;
}

function isValidTriangle(sides) {
  sides = sides.sort((a, b) => a - b);
  return sides[0] + sides[1] > sides[2];
}

export default { part1, part2 };
