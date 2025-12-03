function overlaps([lo1, hi1], [lo2, hi2]) {
  return !(lo1 > hi2 || hi1 < lo2);
}

function contains([outside_lo, outside_hi], [inside_lo, inside_hi]) {
  return outside_lo <= inside_lo && outside_hi >= inside_hi;
}

function combine([lo1, hi1], [lo2, hi2]) {
  return [
    Math.min(lo1, lo2),
    Math.max(hi1, hi2),
  ]
}

function normalizeRanges(ranges) {
  let out = [];
  
  for(const range of ranges) {
    let combined = false;

    for(let i = 0; i < out.length; ++i) {
      if(overlaps(range, out[i])) {
        out[i] = combine(out[i], range);
        combined = true;
        break;
      }
    }

    if(!combined) {
      out.push(range);
    }
  }

  if(out.length < ranges.length) {
    // we simplified at least once, let's try again
    out = normalizeRanges(out);
  }

  out.sort((a, b) => a[0] - b[0]);
  return out;
}

export {
  overlaps, contains, combine, normalizeRanges
}
