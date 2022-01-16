function uniquify(arr, compareFn = (a, b) => a === b) {
  const uniques = [];
  for(let el of arr) {
    if(!uniques.some(candidate => compareFn(el, compareFn))) {
      uniques.push(el);
    }
  }
  return uniques;
}

export {
  uniquify,
};
