import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { CPU } from '#utils/cpu';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const instructions = parseInput(input);
  const tablet = await runSoundTablet(instructions);

  return tablet.registers.last_sound;
}

async function* part2(input, options = {}) {
  const instructions = parseInput(input);
  const [ _, cpu1 ] = await runTandemTablets(instructions);

  return cpu1.registers.send_counter;
}

function parseInput(input) {
  return input.trim().split('\n').map(line => CPU.makeInstruction(...line.split(' ')));
}

const TABLET_OPERATIONS = {
  'snd': ([x], cpu) => { cpu.registers['last_sound'] = cpu.val(x); },
  'set': ([x, y], cpu) => { cpu.registers[x] = cpu.val(y); },
  'add': ([x, y], cpu) => { cpu.registers[x] += cpu.val(y); },
  'mul': ([x, y], cpu) => { cpu.registers[x] *= cpu.val(y); },
  'mod': ([x, y], cpu) => { cpu.registers[x] %= cpu.val(y); },
  'rcv': ([x], cpu) => {
    if(cpu.val(x) !== 0) {
      cpu.flags.halt = true;
    }
  },
  'jgz': ([x, y], cpu) => {
    if(cpu.val(x) > 0) {
      cpu.counter += cpu.val(y);
      cpu.flags.jump = true;
    }
  },
};
async function runSoundTablet(instructions) {
  const tablet = new CPU(TABLET_OPERATIONS, { last_sound: null }, instructions);
  await tablet.run();
  return tablet;
}

async function runTandemTablets(instructions) {
  function sib(ix) { return ix === 1 ? 0 : 1; }
  const siblingCpus = [];

  const PART2_TABLET_OPERATIONS = {
    ...TABLET_OPERATIONS,
    'snd': ([x], cpu) => {
      const sibling = siblingCpus[sib(cpu.ix)];
      sibling.queue.push(cpu.val(x));
      cpu.registers.send_counter++;
    },
    'rcv': ([x], cpu) => {
      if(cpu.queue.length > 0) {
        cpu.registers[x] = cpu.queue.shift();
      } else {
        cpu.flags.halt = true;
      }
    },
  };

  const cpu0 = new CPU(PART2_TABLET_OPERATIONS, { p: 0, send_counter: 0 }, instructions);
  cpu0.ix = 0;
  cpu0.queue = [];

  const cpu1 = new CPU(PART2_TABLET_OPERATIONS, { p: 1, send_counter: 0 }, instructions);
  cpu1.ix = 1;
  cpu1.queue = [];

  siblingCpus.push(cpu0, cpu1);

  while(!isDeadlock(siblingCpus)) {
    await cpu0.run();
    await cpu1.run();
  }

  return siblingCpus;
}

function isDeadlock(cpus) {
  return cpus.every(cpu => cpu.flags.halt && cpu.queue.length === 0);
}

export default { part1, part2 };
