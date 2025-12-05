export type Range = [number, number];

function overlaps([lo1, hi1]: Range, [lo2, hi2]: Range) {
  return !(lo1 > hi2 || hi1 < lo2);
}

function contains([outside_lo, outside_hi]: Range, [inside_lo, inside_hi]: Range): boolean {
  return outside_lo <= inside_lo && outside_hi >= inside_hi;
}

function combine([lo1, hi1]: Range, [lo2, hi2]: Range): Range {
  return [
    Math.min(lo1, lo2),
    Math.max(hi1, hi2),
  ]
}

function normalizeRanges(ranges: Range[]) {
  const sorted = ranges.sort((a, b) => a[0] - b[0]);

  const normalized: Range[] = [];
  for(const range of sorted) {
    if(normalized.length === 0) {
      normalized.push(range);
      continue;
    }

    const last = normalized.at(-1)!;
    if(last[0] <= range[0] && range[0] <= last[1]) {
      normalized[normalized.length - 1] = combine(last, range);
    } else {
      normalized.push(range);
    }
  }

  return normalized;
}

export {
  overlaps, contains, combine, normalizeRanges
}
