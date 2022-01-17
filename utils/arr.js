function uniquify(arr, compareFn = (a, b) => a === b) {
  const uniques = [];
  for(let el of arr) {
    if(!uniques.some(candidate => compareFn(el, compareFn))) {
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

export {
  uniquify,
  permute,
};
