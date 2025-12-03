function sum(arr) {
  return arr.reduce(sumReducer, 0);
}

function sumReducer(running, val) {
  return running + val;
}

function product(arr) {
  return arr.reduce(productReducer, 1);
}

function productReducer(running, val) {
  return running * val;
}

function isNumeric(str) {
  return str == +str;
}

// Returns a random integer between min (inclusive) and max (exclusive)
// so to roll a d6: randomInt(0, 6);
function randomInt(min, max) {
  return min + Math.floor(Math.random() * (max - min));
}

function mod(n, m) {
  return ((n % m) + m) % m;
}

// See https://en.wikipedia.org/wiki/Least_common_multiple#Calculation
function _lcm(a, b) {
  if(a === b) { return a; }

  return Math.abs(a) * (Math.abs(b) / gcd(a, b));
}

function lcm(...args) {
  return args.reduce(_lcm, 1);
}

// Stein's algorithm, from https://en.wikipedia.org/wiki/Greatest_common_divisor#Binary_GCD_algorithm
function gcd(a, b) {
  if(a === b) { return a; }
  if(a === 0) { return b; }
  if(b === 0) { return a; }

  let twos = 0;
  while (a !== b) {
    const aIsEven = a % 2 === 0;
    const bIsEven = b % 2 === 0;

    if(aIsEven && bIsEven) {
      a /= 2;
      b /= 2;
      twos += 1;
      continue;
    } else if(aIsEven) {
      a /= 2;
      continue;
    } else if(bIsEven) {
      b /= 2;
      continue;
    }

    if(a < b) { [ a, b ] = [ b, a ]; } // make sure a is always larger
    a = (a - b) / 2;
  }

  return a * Math.pow(2, twos);
}

function divisors(n) {
  const found = [];
  for(let i = 0; i <= (n/2); ++i) {
    if(n % i === 0) {
      found.push(i);
    }
  }

  return found;
}

export {
  sum, sumReducer,
  product, productReducer,
  isNumeric,
  randomInt,
  mod, lcm, gcd, divisors
};
