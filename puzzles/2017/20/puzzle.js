import chalk from 'chalk';
import loglevel from 'loglevel';
import { frame } from '#lib/puzzle-renderer';

const log = loglevel.getLogger('puzzle');

async function* part1(input, options = {}) {
  let particles = parseInput(input);

  while(particles.length > 1) {
    particles = tick(particles, { zbuffer: true });
  }

  return particles[0].ix;
}

async function* part2(input, options = {}) {
  let particles = parseInput(input);

  // check for stabilization
  // TODO: figure out a better way to determine when the number of particles is long-term stable
  let stabilityCounter = 0;
  let lastParticleCount = particles.length;
  while(stabilityCounter < 10) { // why 10? why not?
    particles = tick(particles, { collision: true });

    if(particles.length < lastParticleCount) {
      stabilityCounter = 0;
      lastParticleCount = particles.length;
    } else {
      stabilityCounter++;
    }
  }

  return particles.length;
}

function parseInput(input) {
  const INPUT_REGEX = /^p=<([-0-9]+),([-0-9]+),([-0-9]+)>, v=<([-0-9]+),([-0-9]+),([-0-9]+)>, a=<([-0-9]+),([-0-9]+),([-0-9]+)>$/;
  return input.trim().split('\n').map(line => INPUT_REGEX.exec(line)).map(([_, px, py, pz, vx, vy, vz, ax, ay, az], ix) => ({
    ix,
    p: { x: +px, y: +py, z: +pz },
    v: { x: +vx, y: +vy, z: +vz },
    a: { x: +ax, y: +ay, z: +az },
  }));
}

function formatParticle(particle) {
  const p = `p<${particle.p.x},${particle.p.y},${particle.p.z}>`;
  const v = `v<${particle.v.x},${particle.v.y},${particle.v.z}>`;
  const a = `a<${particle.a.x},${particle.a.y},${particle.a.z}>`;
  return `${particle.ix}: ${p} ${v} ${a}`;
}

function tick(particles, { zbuffer = false, collision = false }) {
  particles.forEach(tickParticle);

  if(zbuffer) {
    const gonerParticles = findGonerParticles(particles);
    particles = particles.filter(particle => !gonerParticles.includes(particle.ix));
  }

  if(collision) {
    const collidingParticles = findCollidingParticles(particles);
    particles = particles.filter(p => !collidingParticles.includes(p.ix));
  }

  return particles;
}

function findGonerParticles(particles) {
  const gonerParticles = new Set();
  for(let a = 0; a < particles.length; ++a) {
    for(let b = a + 1; b < particles.length; ++b) {
      const cmp = compare(particles[a], particles[b]);
      if(cmp === -1) {
        gonerParticles.add(particles[a].ix);
      } else if(cmp === 1) {
        gonerParticles.add(particles[b].ix);
      }
    }
  }

  return [...gonerParticles];
}

function findCollidingParticles(particles) {
  const collisionTracker = {};
  for(let particle of particles) {
    const posStr = `${particle.p.x},${particle.p.y},${particle.p.z}`;
    if(!collisionTracker[posStr]) { collisionTracker[posStr] = []; }
    collisionTracker[posStr].push(particle.ix);
  }

  return Object.values(collisionTracker).filter(arr => arr.length >= 2).flat();
}

function tickParticle(particle) {
  particle.v.x += particle.a.x;
  particle.v.y += particle.a.y;
  particle.v.z += particle.a.z;

  particle.p.x += particle.v.x;
  particle.p.y += particle.v.y;
  particle.p.z += particle.v.z;
}

// returns -1 if p1 will never get closer than p2
// returns 1 if p2 will never get closer than p1
// returns 0 if it's not clear
function compare(p1, p2) {

  const p = manhattan(p1.p) - manhattan(p2.p);
  const v = manhattan(p1.v) - manhattan(p2.v);
  const a = manhattan(p1.a) - manhattan(p2.a);

  if(p >= 0 && v >= 0 && a >= 0) {
    return -1;
  } else if(p <= 0 && v <= 0 && a <= 0) {
    return 1;
  } else {
    return 0;
  }
}

function compareAspect({ p: p1, v: v1, a: a1 }, { p: p2, v: v2, a: a2 }) {
  if((Math.sign(p1) === Math.sign(p2)) && (Math.sign(v1) === Math.sign(v2)) && (Math.sign(a1) === Math.sign(a2))) {
    if((Math.abs(p1) >= Math.abs(p2)) && (Math.abs(v1) >= Math.abs(v2)) && (Math.abs(a1) >= Math.abs(a2))) {
      return -1;
    } else if((Math.abs(p1) <= Math.abs(p2)) && (Math.abs(v1) <= Math.abs(v2)) && (Math.abs(a1) <= Math.abs(a2))) {
      return 1;
    } else {
      return 0;
    }
  } else {
    return 0;
  }
}

function manhattan({ x, y, z }) {
  return Math.abs(x) + Math.abs(y) + Math.abs(z);
}

export default { part1, part2 };
