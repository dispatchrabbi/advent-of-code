import { randomInt, mod } from '#utils/maths';

function uniquify<T>(arr: T[], equalFn = (a: T, b: T): boolean => a === b) {
  const uniques: T[] = [];
  for(let el of arr) {
    if(!uniques.some(candidate => equalFn(el, candidate))) {
      uniques.push(el);
    }
  }
  return uniques;
}

function intersect(arr1, arr2, equalFn) {
  if(equalFn) {
    return uniquify(arr1.filter(el1 => arr2.some(el2 => equalFn(el1, el2))), equalFn);
  } else {
    return uniquify(arr1.filter(el => arr2.includes(el)));
  }
}

function outersect(arr1, arr2, equalFn) {
  const intersection = intersect(arr1, arr2, equalFn);
  return arr1.concat(arr2).filter(el => !intersection.some(il => equalFn(el, il)));
}

function transpose<T>(arr: T[][]): T[][] {
  const transposed: T[][] = Array(arr[0].length).fill(null).map(() => []);
  for(let row = 0; row < arr.length; ++row) {
    for(let col = 0; col < arr[row].length; ++col) {
      transposed[col][row] = arr[row][col];
    }
  }

  return transposed;
}

function rotate(arr, places) {
  places = mod(places, arr.length);
  return arr.slice(-places).concat(arr.slice(0, -places));
}

function permute<T>(arr: T[]) {
  if(arr.length === 1) { return [ arr ]; }

  let permutations: T[][] = [];
  for(let el of arr) {
    permutations = permutations.concat(permute(arr.filter(x => x !== el)).map(subpermutation => [el, ...subpermutation]));
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

function shuffle<T>(arr: T[]) {
  const shuffled: T[] = [];
  const clone = arr.slice();

  while(clone.length > 0) {
    shuffled.push(...clone.splice(randomInt(0, clone.length), 1));
  }

  return shuffled;
}

function chunk<T>(arr: T[], size: number, padding: T | undefined = undefined) {
  if(padding === undefined && (arr.length % size !== 0)) {
    throw new Error(`arr (length ${arr.length}) is not evenly divisible by chunk size (${size}) and no padding value was given`);
  }

  const chunks: T[][] = [];
  for(let i = 0; i < arr.length; i += size) {
    const ch = arr.slice(i, i + size);
    chunks.push(ch.length < size ? ch.concat(Array(size - ch.length).fill(padding)) : ch);
  }

  return chunks;
}

function counts(arr) {
  return arr.reduce((counts, el) => {
    counts[el] = (counts[el] || 0) + 1;
    return counts;
  }, {});
}

function cmp(a, b) {
  if(a < b) { return -1; }
  if(a > b) { return  1; }
  return 0;
}

export {
  uniquify, intersect, outersect,
  transpose, rotate,
  permute, combine,
  shuffle,
  chunk, counts,
  cmp,
};
