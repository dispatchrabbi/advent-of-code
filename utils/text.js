import { mod } from '#utils/maths';

function rot(str, shift) {
  const CHAR_CODES = {
    'A': 'A'.charCodeAt(0),
    'Z': 'Z'.charCodeAt(0),
    'a': 'a'.charCodeAt(0),
    'z': 'z'.charCodeAt(0),
  };

  shift = mod(shift, 26);
  return str.split('').map(char => {
    let charCode = char.charCodeAt(0);
    if((charCode >= CHAR_CODES['A'] && charCode <= CHAR_CODES['Z']) || (charCode >= CHAR_CODES['a'] && charCode <= CHAR_CODES['z'])) {
      const baseLetter = char === char.toUpperCase() ? CHAR_CODES['A'] : CHAR_CODES['a'];
      charCode = ((charCode + shift - baseLetter) % 26) + baseLetter;
    }

    return String.fromCharCode(charCode);
  }).join('');
}

export {
  rot
};
