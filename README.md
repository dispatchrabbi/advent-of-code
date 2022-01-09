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

## Running a puzzle solution

```
$ node ./index.js [options] <YEAR> <DAY> <PART>
```

For example, to run Part 1 from Day 13 of the 2021 challenge, run:

```
$ node ./index.js 2021 13 1
```

Many of the challenges come with example inputs to help you solve and troubleshoot, along with the real input. By default, only the real input is run. You can change that with some command line flags:

- `--use-input-only`: (Default) Only run the puzzle with the real input.
- `--use-examples-only`: Only run the puzzle with the example inputs.
- `--use-input-and-examples`: Run the puzzle with the example inputs and the real input.
- `--input=<FILE>`: Run the puzzle using the given file as the input. `<FILE>` is relative to the puzzle directory, so it will likely be something like `input.txt` or `example.txt`.

By default, the puzzle runner will time each input. You can control this with these flags:

* `--timer`: (Default) Display the time for each input's run
* `--no-timer`: Do not display the time for each input's run

You can also change the verbosity of the output:

- `--log-level=<LEVEL>`: (Default: info) Show only logs at `<LEVEL>` or higher. Options: `trace`, `debug`, `info`, `warn`, `error`, `silent`.
- `--debug`: Does the same thing as `--log-level=debug`.
- `--silent`: Does the same thing as `--log-level=silent`.

## Writing a challenge

In order to start on a new challenge, run:

```
$ node ./index.js --new <YEAR> <DAY>
```

This will pre-populate some useful files in _./<YEAR>/<DAY>_, including:

* _index.js_, to actually write the code in.
* _input.txt_, for the real puzzle input.
* _example.txt_, for an example input (as most puzzles have at least one).
* _expected.json_, to add the expected output for given inputs.

Each _index.js_ is expected to export two `async` functions named `part1` and `part2`.

### Input file names

There are a few conventions regarding input filenames:

* _input.txt_ is reserved for the real puzzle input. Any other filename ending in _.txt_ will be considered an example input.
* If a filename ends in _.partX.txt_, it will only be used as an input for that part. For example, _short.part2.txt_ would be an example input only used when running part 2 of that day.
* If for some reason a puzzle has different real inputs for the two parts, use _input.part1.txt_ and _input.part2.txt_.

### Adding expected output

In order to check the output for the inputs to a puzzle, you can add the expected output in that puzzle's _expected.json_. That file has the following format:

```json
[
  ...
  { "part": 1, "file": "example.txt", "output": 12345 },
  ...
]
```

Where:
* `"part"` indicates which part the output is for,
* `"file"` indicates while input file the output is for, and
* `"output"` is the output expected from the part given that input

## Structure

There are a few directories in this repo to know about:

* _lib_ is where the files needed to run the puzzle runner are kept; they shouldn't be needed for puzzle-solving
* _skel_ is the skeleton directory that `npm run new` copies for a new day
* _utils_ is for utilities meant to be used in puzzle-solving, such as algorithms or common data structures

## TODO

* [ ] Build the scaffold
* [ ] Test the scaffold
* [ ] Port over 2021
* [ ] Star-counting mode: add expected outputs for _input.js_ to _expected.json_ and thus display star counts per year
* [ ] Step mode: Export generators for part functions (instead of async functions) in order to do step-by-step visualizations or other iterative step fun
* [ ] Add option to pass input via STDIN

Years:

* [ ] 2015
* [ ] 2016
* [ ] 2017
* [ ] 2018
* [ ] 2019
* [ ] 2020
* [ ] 2021
