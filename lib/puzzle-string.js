import commander from 'commander';

function validateYear(year) {
  return year >= 2015;
}

function validateDay(day) {
  return day >= 1 && day <= 25;
}

function validatePart(part) {
  return part === 1 || part === 2;
}

function processYearDayArgument(str) {
  const parts = str.split('/').map(x => +x);

  if(parts.length !== 2) {
    throw new commander.InvalidArgumentError('Puzzle argument must be formatted as `YEAR/DAY`.');
  }

  if(!validateYear(parts[0])) {
    throw new commander.InvalidArgumentError('YEAR is invalid. Must be a 4-digit year, and 2015 or after.');
  }

  if(!validateDay(parts[1])) {
    throw new commander.InvalidArgumentError('DAY is invalid. Must be a day between 1 and 25, inclusive.');
  }

  return str;
}

function processYearDayPartArgument(str) {
  const parts = str.split('/').map(x => +x);

  if(parts.length === 3) {
    if(!validateYear(parts[0])) {
      throw new commander.InvalidArgumentError('YEAR is invalid. Must be a 4-digit year, and 2015 or after.');
    }

    if(!validateDay(parts[1])) {
      throw new commander.InvalidArgumentError('DAY is invalid. Must be a day between 1 and 25, inclusive.');
    }

    if(!validatePart(parts[2])) {
      throw new commander.InvalidArgumentError('PART is invalid. Must be either 1 or 2.');
    }
  } else if(parts.length === 1) {
    if(!validatePart(parts[0])) {
      throw new commander.InvalidArgumentError('PART is invalid. Must be either 1 or 2.');
    }
  } else {
    throw new commander.InvalidArgumentError('Puzzle argument must be formatted as `YEAR/DAY/PART` or just `PART`.');
  }

  return str;
}

function parsePuzzleString(str) {
  const decoded = { year: null, day: null, part: null };

  const parts = str.split('/').map(x => +x);
  if(parts.length === 1) {
    decoded.part = parts[0];
  } else if(parts.length === 2) {
    decoded.year = parts[0];
    decoded.day = parts[1];
  } else if(parts.length === 3) {
    decoded.year = parts[0];
    decoded.day = parts[1];
    decoded.part = parts[2];
  } else {
    throw new Error(`Invalid puzzle string: ${str}`);
  }

  return decoded;
}

export {
  validateYear, validateDay, validatePart,
  processYearDayArgument,
  processYearDayPartArgument,
  parsePuzzleString,
};
