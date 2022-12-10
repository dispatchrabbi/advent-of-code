import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { CPU } from '#utils/cpu';
import { sum } from '#utils/maths';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const instructions = parseInput(input);

  const PERIOD = 40;
  const OFFSET = 20;
  const LIMIT = 6;
  const interestingSignalStrengths = await findSignalStrengths(instructions, PERIOD, OFFSET, LIMIT);
  log.debug(interestingSignalStrengths);

  return sum(interestingSignalStrengths);
}

async function* part2(input, options = {}) {
  const instructions = parseInput(input);

  const screenGen = drawImage(instructions, 40);

  let next, image;
  while(next = await screenGen.next()) {
    if(next.done) {
      image = next.value;
      break;
    }

    image = next.value;
    yield(frame(image.map(line => line.join('')).join('\n'), 'drawing image...'));
  }

  // const image = await drawImage(instructions, 40);
  // yield(frame(image.map(line => line.join('')).join('\n'), 'drawing image...'));

  yield(frame(image.map(line => line.join('')).join('\n'), 'drawing image...'));
  return 'look up';
}

function parseInput(input) {
  return input.trim().split('\n').map(line => CPU.makeInstruction(...line.split(' ')));
}

const OPERATIONS = {
  'noop': () => { },
  'addx': ([v], cpu) => {
    // takes two cycles to complete, so we will store which cycle it is in a register,
    // use the jump flag to prevent the CPU from moving on during the first cycle,
    // and add the value during the second cycle
    const currentCycle = cpu.val('addx_cycle');
    if(currentCycle === 0) {
      cpu.registers.addx_cycle = 1;
      cpu.flags.jump = true; // prevent the CPU counter from advancing this cycle
    } else if(currentCycle === 1) {
      cpu.registers.addx_cycle = 0;
      cpu.registers.X += v;
    } else {
      throw new Error(`addx_cycle register had an invalid value (${currentCycle})`);
    }
  },
};
async function findSignalStrengths(instructions, period, offset, limit) {
  const signalStrengths = [];

  const chip = new CPU(OPERATIONS, { X: 1 }, instructions);
  for(let cycle = 1; cycle <= (period * limit) + offset; ++cycle) {
    // count the signal strength BEFORE executing the instruction for the cycle
    if((cycle - offset) % period === 0) {
      log.debug(chalk.red(`pre-${cycle}: `), chip.statusString());
      signalStrengths.push(cycle * chip.registers.X);
    }

    await chip.step();
    if(chip.flags.halt) { break; }
  }

  return signalStrengths;
}

async function* drawImage(instructions, screenWidth) {

  const chip = new CPU(OPERATIONS, { X: 1 }, instructions);

  const image = [];
  let column = 0;

  while(!chip.flags.halt) {
    if(column === 0) {
      // we're at the start of a new row
      image.push([]);
    }

    // draw the pixel
    const spriteOffset = chip.val('X') - column;
    const pixel = spriteOffset >= -1 && spriteOffset <= 1 ? chalk.yellow('#') : chalk.gray('.')
    image[image.length - 1].push(pixel);
    yield image;

    // push the CRT beam over one, or down to the next row if it's at the end
    column = (column + 1) % screenWidth;

    await chip.step();
  }

  return image;
}

export default { part1, part2 };
