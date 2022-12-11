/*
a: debug
b: num
c: upperBound
d: factor1
e: factor2
f: isComposite
g: sir not appearing in this reassembly
h: compositeCount
*/

function reassembledCoprocessor(debug = false) {
  function isPrime(num) {
    let isPrime = true;

    for(let factor1 = 2; factor1 < num; ++factor1) {
      for(let factor2 = 2; factor2 < num; ++factor2) {
        if(factor1 * factor2 === num) {
          isPrime = false;
        }
      }
    }

    return isPrime;
  }

  let num = 67;
  let upperBound = 67;

  if(!debug) {
    num = 106700;
    upperBound = 123700;
  }

  let compositeCount = 0;
  for(; num < upperBound; num += 17) {
    const isComposite = !isPrime(b);
    compositeCount += isComposite ? 1 : 0;
  }

  return compositeCount;
}
