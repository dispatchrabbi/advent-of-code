# advent-of-code

This is a repository to house all my attempts at solving the [Advent of Code](adventofcode.com/) puzzles, along with some scaffolding and utilities to help with recurring concepts in those problems.

In my solutions to these problems, I'm following a few general ~~rules~~ guidelines:

* These solutions do not necessarily represent my best code form. I'm trying to get the puzzle done relatively nicely, but I don't expect anyone to need to read or maintain my code, so it's allowed to be ugly, clever, inelegant, and messy if needed. I'm likely not even going to lint the repo.
* As much as possible, I want to solve these problems using my own brain and code that I wrote. That means that, if I need to find the shortest path across a graph, I _can_ do a search and discover that A* is a good way to do that, but I have to implement it myself. Any package or library I import (that I did not write) should be irrelevant to the substance of the problem (e.g., a library to help with coloring output or creating a test harness).
* I will have fun! If what I'm doing isn't fun, I'll do something else.

## Installing

After cloning the repository, install dependencies:

```
$ npm install
```

You will also need to create a _.env_ file:

```
$ cp ./.env.example ./.env
```

and populate the appropriate variables.

| Variable | Example | Description |
| --- | --- | --- |
| `AOC_SESSION_COOKIE` | `session=000000...000` | A valid session cookie from your logged-in session at adventofcode.org. Get this via the Network panel in your favorite browser DevTools. |
| `USER_AGENT_CONTACT_INFO` | `github.com/yourname/aoc by you@example.com` | Contact info (such as an email address and this repo) to include in the User-Agent header of requests to AOC. Why? Because [the creator asked us to](https://www.reddit.com/r/adventofcode/comments/z9dhtd/please_include_your_contact_info_in_the_useragent/). |
| `DOWNLOAD_INPUTS` | `1` | Whether to download the input file when creating a new puzzle directory. `0` disables; `1` enables. |
| `EXCLUDE_YEARS` | `2021,2022` | A comma-separated list of years to ignore when creating a new puzzle. Useful when doing puzzles in past years. Leave blank when working on the current year. |

## Running a puzzle solution

```
$ node ./index.js [options] [YEAR-DAY-]PART
$ node ./index.js run [options] [YEAR-DAY-]PART
```

For example, to run Part 1 from Day 13 of the 2021 challenge, run:

```
$ node ./index.js 2021-13-1
```

> If `YEAR` and `DAY` are not specified, the most recent puzzle will be run. `PART` must always be specified. Thus, during the actual Advent of Code event, you can run your solution with `node ./index.js run 1` or `node ./index.js run 2`.

Many of the challenges come with example inputs to help you solve and troubleshoot, along with the real input. By default, only the real input is run. You can change that with `--inputs` and `--file`:

- `--inputs=<TYPE>`: (Default: `real`) Run the puzzle with the given inputs. Options: `real`, `tests`, `all`.
- `--file=<FILE>`: Run the puzzle using the given file as the real input. `<FILE>` is relative to the puzzle directory, so it will likely be something like `input.txt` or `test.txt`. Won't do much if used with `--inputs=tests`.

You can also change the verbosity of the logging from within puzzle solutions (which means you can leave logs in the solution without having to see them all the time):

- `--logs=<LEVEL>`: (Default: `warn`) Show only logs at `<LEVEL>` or higher. Options: `trace`, `debug`, `info`, `warn`, `error`, `silent`.
- `--debug`: Does the same thing as `--logs=debug`.
- `--silent`: Does the same thing as `--logs=silent`.

## Writing a puzzle

In order to start on a new puzzle, run:

```
$ node ./index.js new <YEAR> <DAY>
```

> If `YEAR` and `DAY` aren't given, this command will create the next puzzle in the most recent year. If `YEAR` is given, the next puzzle in that year will be created. Thus, during the actual Advent of Code event, every day starts with `node ./index.js new` and you don't have to think about it.

This will pre-populate some useful files (e.g., the contents of _skel/_) in _./<YEAR>/<DAY>_, including:

* _puzzle.js_, to actually write the code in.
* _input.txt_, for the real puzzle input.
* _test.txt_, for an example input (as most puzzles have at least one).
* _expected.json_, to list inputs to test and what their outputs should be.

Each _puzzle.js_ is expected to export two `async` functions named `part1` and `part2`.

### Input file names

There are a few conventions regarding input filenames:

* _input.txt_ is reserved for the real puzzle input. Use a different name ending in _.txt_ for test inputs.
* If for some reason a puzzle has different real inputs for the two parts, use _input.part1.txt_ and _input.part2.txt_.

### Adding expected output

In order to check the output for the inputs to a puzzle, you can add the expected output in that puzzle's _expected.json_. That file has the following format:

```json
[
  ...
  { "part": 1, "file": "test.txt", "output": 12345, "options": { "rounds": 100 } },
  ...
]
```

Where:
* `"part"` indicates which part the output is for,
* `"file"` indicates while input file the output is for, and
* `"output"` is the output expected from the part given that input (optional)
* `"options"` is an object that will be passed to the `partX` function, useful for when the examples don't quite use the same parameters as the real question (optional)

### Debugging output

Logging is available via the `log` object inside each puzzle file. By using this instead of `console` directly, you can leave logging directly in the solution but not need to see it each time the solution is run. It also means you can use the full suite of log levels within the context of a solution without worrying about how they affect outside logging.

See `--logs` and associated options above to change the logging that appears when you run a puzzle.

Additionally, each `partX` puzzle function can be a generator function. If you want to show intermediate progress (or create a cool animation), `yield` an object with `frame` and `msg` properties. These will be shown and live-updated on the command line while the puzzle runs.

## Structure

There are a few directories in this repo to know about:

* _lib_ is where the files needed to run the puzzle runner are kept; they shouldn't be needed for puzzle-solving
* _skel_ is the skeleton directory that `node ./index.js new` copies for a new day
* _utils_ is for utilities meant to be used in puzzle-solving, such as algorithms or common data structures

## TODO

* [ ] Test the scaffold (ha)
* [ ] Star-counting mode: add expected outputs for _input.txt_ to _expected.json_ and thus display star counts per year
* [ ] Add option to pass input via STDIN
* [ ] Make it less clunky to create and run puzzles

Years:

* [x] 2015
* [ ] 2016
* [ ] 2017
* [ ] 2018
* [ ] 2019
* [ ] 2020
* [x] 2021
