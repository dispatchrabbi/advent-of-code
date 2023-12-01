const INTS_REGEX = /\d/g;
function ints(str) {
  return str.match(INTS_REGEX);
}

export {
  ints,
};
