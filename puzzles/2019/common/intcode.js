import chalk from "chalk";
import loglevel from 'loglevel';

const log = loglevel.getLogger('puzzle');

class Intcode {
  constructor(program) {
    this.memory = program.slice();

    this.counter = 0;
    this.resetFlags();
  }

  resetFlags() {
    this.flags = {
      halt: false,
    };
  }

  async step() {
    this.resetFlags();

    const opcode = this.pos(this.counter);
    const instruction = Intcode.OPCODES[opcode];
    if(!instruction) {
      throw new Error(`Unknown opcode ${opcode} at ${this.counter}`);
    }

    const args = this.nom(instruction.args);
    await instruction.fn(args, this);

    if(!(this.flags.jump || this.flags.halt)) {
      this.counter += instruction.args + 1;
    }
  }

  async run() {
    this.resetFlags();

    while(!this.flags.halt) {
      await this.step();
    }
  }

  pos(ix) {
    return this.memory[ix];
  }

  put(ix, val) {
    this.memory[ix] = val;
  }

  nom(times = 1) {
    return this.memory.slice(this.counter + 1, this.counter + times + 1);
  }

  static OPCODES = {
    1: {
      name: 'add',
      args: 3,
      fn: ([x, y, d], cpu) => { cpu.put(d, cpu.pos(x) + cpu.pos(y)); }
    },
    2: {
      name: 'mul',
      args: 3,
      fn: ([x, y, d], cpu) => { cpu.put(d, cpu.pos(x) * cpu.pos(y)); }
    },
    99: {
      name: 'halt',
      args: 0,
      fn: (_, cpu) => { cpu.flags.halt = true; }
    },
  };
}

export { Intcode };
