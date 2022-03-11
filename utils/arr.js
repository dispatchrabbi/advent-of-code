import { randomInt } from '#utils/maths';

function uniquify(arr, compareFn = (a, b) => a === b) {
  const uniques = [];
  for(let el of arr) {
    if(!uniques.some(candidate => compareFn(el, candidate))) {
      uniques.push(el);
    }
  }
  return uniques;
}

function transpose(arr) {
  const transposed = [];
  for(let row = 0; row < arr.length; ++row) {
    for(let col = 0; col < arr[row].length; ++col) {
      if(! (transposed[col] instanceof Array)) { transposed[col] = []; }
      transposed[col][row] = arr[row][col];
    }
  }

  return transposed;
}

function permute(arr) {
  if(arr.length === 1) { return [ arr ]; }

  let permutations = [];
  for(let el of arr) {
    permutations = permutations.concat(...permute(arr.filter(x => x !== el)).map(subpermutation => [el, ...subpermutation]));
  }

  return permutations;
}

function combine(arr) {
  const clone = arr.slice();

  if(clone.length === 1) {
    return [ clone ];
  }

  const first = clone.pop();
  const subcombinations = combine(clone);

  let combinations = [ [first] ];
  combinations = combinations.concat(subcombinations);
  combinations = combinations.concat(subcombinations.map(combo => [ first, ...combo ]));

  return combinations;
}

function shuffle(arr) {
  const shuffled = [];
  const clone = arr.slice();

  while(clone.length > 0) {
    shuffled.push(...clone.splice(randomInt(0, clone.length), 1));
  }

  return shuffled;
}

function cmp(a, b) {
  if(a < b) { return -1; }
  if(a > b) { return  1; }
  return 0;
}

export {
  uniquify,
  transpose,
  permute, combine,
  shuffle,
  cmp,
};
