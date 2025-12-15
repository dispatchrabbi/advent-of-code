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
  for(const machine of machines) {
    const solution = solveMachineJoltages(machine);
    if(!solution) {
      throw new Error('Solution for a machine was not found!');
    }
    
    totalPresses += sum(solution);
  }

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

// credit for the method here goes to maneatingape (https://www.reddit.com/r/adventofcode/comments/1pk87hl/2025_day_10_part_2_bifurcate_your_way_to_victory/)
// but the implementation is mine
function solveMachineJoltages(machine: Machine) {
  const buttonPatterns = enumerateButtonPatterns(machine);

  const joltageMemos: Map<string, number[]> = new Map([
    [Array(machine.joltages.length).fill(0).join(','), Array(machine.buttons.length).fill(0)],
  ]);
  const findLeastButtonPressesForJoltages = function(j: number[], depth: number = 0): number[] {
    // const indent = Array(depth).fill('  ').join('');
    // console.log(indent, j);
    let joltages = j.slice();

    const key = joltages.join(',');
    if(joltageMemos.has(key)) {
      // console.log(indent, 'cache hit', joltageMemos.get(key)!);
      return joltageMemos.get(key)!;
    }

    // get the odd/even pattern from joltages (reversed because joltages is little-endian but patterns are big-endian like numbers)
    const pattern = parseInt(joltages.map(j => j % 2).reverse().join(''), 2);
    // console.log(indent, 'pattern', pattern.toString(2));

    const buttonCombos = buttonPatterns.get(pattern);
    if((!buttonCombos) || buttonCombos.length === 0) {
      // no way to push buttons to get this pattern - bail out
      // console.log(indent, `no way to get to ${pattern.toString(2)}, bailing!`);
      return Array(machine.buttons.length).fill(Infinity);
    }

    let winnerSoFar = Array(machine.buttons.length).fill(Infinity);
    for(const combo of buttonCombos) {
      // console.log(indent, `one way to get to ${pattern.toString(2)} is`, combo.toString(2));
      // turn the combo (which is a number, so big-endian) into an array of presses (which is little-endian, b/c 0-indexed)
      let contender = combo.toString(2).split('').reverse().map(x => +x);
      while(contender.length < machine.buttons.length) {
        contender.push(0);
      }
      // console.log(indent, `which is this in button presses:`, contender, `(${sum(contender)})`);
      
      const leftoverJoltages = joltages.slice();
      for(let btnIx = 0; btnIx < contender.length; ++btnIx) {
        for(const joltageIx of machine.buttons[btnIx]) {
          leftoverJoltages[joltageIx] -= contender[btnIx];
        }
      }
      // console.log(indent, `after pressing those buttons, what's leftover is:`, leftoverJoltages);

      if(leftoverJoltages.every(j => j >= 0)) {
        // all the leftover joltages are guaranteed to be even at this point
        const halved = leftoverJoltages.map(j => j / 2);
        // console.log(indent, `and the joltages left to account for (x2) are:`, halved);
        const pressesForLeftoverHalvedJoltages = findLeastButtonPressesForJoltages(halved, depth + 1);
        contender = contender.map((val, ix) => val + (2 * pressesForLeftoverHalvedJoltages[ix]));
      } else {
        // can't really do anything with negative joltages, bail
        continue;
      }

      // console.log(indent, `the full contender (for presses) is:`, contender, `(${sum(contender)})`);
      if(sum(contender) < sum(winnerSoFar)) {
        winnerSoFar = contender;
      }
    }

    joltageMemos.set(key, winnerSoFar);
    // console.log(indent, `the winner for ${key} is:`, winnerSoFar, `(${sum(winnerSoFar)})`);
    return winnerSoFar;
  }

  return findLeastButtonPressesForJoltages(machine.joltages);
}

function enumerateButtonPatterns(machine: Machine) {
  // console.log(machine);
  const buttons = machine.buttons.map(buttonArr => buttonArr.reduce((bitstring, light) => bitstring |= (2 ** light), 0));
  // pattern (big-endian) -> all the various buttons combinations to get that pattern
  const patternMap: Map<number, number[]> = new Map();

  const combinations = 2 ** (machine.buttons.length);
  for(let activeButtonBits = 0; activeButtonBits < combinations; ++activeButtonBits) {
    let pattern = 0b0;
    for(let buttonIx = 0; buttonIx < buttons.length; ++buttonIx) {
      if(activeButtonBits & (2 ** buttonIx)) { // if activeButtonBits has a 1 in the buttonIx'th place
        pattern ^= buttons[buttonIx];
      }
    }

    const pressesArr = patternMap.get(pattern) ?? [];
    pressesArr.push(activeButtonBits);
    patternMap.set(pattern, pressesArr);
  }

  // console.log(Array.from(patternMap.entries().map(([k, v]) => ([k.toString(2), v.map(el => el.toString(2))]))));
  return patternMap;
}

function addVectors(a: number[], b: number[]): number[] {
  return a.map((el, ix) => el + b[ix]);
}

function subtractVectors(a: number[], b: number[]): number[] {
  return a.map((el, ix) => el - b[ix]);
}

function multiplyVector(v: number[], multiplier: number): number[] {
  return v.map(el => el * multiplier);
}

function divideVector(v: number[], divisor: number): number[] {
  return v.map(el => el / divisor);
}

// function solveMachineJoltages(machine: Machine) {
//   const { joltages, buttons } = machine;

//   const equationMatrix: number[][] = []
//   for(let r = 0; r < joltages.length; ++r) {
//     const row: number[] = [];
    
//     for(let c = 0; c < buttons.length; ++c) {
//       // does this button contribute to this joltage counter?
//       row.push(buttons[c].includes(r) ? 1 : 0);
//     }
//     // and then target joltages in the final column
//     row.push(joltages[r]);

//     equationMatrix.push(row);
//   }

//   const solution = solveEquationSystem(equationMatrix);

//   return solution;
// }

// export function solveEquationSystem(terms: number[][], targets: number[], bounds: number[]): number[] {
//   const matrix = terms.map(row => row.slice());
//   const rows = matrix.length;
//   const cols = matrix[0].length;

//   const augmentedColumn = targets.slice();

//   const pivotColToPivotRow: Map<number, number> = new Map();
  
//   // put the matrix in row echelon form (https://en.wikipedia.org/wiki/Gaussian_elimination#Pseudocode)
//   let pivotRow = 0; // h
//   let pivotCol = 0; // k
//   while(pivotRow < rows && pivotCol < cols) {
//     // find the pivot, which is the max absolute value in the current column for the pivot row and under
//     const maxIndex = matrix.slice(pivotRow).map(row => row[pivotCol]).reduce((maxIxSoFar, el, ix) => {
//       const champion = Math.abs(matrix[maxIxSoFar][pivotCol]);
//       const contender = Math.abs(el);
//       return contender > champion ? ix : maxIxSoFar;
//     }, 0) + pivotRow;

//     if(matrix[maxIndex][pivotCol] === 0) {
//       // no pivot found in this column, move on
//       pivotCol++;
//       continue;
//     }

//     // swap rows at pivotRow and maxIndex
//     [matrix[pivotRow], matrix[maxIndex]] = [matrix[maxIndex], matrix[pivotRow]];
//     [augmentedColumn[pivotRow], augmentedColumn[maxIndex]] = [augmentedColumn[maxIndex], augmentedColumn[pivotRow]];

//     // adjust the rest of the matrix
//     for(let i = pivotRow + 1; i < rows; ++i) {
//       const factor = matrix[i][pivotCol] / matrix[pivotRow][pivotCol];
      
//       // fill the rest of the column with 0
//       matrix[i][pivotCol] = 0;

//       // adjust the rest of the row
//       for(let j = pivotCol + 1; j < cols; ++j) {
//         matrix[i][j] = matrix[i][j] - (matrix[pivotRow][j] * factor);
//       }
//       augmentedColumn[i] = augmentedColumn[i] - (augmentedColumn[pivotRow] * factor);
//     }

//     // record this pivot row and column
//     pivotColToPivotRow.set(pivotCol, pivotRow);

//     // move on to the next pivot row and column
//     pivotRow++;
//     pivotCol++;
//   }

//   // check if there is anything left in the augmented side below the triangle
//   for(let i = pivotRow; i < rows; ++i) {
//     if(augmentedColumn[i] > 0) { // this may have to change to an epsilon (1e-4 maybe)
//       return Array(cols).fill(0);
//     }
//   }

//   // the rest of this is adapted from https://github.com/Cinnamonsroll/AdventOfCode2025/blob/main/day10/part2.ts
//   // gather the columns not used as a pivot
//   const freeVariableCols: number[] = [];
//   for(let i = 0; i < cols; ++i) {
//     if(!pivotColToPivotRow.has(i)) {
//       freeVariableCols.push(i);
//     }
//   }

//   // search for the solution
//   let best = Infinity;
//   const currentSolution = Array(cols).fill(0);
//   const search = function(index: number, cost: number) {
//     if(cost >= best) {
//       return;
//     }

//     if(index === freeVariableCols.length) {

//     }

//     // try searching the solution space for the next columns over, recursively
//     const freeVariableCol = freeVariableCols[index];
//     const limit = bounds[freeVariableCol];
//     for(let v = 0; v <= limit; ++v) {
//       currentSolution[freeVariableCol] = v;
//       search(index + 1, cost + v);
//     }

    
//   }


// }

// function fmtMatrix(matrix: number[][], augmentedColumn?: number[]) {
//   return matrix.map((row, ix) => row.join(' ') + (augmentedColumn ? ` | ${augmentedColumn[ix]}` : '')).join('\n');
// }


export default { part1, part2 };
