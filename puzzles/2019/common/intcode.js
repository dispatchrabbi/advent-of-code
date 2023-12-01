import chalk from "chalk";
import loglevel from 'loglevel';

const log = loglevel.getLogger('puzzle');

class Intcode {
  constructor(program, inputDevice = new InputQueue(), outputDevice = new OutputQueue()) {
    this.memory = program.slice();

    this.inputDevice = inputDevice;
    this.outputDevice = outputDevice;

    this.relativeBase = 0;

    this.counter = 0;
    this.resetFlags();
  }

  async step() {
    this.resetFlags();

    const opcode = this.get(this.counter);

    const instructionCode = opcode % 100;
    const instruction = Intcode.OPCODES[instructionCode];
    if(!instruction) {
      throw new Error(`Unknown opcode ${opcode} at ${this.counter}`);
    }

    // modes are encoded in the opcode, starting from the hundreds digit and moving *left*
    // any modes not explicitly there are implicitly 0
    const explicitModes = String(opcode).split('').reverse().slice(2).map(x => +x);
    const modes = Array(instruction.args.length).fill(0).map((_, ix) => ix < explicitModes.length ? explicitModes[ix] : 0);

    const rawArgs = this.nom(instruction.args.length);
    const args = rawArgs.map((arg, ix) => this[instruction.args[ix]](arg, modes[ix]));
    await instruction.fn(args, this);

    if(!(this.flags.jump || this.flags.waiting || this.flags.halt)) {
      this.counter += instruction.args.length + 1;
    }
  }

  async run(initialInput) {
    if(Array.isArray(initialInput)) {
      this.inputDevice.give(...initialInput);
    }

    while(true) {
      await this.step();

      if(this.flags.waiting) {
        break;
      }

      if(this.flags.halt) {
        break;
      }
    }
  }

  // Generators in JS are a little weird, and the first call to next() doesn't allow any input
  // So here we avoid the awkward initial next() call and just return a primed generator
  async sprint() {
    const cpu = this._sprint();
    await cpu.next();

    return cpu;
  }

  async* _sprint() {
    this.resetFlags();

    const initialInput = yield null;
    if(Array.isArray(initialInput)) {
      this.inputDevice.give(...initialInput);
    }

    while(true) {
      await this.step();

      if(this.flags.output) {
        const input = yield this.outputDevice.take(1)[0];
        if(Array.isArray(input)) {
          this.inputDevice.give(...input);
        }
      }

      if(this.flags.halt) {
        return;
      }
    }
  }

  static MODES = {
    POSITION: 0,
    IMMEDIATE: 1,
    RELATIVE: 2,
  };

  val(param, mode) {
    switch(mode) {
      case Intcode.MODES.POSITION:
        // position mode: get the value at this location in memory
        return this.get(param);
      case Intcode.MODES.IMMEDIATE:
        // immediate mode: use this value literally
        return param;
      case Intcode.MODES.RELATIVE:
        // relative mode: get the value at the given location plus the relative base
        return this.get(this.relativeBase + param);
      default:
        throw new Error(`Invalid parameter mode for value param: ${mode} for parameter #${ix} (value ${param})`);
    }
  }

  addr(param, mode) {
    switch(mode) {
      case Intcode.MODES.POSITION:
        // position mode: get the value at this location in memory
        return param;
      case Intcode.MODES.RELATIVE:
        // relative mode: get the value at the given location plus the relative base
        return this.relativeBase + param;
      default:
        throw new Error(`Invalid parameter mode for addr param: ${mode} for parameter #${ix} (value ${val})`);
    }
  }

  get(ix) {
    if(ix >= this.memory.length) {
      this.memory = this.memory.concat(Array(ix + 1 - this.memory.length).fill(0));
    }

    return this.memory[ix];
  }

  set(ix, val) {
    this.memory[ix] = val;
  }

  jump(ix) {
    this.counter = ix;
    this.flags.jump = true;
  }

  nom(times = 1) {
    return this.memory.slice(this.counter + 1, this.counter + times + 1);
  }

  resetFlags() {
    this.flags = {
      halt: false,
      jump: false,
      waiting: false,
      output: false,
    };
  }

  read() {
    return this.inputDevice.read();
  }

  write(val) {
    this.outputDevice.write(val);

    this.flags.output = true;
  }

  static OPCODES = {
    1: {
      name: 'add',
      args: ['val', 'val', 'addr'],
      fn: ([x, y, d], cpu) => { cpu.set(d, x + y); }
    },
    2: {
      name: 'mul',
      args: ['val', 'val', 'addr'],
      fn: ([x, y, d], cpu) => { cpu.set(d, x * y); }
    },
    3: {
      name: 'inp',
      args: ['addr'],
      fn: ([d], cpu) => { cpu.set(d, cpu.read()); }
    },
    4: {
      name: 'out',
      args: ['val'],
      fn: ([s], cpu) => { cpu.write(s); }
    },
    5: {
      name: 'jnz', // a.k.a. jump-if-true
      args: ['val', 'val'],
      fn: ([t, c], cpu) => { if(t !== 0) { cpu.jump(c); } },
    },
    6: {
      name: 'jez',
      args: ['val', 'val'],
      fn: ([t, c], cpu) => { if(t === 0) { cpu.jump(c); } },
    },
    7: {
      name: 'tlt',
      args: ['val', 'val', 'addr'],
      fn: ([a, b, d], cpu) => { cpu.set(d, a < b ? 1 : 0); }
    },
    8: {
      name: 'teq',
      args: ['val', 'val', 'addr'],
      fn: ([a, b, d], cpu) => { cpu.set(d, a === b ? 1 : 0); }
    },
    9: {
      name: 'rel',
      args: ['val'],
      fn: ([r], cpu) => { cpu.relativeBase += r; }
    },
    99: {
      name: 'halt',
      args: [],
      fn: (_, cpu) => { cpu.flags.halt = true; }
    },
  };
}

class InputQueue {
  constructor() {
    this.queue = [];
  }

  read() {
    if(this.queue.length > 0) {
      return this.queue.shift();
    } else {
      throw new Error('No more values in the input queue!');
    }
  }

  give(...vals) {
    this.queue.push(...vals);
  }
}

class OutputQueue {
  constructor() {
    this.queue = [];
  }

  write(val) {
    this.queue.push(val);
  }

  take(n = Infinity) {
    const out = this.queue.slice(0, n);
    this.queue = this.queue.slice(n);
    return out;
  }
}

export { Intcode };
