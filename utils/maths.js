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

export {
  sum, sumReducer,
  product, productReducer,
  isNumeric
};
