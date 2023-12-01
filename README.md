# advent-of-code

This repository houses my solutions to the [Advent of Code](adventofcode.com/) puzzles, along with some scaffolding and utilities to help with recurring concepts in those problems.

In my solutions to these problems, I'm following a few general ~~rules~~ guidelines:

* These solutions do not necessarily represent my best code form. I'm trying to get the puzzle done relatively nicely, but I don't expect anyone to need to read or maintain my code, so it's allowed to be ugly, clever, inelegant, and messy if needed. I'm likely not even going to lint the repo.
* As much as possible, I want to solve these problems using my own brain and code that I wrote. That means that, if I need to find the shortest path across a graph, I _can_ do a search and discover that A* is a good way to do that, but I have to implement it myself. Any package or library I import (that I did not write) should be irrelevant to the substance of the problem (e.g., a library to help with coloring output or creating a test harness).
* I will have fun! If what I'm doing isn't fun, I'll do something else.

## Installation and configuration

After cloning the repository, install dependencies:

```sh
npm install
```

Next, create a _.env_ file...

```sh
cp ./.env.example ./.env
```

...and populate the appropriate variables.

| Variable | Example | Description |
| --- | --- | --- |
| `EXCLUDE_YEARS` | `2021,2022` | A comma-separated list of years to ignore when determining the most recent year. Useful when doing puzzles in past years. Leave blank when working on the current year. |
| `AOC_SESSION_COOKIE` | `session=000000...000` | A valid session cookie from your logged-in session at adventofcode.org. Get this via the Network panel in your favorite browser DevTools. |
| `USER_AGENT_CONTACT_INFO` | `github.com/yourname/aoc by you@example.com` | Contact info (such as an email address and this repo) to include in the User-Agent header of requests to AOC. Why? Because [the creator asked us to](https://www.reddit.com/r/adventofcode/comments/z9dhtd/please_include_your_contact_info_in_the_useragent/). |
| `DOWNLOAD_INPUTS` | `1` | Whether to download the input file when creating a new puzzle directory. `0` disables; `1` enables. |

## Puzzle quick start

1. Run `./aoc new`. This sets up a new puzzle directory for the first missing puzzle in the current year, and (optionally) downloads your puzzle input.
2. Add test cases from the puzzle text into _expected.json_ and _test.txt_.
3. Write your puzzle solution.
4. Test the solution with `./aoc test`.
5. Run the solution against the real input with `./aoc run`.
6. Submit the solution with `./aoc submit`.

For more details, read on.

## Puzzle structure

In your puzzle directory, there are a few different files (copied in from _skel/_):

- _puzzle.js_: Your puzzle solution
- _input.txt_: Your puzzle input
- _expected.json_: Expected answers for given test input files
- _test.txt_ and other .txt files: Test input files, from the puzzle or otherwise

### puzzle.js

The `part1()` and `part2()` functions should return the answer for their given part.

These functions are actually generators. If you `yield` an object with shape `{ frame: String, msg: String }` (which is produced from the `frame()` convenience function that's been imported), the console will display the `frame` and add `msg` to the end of the status line. Subsequent yielded objects will overwrite previous frames and status messages. This is a good way to output a visualization. If you don't need this functionality, don't worry about it.

When run, the `partX()` function is passed the puzzle or test input and an `options` object. For testing, the `options` object can be set in _expected.json_. When running the real puzzle input, `undefined` will be passed, so use default values if you need a particular option set.

Each `partX()` function automatically calls a `parseInput()` function, which can be modified to fit the needs of the puzzle.

Additionally, a logger is provided so you can output debug logs with `log.debug()`. By using this instead of `console` directly, you can leave logging directly in the solution but not need to see it each time the solution is run. `chalk` is also provided for color-coding output if desired.

### expected.json

This JSON file holds an array of test cases for your puzzles. Each test case is an object with the following shape:

```json
{
  "part": 1,
  "file": "test.txt",
  "output": 0,
  "options": { }
}
```

Where:
- `"part"` indicates which part the output is for (`1` or `2`),
- `"file"` indicates while input file the output is for
- `"output"` is the output expected from the part given that input (optional)
- `"options"` is an object that will be passed to the `partX` function; read on for usage (optional)

Sometimes a test case differs from the real puzzle in a way other than the input. If that's the case, you can specify an `options` object to be passed as a parameter to the `partX()` functions in _puzzle.js_ so that your solution can handle it differently. See above for more details.

You can have any number of test cases for each part, including zero. The file name likewise has no restrictions, but the file is assumed to be in the puzzle directory.

### input.txt and test.txt

_input.txt_ is reserved for the real puzzle input. If `DOWNLOAD_INPUTS` is set to `1`, this will be downloaded for you automatically. If for some reason you need the two parts of the puzzle use different inputs, use _input.part1.txt_ and _input.part2.txt_.

Test case input can have any filename that isn't _input.txt_, but by convention begins with _test_ and ends with _.txt_.

## Utilities

There are a wealth of utility functions available for use in puzzles, mostly for concepts that keep popping up. They are located under _utils/_ and can be imported with the `#utils` alias. For example:

```js
import { sum } from '#utils/maths';
```

## CLI usage details

There are four subcommands you can run:

```sh
# create a new puzzle folder
./aoc new [YEAR/DAY] [options]

# run a puzzle
./aoc run [YEAR/DAY/]PART [options]

# run a puzzle's test cases
# this is an alias for ./aoc run --tests
./aoc test [YEAR/DAY/]PART [options]

# submit the puzzle answer to adventofcode.com
# this is an alias for ./aoc run --submit
./aoc submit [YEAR/DAY/]PART [options]
```

If `YEAR` and `DAY` are omitted, then the command tries to be helpful:
- The most recent year for which there is a folder (excluding years in the `EXCLUDE_YEARS` env var) will be used.
- For `new`, the lowest day for which there is no folder (i.e., the "next" day) in that year will be used.
- For other subcommands, the highest day for which there is a folder will be used.

With these defaults, you shouldn't need to pass any year or day parameters during the actual Advent of Code event (or if you're working linearly through the back catalog).

These are the options available:

| Option | Description |
| --- | --- |
| `--tests` | Used with `run`. Run the test cases for the puzzle instead of the real input. The `test` subcommand is an alias for passing this option. |
| `--debug` | Enables debug logging within puzzles. On by default if `--tests` is passed; off otherwise. |
| `--silent` | Disables debug logging within puzzles. Used with `--tests`. |
| `--submit` | Used with `run`. Submit the answer to adventofcode.com after the puzzle is run. The `submit` subcommand is an alias for passing this option. This option has no effect if used with `--tests`. |

## TODO

* [x] Make it less clunky to create and run puzzles
* [ ] Grab private leaderboard status and display it after submission
* [ ] Star-counting mode: add expected outputs for _input.txt_ to _expected.json_ and thus display star counts per year
* [ ] Allow multiple sign-ins to verify your code against multiple inputs (a la https://github.com/wimglenn/advent-of-code-data#verify-your-code-against-multiple-different-inputs)
* [ ] Test the scaffold (ha)

## Years:

* [x] 2015
* [ ] 2016
* [x] 2017
* [ ] 2018
* [ ] 2019
* [ ] 2020
* [x] 2021
* [x] 2022
* [ ] 2023
