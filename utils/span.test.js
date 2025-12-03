import { normalizeRanges } from "./span.js";

const cases = [
  {
    input: [
      [0, 4],
      [3, 6]
    ],
    output: [
      [0, 6]
    ]
  },

  {
    input: [
      [4, 6],
      [0, 2],
    ],
    output: [
      [0, 2],
      [4, 6]
    ]
  },

  {
    input: [
      [0, 4],
      [8, 10],
      [7, 9]
    ],
    output: [
      [0, 4],
      [7, 10]
    ]
  },

  {
    input: [
      [0, 5],
      [10, 15],
      [20, 25],
      [30, 35],
      [3, 12],
      [25, 30],
    ],
    output: [
      [0, 15],
      [20, 30]
    ]
  },

  {
    input: [
      [0, 10],
      [20, 30],
      [40, 50],
      [60, 70],
      [5, 15],
      [25, 35],
      [5, 25],
      [45, 65],
      [35, 45],
    ],
    output: [
      [0, 70]
    ]
  },
];

function test(fn, testCase) {
  const expected = testCase.output;
  console.log('expected', expected);

  const actual = fn(testCase.input);
  console.log('actual', actual);
}

function main() {
  for(const c of cases) {
    test(normalizeRanges, c);
  }
}

main();