function isPlainObject(obj) {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    !(obj instanceof Array)
  );
}

// only works on plain objects with no fancy types inside
function deepEquals(a, b) {
  if(typeof a !== typeof b) { return false; }

  if(isPlainObject(a) && isPlainObject(b)) {
    if(!arrayEquals(Object.keys(a).sort(), Object.keys(b).sort())) { return false; }
    for(let key of Object.keys(a)) {
      if(!deepEquals(a[key], b[key])) { return false; }
    }

    return true;
  }

  if(a instanceof Array && b instanceof Array) {
    return arrayEquals(a, b);
  }

  if(Number.isNaN(a) && Number.isNaN(b)) {
    return true;
  }

  return a === b;
}

function arrayEquals(a, b) {
  if(a.length !== b.length) { return false; }
  for(let i = 0; i < a.length; ++i) {
    if(!deepEquals(a[i], b[i])) { return false; }
  }

  return true;
}

export {
  isPlainObject,
  deepEquals
};
