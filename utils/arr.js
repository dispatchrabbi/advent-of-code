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

export {
  uniquify,
  permute, combine,
  shuffle,
};
