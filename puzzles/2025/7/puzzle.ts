import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { sum } from '#utils/maths';

const log = loglevel.getLogger('puzzle');

async function* part1(input: string, options = {}) {
  const {startFile, ranksCount, splitters} = parseInput(input);

  let splits = 0;
  let beams = new Set([startFile]);
  for(let i = 0; i <= ranksCount; ++i) {
    if(splitters[i]) {
      const after = new Set<number>();
      for(const beam of beams) {
        if(splitters[i].includes(beam)) {
          after.add(beam - 1);
          after.add(beam + 1);
          splits += 1;
        } else {
          after.add(beam);
        }
      }
      beams = after;
    }
  }

  return splits;
}

async function* part2(input: string, options = {}) {
  const {startFile, ranksCount, filesCount, splitters} = parseInput(input);

  let particleCounts = Array(filesCount).fill(0);
  particleCounts[startFile] = 1;
  
  for(let i = 0; i <= ranksCount; ++i) {
    if(splitters[i]) {
      const afterCounts = Array(filesCount).fill(0);
      for(let j = 0; j < filesCount; ++j) {
        if(splitters[i].includes(j)) {
          afterCounts[j - 1] += particleCounts[j];
          afterCounts[j + 1] += particleCounts[j];
        } else {
          afterCounts[j] += particleCounts[j];
        }
      }
      particleCounts = afterCounts;
    }
  }

  return sum(particleCounts);
}

function parseInput(input: string) {
  const lineLength = input.indexOf('\n') + 1;
  const ranksCount = Math.floor(input.length / lineLength) + 1;
  
  let startFile = 0;
  const splitters: number[][] = [];

  for(let i = 0; i < input.length; ++i) {
    if(input[i] === '^') {
      const rank = Math.floor(i / lineLength);
      const file = i % lineLength;
      
      splitters[rank] = splitters[rank] ?? [];
      splitters[rank].push(file);
    } else if(input[i] === 'S') {
      startFile = i % lineLength;
    }
  }
  
  return {
    startFile,
    ranksCount,
    filesCount: lineLength - 1,
    splitters
  };
}

export default { part1, part2 };
