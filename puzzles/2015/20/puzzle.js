import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';
import { sum, product } from '#utils/maths';
import { combine, uniquify } from '#utils/arr';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  const target = parseInput(input);

  let houseNumber = 2;
  while(sumPrimeFactors(primeFactorize(houseNumber)) * 10 < target) {
    ++houseNumber;
  }

  return houseNumber;
}

async function* part2(input, options = {}) {
  const target = parseInput(input);

  // time to brute force this
  const maxHouseNumber = 10e6;
  let house;
  for(house = 1; house < maxHouseNumber; ++house) {
    let presents = 0;
    for(let elf = 1; elf <= house; ++elf) {
      if(house % elf === 0 && house <= (elf * 50)) {
        presents += elf * 11;
      }
    }

    if(presents >= target) {
      break;
    }
  }

  return house;
}

function parseInput(input) {
  return +input.trim();
}

function primeFactorize(n) {
  // I looked up some better ways to do this but they sound hard to code soooooo
  // unless this takes a ton of time, I'm just gonna do it Eratosthenes-style (with a couple optimizations)
  const factors = [];

  // if we do this out here, we can skip every even number in the loop below
  while(n % 2 === 0) {
    factors.push(2);
    n /= 2;
  }

  for(let i = 3; n > 1; i += 2) {
    while(n % i === 0) {
      factors.push(i);
      n /= i;
    }
  }

  if(factors.length === 0) {
    factors.push(n);
  }

  return factors;
}

function sumPrimeFactors(primeFactorization) {
  primeFactorization = primeFactorization.sort();

  const factors = primeFactorization.reduce((factors, prime) => factors.set(prime, (factors.get(prime) || 0) + 1), new Map());
  const factorSums = [...factors.keys()].map(prime => {
    const exponent = factors.get(prime);
    const powers = [];
    for(let i = 0; i <= exponent; ++i) {
      powers.push(prime ** i);
    }
    return sum(powers);
  });

  return product(factorSums);
}

export default { part1, part2 };
