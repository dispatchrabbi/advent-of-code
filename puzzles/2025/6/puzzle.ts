import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { sum, product } from '#utils/maths';
import { transpose } from '#utils/arr';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const columns = parseInput(input);

  const results = columns.map(col => {
    const values = col.slice(0, -1).map(x => +x);
    return col.at(-1) === '*' ? product(values) : sum(values);
  });

  const checksum = sum(results);
  return checksum;
}

function parseInput(input: string) {
  const rows = input.trimEnd().split('\n').map(line => line.trim().split(/\s+/));

  const columns: string[][] = [];
  for(let col = 0; col < rows[0].length; ++col) {
    columns[col] = rows.map(row => row[col]);
  }

  return columns;
}

async function* part2(input, options = {}) {
  const problems = parseInput2(input);
  const results = problems.map(problem => {
    return problem.operation === '*' ? product(problem.values) : sum(problem.values);
  });

  const checksum = sum(results);
  return checksum;
}

function parseInput2(input: string) {
  const transposedLines = transpose(input.trimEnd().split('\n').map(line => line.split(''))).map(line => line.join(''));
  
  const problems: { values: number[], operation: string }[] = [{ values: [], operation: '+' }];
  for(let line of transposedLines) {
    line = line.trim();
    if(line.length === 0) {
      problems.push({ values: [], operation: '+' });
      continue;
    }
    
    const current = problems.at(-1)!;
    if(['*', '+'].includes(line.at(-1)!)) {
      current.operation = line.at(-1)!;
      line = line.slice(0, -1);
    }

    line = line.trim();
    current.values.push(+line);
  }

  return problems;
}

export default { part1, part2 };
