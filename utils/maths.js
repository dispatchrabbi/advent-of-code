function sum(arr) {
  return arr.reduce((total, num) => total + num, 0);
}

function isNumeric(str) {
  return str == +str;
}

export {
  sum,
  isNumeric
};
