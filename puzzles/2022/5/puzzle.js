import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const { moves, stacks } = parseInput(input);

  for(let move of moves) {
    moveCratesIndividually(stacks, move);
  }

  const topCrates = stacks.map(stack => stack[stack.length - 1]);
  return topCrates.join('');
}

async function* part2(input, options = {}) {
  const { moves, stacks } = parseInput(input);

  for(let move of moves) {
    moveCratesTogether(stacks, move);
  }

  const topCrates = stacks.map(stack => stack[stack.length - 1]);
  return topCrates.join('');
}

function parseInput(input) {
  const [ initialStackDiagram, moveList ] = input.split('\n\n');

  const MOVE_REGEX = /^move (\d+) from (\d+) to (\d+)$/;
  const moves = moveList.trim().split('\n').map(line => {
    const [ _, quantity, from, to ] = MOVE_REGEX.exec(line).map(x => +x);
    return { quantity, from, to };
  });

  const diagramLines = initialStackDiagram.split('\n').reverse();
  const numberOfStacks = diagramLines.shift().trim().split('   ').length;

  // There's probably a more fun way to do this, but eh
  const stacks = Array(numberOfStacks).fill(0).map(el => []);
  for(let layer of diagramLines) {
    stacks.forEach((stack, ix) => {
      const letter = layer[1 + (4 * ix)];
      if(letter && letter !== ' ') {
        stack.push(letter);
      }
    });
  }

  return { moves, stacks };
}

function moveCratesIndividually(stacks, move) {
  const [ from, to ] = [ stacks[move.from - 1], stacks[move.to - 1] ];
  const movedCrates = from.splice(-move.quantity);
  to.push(...movedCrates.reverse());
}

function moveCratesTogether(stacks, move) {
  const [ from, to ] = [ stacks[move.from - 1], stacks[move.to - 1] ];
  to.push(...from.splice(-move.quantity));
}

export default { part1, part2 };
