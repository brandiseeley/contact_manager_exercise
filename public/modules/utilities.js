const Utility = (function() {
  function caseFreeIncludes(array, string) {
    string = string.toLowerCase();
    for (let element of array) {
      if (element.toLowerCase() === string) return true;
    }
    return false;
  }

  function scrollToTop() {
    scrollTo({top: 0, left: 0, behavior: "smooth"});
  }

  return {
    caseFreeIncludes,
    scrollToTop,
  };
})();

export { Utility };