function isPlainObject(obj) {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    !(obj instanceof Array)
  );
}

export {
  isPlainObject,
};
