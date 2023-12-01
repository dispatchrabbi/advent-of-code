import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { Intcode } from '../common/intcode.js';
import { permute } from '#utils/arr';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const program = parseInput(input);

  const largestOutputSignal = await findLargestThrusterOutputSignal(program);

  return largestOutputSignal;
}

async function* part2(input, options = {}) {
  const program = parseInput(input);

  const largestOutputSignal = await findLargestContinuousThrusterOutputSignal(program);

  return largestOutputSignal;
}

function parseInput(input) {
  return input.trimEnd().split(',').map(x => +x);
}

async function findLargestThrusterOutputSignal(thrusterProgram) {
  let largestOutputSignal = -Infinity;
  // let correspondingPhaseSequence = null;

  // there's a way to optimize this, but let's see if the naive way is fine first
  const phaseSequencePermutations = permute([0, 1, 2, 3, 4]);
  for(let phaseSequence of phaseSequencePermutations) {
    const outputSignal = await runThrusterProgram(thrusterProgram, phaseSequence);

    if(outputSignal > largestOutputSignal) {
      largestOutputSignal = outputSignal;
      // correspondingPhaseSequence = phaseSequence;
    }
  }

  // log.debug({ largestOutputSignal, correspondingPhaseSequence });
  return largestOutputSignal;
}

async function runThrusterProgram(thrusterProgram, phaseSequence) {
  let inputSignal = 0;

  for(let phase of phaseSequence) {
    const cpu = new Intcode(thrusterProgram);
    await cpu.run([phase, inputSignal]);
    inputSignal = cpu.outputDevice.take()[0];
  }

  return inputSignal;
}

async function findLargestContinuousThrusterOutputSignal(thrusterProgram) {
  let largestOutputSignal = -Infinity;
  let correspondingPhaseSequence = null;

  // there's a way to optimize this, but let's see if the naive way is fine first
  const phaseSequencePermutations = permute([5, 6, 7, 8, 9]);
  for(let phaseSequence of phaseSequencePermutations) {
    const outputSignal = await runContinuousThrusterProgram(thrusterProgram, phaseSequence);

    if(outputSignal > largestOutputSignal) {
      largestOutputSignal = outputSignal;
      correspondingPhaseSequence = phaseSequence;
    }
  }

  log.debug({ largestOutputSignal, correspondingPhaseSequence });
  return largestOutputSignal;
}

async function runContinuousThrusterProgram(thrusterProgram, phaseSequence) {
  const cpus = Array(phaseSequence.length).fill(null);
  let haltedCount = 0;

  let inputSignal = 0;
  let lastOutputSignalFromThrusterE = 0;

  let cpuIx = 0;
  while(haltedCount < cpus.length) {
    let value, done;
    if(!cpus[cpuIx]) {
      const c = new Intcode(thrusterProgram);
      cpus[cpuIx] = await c.sprint();

      ({ value, done } = await cpus[cpuIx].next([phaseSequence[cpuIx], inputSignal]));
    } else {
      ({ value, done } = await cpus[cpuIx].next([inputSignal]));
    }

    if(done) {
      haltedCount++;
    } else {
      inputSignal = value;
      if(cpuIx === cpus.length - 1) {
        lastOutputSignalFromThrusterE = value;
      }
    }

    cpuIx = (cpuIx + 1) % cpus.length;
  }

  return lastOutputSignalFromThrusterE;
}

export default { part1, part2 };
