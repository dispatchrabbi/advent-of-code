import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const { row, column } = parseInput(input);
  const iterations = calculateIterations(row, column);

  const k = 252533;
  const m = 33554393;
  const c0 = 20151125;
  const code = findCode(iterations, c0, k, m);

  return Number(code);
}

function parseInput(input) {
  const matches = /row (\d+), column (\d+)/.exec(input.trim());
  return {
    row: +matches[1],
    column: +matches[2],
  };
}

function findCode(i, c0, k, m) {
  // so basically, we want to find c(i) where c(n+1) = (c(n) * k) % m and c(0) = c0.
  // given a ≡ b mod m,  a^p ≡ b^p mod m and qa ≡ qb mod m
  // that means that we can basically factor out the modulo step
  // and go straight to c(i) = (c0 * (k ^ i)) % m

  c0 = BigInt(c0);
  i = BigInt(i);
  k = BigInt(k);
  m = BigInt(m);

  return (c0 * (k ** i)) % m;
}

function calculateIterations(row, column) {
  const triangleRow = row + (column - 1) - 1;
  const triangleNum = (triangleRow * (triangleRow + 1)) / 2;
  return triangleNum + column - 1;
}

export default { part1 };
