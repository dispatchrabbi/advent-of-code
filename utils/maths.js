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

export {
  sum, sumReducer,
  product, productReducer,
  isNumeric,
  randomInt
};
