import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { sum } from '#utils/maths';

const log = loglevel.getLogger('puzzle');

async function* part1(input: string, options = {}) {
  const machines = parseInput(input);

  let totalPresses = 0;
  for(const machine of machines) {
    const solution = solveMachineLights(machine);
    if(!solution) {
      throw new Error('Solution for a machine was not found!');
    }
    
    totalPresses += solution.size;
  }

  return totalPresses;
}

async function* part2(input: string, options = {}) {
  const machines = parseInput(input);

  let totalPresses = 0;
  solveMachineJoltages(machines[0]);
  // for(const machine of machines) {
  //   const solution = solveMachineJoltages(machine);
  //   if(!solution) {
  //     throw new Error('Solution for a machine was not found!');
  //   }
    
  //   totalPresses += sum(solution);
  // }

  return totalPresses;
}

type Machine = {
  lights: number[],
  buttons: number[][],
  joltages: number[],
};

function parseInput(input: string): Machine[] {
  return input.trimEnd().split('\n').map(line => {
    // I could do this with a regex but nah
    const diagrams = line.split(' ');
    const lights = diagrams.shift()!.slice(1, -1).split('').map(ch => ch === '.' ? 0 : 1);
    const joltages = diagrams.pop()!.slice(1, -1).split(',').map(x => +x);
    const buttons = diagrams.map(diagram => diagram.slice(1, -1).split(',').map(x => +x));

    return {
      lights,
      buttons,
      joltages
    };
  });
}

function solveMachineLights(machine: Machine) {
  const { lights: lightsArr, buttons: buttonsArr } = machine;
  
  // turn the lights into a bitstring (big-endian though, so light 0 is on the right)
  const lights = parseInt(lightsArr.reverse().join(''), 2);
  // turn the buttons into the bitstrings they produce
  const buttons = buttonsArr.map(buttonArr => buttonArr.reduce((bitstring, light) => bitstring |= (2 ** light), 0));

  const knownStates = new Map<number, Set<number>>([[0, new Set()]]);
  while(true) {
    // are we there yet?
    if(knownStates.has(lights)) {
      return knownStates.get(lights);
    }

    // otherwise, apply button presses to every known state
    for(const entry of knownStates) {
      const [state, pressed] = entry;
      for(let nextBtn = 0; nextBtn < buttons.length; ++nextBtn) {
        // no need to press buttons twice
        if(pressed.has(nextBtn)) { continue; }

        const nextState = state ^ buttons[nextBtn];
        const nextPressed = new Set([...pressed, nextBtn]);
        if(nextState === lights) {
          // found it!
          return nextPressed;
        } else if(!knownStates.has(nextState)) {
          // add it to our known states - it's the shortest way to get here
          knownStates.set(nextState, nextPressed);
        }
      }
    }

    // this should never happen, but I feel weird without it
    if(knownStates.size >= 2 ** lightsArr.length) {
      return undefined;
    }
  }
}

function solveMachineJoltages(machine: Machine) {
  const { joltages, buttons } = machine;

  const equationMatrix: number[][] = []
  for(let r = 0; r < joltages.length; ++r) {
    const row: number[] = [];
    
    for(let c = 0; c < buttons.length; ++c) {
      // does this button contribute to this joltage counter?
      row.push(buttons[c].includes(r) ? 1 : 0);
    }
    // and then target joltages in the final column
    row.push(joltages[r]);

    equationMatrix.push(row);
  }

  const solution = solveEquationSystem(equationMatrix);

  return solution;
}

export function solveEquationSystem(terms: number[][], targets: number[], bounds: number[]): number[] {
  const matrix = terms.map(row => row.slice());
  const rows = matrix.length;
  const cols = matrix[0].length;

  const augmentedColumn = targets.slice();

  const pivotColToPivotRow: Map<number, number> = new Map();
  
  // put the matrix in row echelon form (https://en.wikipedia.org/wiki/Gaussian_elimination#Pseudocode)
  let pivotRow = 0; // h
  let pivotCol = 0; // k
  while(pivotRow < rows && pivotCol < cols) {
    // find the pivot, which is the max absolute value in the current column for the pivot row and under
    const maxIndex = matrix.slice(pivotRow).map(row => row[pivotCol]).reduce((maxIxSoFar, el, ix) => {
      const champion = Math.abs(matrix[maxIxSoFar][pivotCol]);
      const contender = Math.abs(el);
      return contender > champion ? ix : maxIxSoFar;
    }, 0) + pivotRow;

    if(matrix[maxIndex][pivotCol] === 0) {
      // no pivot found in this column, move on
      pivotCol++;
      continue;
    }

    // swap rows at pivotRow and maxIndex
    [matrix[pivotRow], matrix[maxIndex]] = [matrix[maxIndex], matrix[pivotRow]];
    [augmentedColumn[pivotRow], augmentedColumn[maxIndex]] = [augmentedColumn[maxIndex], augmentedColumn[pivotRow]];

    // adjust the rest of the matrix
    for(let i = pivotRow + 1; i < rows; ++i) {
      const factor = matrix[i][pivotCol] / matrix[pivotRow][pivotCol];
      
      // fill the rest of the column with 0
      matrix[i][pivotCol] = 0;

      // adjust the rest of the row
      for(let j = pivotCol + 1; j < cols; ++j) {
        matrix[i][j] = matrix[i][j] - (matrix[pivotRow][j] * factor);
      }
      augmentedColumn[i] = augmentedColumn[i] - (augmentedColumn[pivotRow] * factor);
    }

    // record this pivot row and column
    pivotColToPivotRow.set(pivotCol, pivotRow);

    // move on to the next pivot row and column
    pivotRow++;
    pivotCol++;
  }

  // check if there is anything left in the augmented side below the triangle
  for(let i = pivotRow; i < rows; ++i) {
    if(augmentedColumn[i] > 0) { // this may have to change to an epsilon (1e-4 maybe)
      return Array(cols).fill(0);
    }
  }

  // the rest of this is adapted from https://github.com/Cinnamonsroll/AdventOfCode2025/blob/main/day10/part2.ts
  // gather the columns not used as a pivot
  const freeVariableCols: number[] = [];
  for(let i = 0; i < cols; ++i) {
    if(!pivotColToPivotRow.has(i)) {
      freeVariableCols.push(i);
    }
  }

  // search for the solution
  let best = Infinity;
  const currentSolution = Array(cols).fill(0);
  const search = function(index: number, cost: number) {
    if(cost >= best) {
      return;
    }

    if(index === freeVariableCols.length) {

    }

    // try searching the solution space for the next columns over, recursively
    const freeVariableCol = freeVariableCols[index];
    const limit = bounds[freeVariableCol];
    for(let v = 0; v <= limit; ++v) {
      currentSolution[freeVariableCol] = v;
      search(index + 1, cost + v);
    }

    
  }


}

function fmtMatrix(matrix: number[][], augmentedColumn?: number[]) {
  return matrix.map((row, ix) => row.join(' ') + (augmentedColumn ? ` | ${augmentedColumn[ix]}` : '')).join('\n');
}


export default { part1, part2 };
