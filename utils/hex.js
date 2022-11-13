// We'll be using the axial coordinate system from https://www.redblobgames.com/grids/hexagons/
// With flat-topped hexes:
//   q measures how many N-S columns you are RIGHT of center
//   r measures how many NW-SE columns you are LEFT of center
// With point-topped hexes, everything rotates 60 degrees counterclockwise:
//   q measures how many NW-SE columns you are RIGHT of center
//   r measures how many W-E columns you are BELOW center

class Hex {
  constructor(q = 0, r = 0) {
    this.q = q;
    this.r = r;
  }

  // s is needed to make some calculations nicer
  // s is how many NE-SW columns you are LEFT of center, in either orientation
  get s() {
    return -(this.q + this.r);
  }

  step([q, r]) {
    this.q += q;
    this.r += r;

    return this;
  }

  distanceFrom(start) {
    return Math.max(
      Math.abs(start.q - this.q),
      Math.abs(start.r - this.r),
      Math.abs(start.s - this.s),
    );
  }

  toArray() {
    return [q, r];
  }

  toString() {
    return this.toArray().join(',');
  }
}

const FLAT_STEPS = {
  N:  [0, -1],
  NE: [1, -1],
  SE: [1, 0],
  S:  [0, 1],
  SW: [-1, 1],
  NW: [-1, 0],
};

const POINTY_STEPS = {
  E:  [1, 0],
  SE: [0, 1],
  SW: [-1, 1],
  W:  [-1, 0],
  NW: [0, -1],
  NE: [1, -1],
};

export {
  Hex,
  FLAT_STEPS,
  POINTY_STEPS,
};
