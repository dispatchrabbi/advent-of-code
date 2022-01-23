const AsyncFunction = (async function(){}).constructor;
const GeneratorFunction = (function*(){}).constructor;
const AsyncGeneratorFunction = (async function*(){}).constructor;

function isFunction(fn) {
  return typeof fn === 'function';
}

function isAsyncFunction(fn) {
  return isFunction(fn) && fn.constructor === AsyncFunction;
}

function isGeneratorFunction(fn) {
  return isFunction(fn) && fn.constructor === GeneratorFunction;
}

function isAsyncGeneratorFunction(fn) {
  return isFunction(fn) && fn.constructor === AsyncGeneratorFunction;
}

export {
  isFunction,
  isAsyncFunction,
  isGeneratorFunction,
  isAsyncGeneratorFunction,
};
