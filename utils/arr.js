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

  const permutations = [];
  for(let el of arr) {
    permutations.push(...permute(arr.filter(x => x !== el)).map(subpermutation => [el, ...subpermutation]));
  }

  return permutations;
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
  permute,
  shuffle,
};
