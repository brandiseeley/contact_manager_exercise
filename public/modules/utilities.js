const Utility = (function() {
  function caseFreeIncludes(array, string) {
    string = string.toLowerCase();
    for (let element of array) {
      if (element.toLowerCase() === string) return true;
    }
    return false;
  }

  return {
    caseFreeIncludes,
  };
})();

export { Utility };