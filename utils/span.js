function overlaps([lo1, hi1], [lo2, hi2]) {
  return !(lo1 > hi2 || hi1 < lo2);
}

function contains([outside_lo, outside_hi], [inside_lo, inside_hi]) {
  return outside_lo <= inside_lo && outside_hi >= inside_hi;
}

export {
  overlaps, contains
}
