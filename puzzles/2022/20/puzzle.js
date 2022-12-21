import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

import { mod, sum } from '#utils/maths';
import { rotate } from '#utils/arr';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const encrypted = parseInput(input);

  const decrypted = decrypt(encrypted, 1, null);
  const coords = getCoordinates(decrypted);

  // log.debug(decrypted, coords);
  return sum(coords);
}

async function* part2(input, options = {}) {
  const encrypted = parseInput(input);

  const DECRYPTION_KEY = 811589153;
  const decrypted = decrypt(encrypted, 10, DECRYPTION_KEY);
  const coords = getCoordinates(decrypted);

  // log.debug(decrypted, coords);
  return sum(coords);
}

function parseInput(input) {
  return input.trim().split('\n').map(x => +x);
}

function decrypt(encrypted, rounds = 10, key = null) {
  // the most tricky thing here is that we have go in order of the old file,
  // using the new positions - and the numbers in the list aren't unique, so
  // we can't use a simple array

  // first, figure out where 0 is, so we can offset everything from that
  const zeroOffset = encrypted.indexOf(0);

  // change indexes to put zero at the front.
  // zero never moves, so only keep track of the indexes of the other numbers
  // we also need the original index because that's the order to move the numbers around in
  let numbers = rotate(encrypted, -zeroOffset).slice(1).map((n, ix, arr) => ({ n, ix, originalIx: mod(ix + zeroOffset, arr.length) }));

  if(key !== null) {
    numbers.forEach(num => num.n *= key);
  }

  for(let round = 1; round <= rounds; ++round) {
    numbers = mix(numbers);
  }

  return [ 0, ...numbers.sort((a, b) => a.ix - b.ix).map(num => num.n) ];
}

function mix(numbers) {
  for(let num of numbers.sort((a, b) => a.originalIx - b.originalIx)) {

    // on new list:
    // new pos = (old pos + steps forward) % (list length)
    const oldIx = num.ix;
    const newIx = mod(num.ix + num.n, numbers.length);

    // everything with index [old pos, new pos] (inclusive) steps (sign * 1) steps
    if(newIx > oldIx) {
      // so: if(new pos > old pos) { [old + 1, new ] (incl) all have new ix: ix-1 }
      numbers.forEach(nb => nb.ix += (nb.ix > oldIx && nb.ix <= newIx ? -1 : 0));
    } else if(newIx < oldIx) {
      // so: if(new pos < old pos) { [new, old - 1 ] (incl) all have new ix: ix+1 }
      numbers.forEach(nb => nb.ix += (nb.ix >= newIx && nb.ix < oldIx ? 1 : 0));
    } // if it's the same, nothing moves

    num.ix = newIx;
  }

  return numbers;
}

function formatMidMixNumbers(nums) {
  return [0, ...nums.slice().sort((a, b) => a.ix - b.ix).map(num => num.n)].join(', ');
}

function getCoordinates(decrypted) {
  return [ decrypted[1000 % decrypted.length], decrypted[2000 % decrypted.length], decrypted[3000 % decrypted.length] ];
}

export default { part1, part2 };
