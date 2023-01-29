import chalk from "chalk";
import loglevel from 'loglevel';

const log = loglevel.getLogger('puzzle');

class Intcode {
  constructor(program) {
    this.memory = program.slice();

    this.inputQueue = [];
    this.outputQueue = [];

    this.counter = 0;
    this.parameterModes = [];
    this.resetFlags();
  }

  resetFlags() {
    this.flags = {
      halt: false,
      jump: false,
      output: false,
    };
  }

  async step() {
    this.resetFlags();

    const opcode = this.pos(this.counter);

    const instructionCode = opcode % 100;
    const instruction = Intcode.OPCODES[instructionCode];
    if(!instruction) {
      throw new Error(`Unknown opcode ${opcode} at ${this.counter}`);
    }

    // modes are encoded in the opcode, starting from the hundreds digit and moving *left*
    // any modes not explicitly there are implicitly 0
    const explicitModes = String(opcode).split('').reverse().slice(2).map(x => +x);
    this.parameterModes = Array(instruction.args).fill(0).map((_, ix) => ix < explicitModes.length ? explicitModes[ix] : 0);

    const args = this.nom(instruction.args);
    await instruction.fn(args, this);

    if(!(this.flags.jump || this.flags.halt)) {
      this.counter += instruction.args + 1;
    }
  }

  async run(input = []) {
    this.inputQueue.push(...input);
    this.resetFlags();

    while(!this.flags.halt) {
      await this.step();
    }
  }

  async* sprint(inputQueue = []) {
    this.inputQueue.push(...inputQueue);
    this.resetFlags();

    while(true) {
      await this.step();

      if(this.flags.output) {
        const input = yield this.outputQueue.shift();
        this.inputQueue.push(...input);
      }

      if(this.flags.halt) {
        return;
      }
    }
  }

  param(val, ix) {
    const mode = this.parameterModes[ix];
    switch(mode) {
      case 0:
        // position mode: get the value at this location in memory
        return this.pos(val);
      case 1:
        // immediate mode: use this value literally
        return val;
      default:
        throw new Error(`Invalid parameter mode: ${mode} for parameter ${ix} (value ${val})`);
    }
  }

  pos(ix) {
    return this.memory[ix];
  }

  put(ix, val) {
    this.memory[ix] = val;
  }

  jump(ix) {
    this.counter = ix;
    this.flags.jump = true;
  }

  nom(times = 1) {
    return this.memory.slice(this.counter + 1, this.counter + times + 1);
  }

  input() {
    if(this.inputQueue.length > 0) {
      return this.inputQueue.shift();
    } else {
      throw new Error(`No input to take`);
    }
  }

  output(val) {
    this.outputQueue.push(val);
    this.flags.output = true;
  }

  static OPCODES = {
    1: {
      name: 'add',
      args: 3,
      fn: ([x, y, d], cpu) => { cpu.put(d, cpu.param(x, 0) + cpu.param(y, 1)); }
    },
    2: {
      name: 'mul',
      args: 3,
      fn: ([x, y, d], cpu) => { cpu.put(d, cpu.param(x, 0) * cpu.param(y, 1)); }
    },
    3: {
      name: 'inp',
      args: 1,
      fn: ([d], cpu) => { cpu.put(d, cpu.input()); }
    },
    4: {
      name: 'out',
      args: 1,
      fn: ([s], cpu) => { cpu.output(cpu.param(s, 0)); }
    },
    5: {
      name: 'jnz', // a.k.a. jump-if-true
      args: 2,
      fn: ([t, c], cpu) => { if(cpu.param(t, 0) !== 0) { cpu.jump(cpu.param(c, 1)); } },
    },
    6: {
      name: 'jez',
      args: 2,
      fn: ([t, c], cpu) => { if(cpu.param(t, 0) === 0) { cpu.jump(cpu.param(c, 1)); } },
    },
    7: {
      name: 'tlt',
      args: 3,
      fn: ([a, b, d], cpu) => { cpu.put(d, cpu.param(a, 0) < cpu.param(b, 1) ? 1 : 0); }
    },
    8: {
      name: 'teq',
      args: 3,
      fn: ([a, b, d], cpu) => { cpu.put(d, cpu.param(a, 0) === cpu.param(b, 1) ? 1 : 0); }
    },
    99: {
      name: 'halt',
      args: 0,
      fn: (_, cpu) => { cpu.flags.halt = true; }
    },
  };
}

export { Intcode };
