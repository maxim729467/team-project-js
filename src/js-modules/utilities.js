export function throttle(func, wait) {

  let isThrottled = false,
    savedArgs,
    savedThis;

  function wrapper() {

    if (isThrottled) {
      savedArgs = arguments;
      savedThis = this;
      return;
    }

    func.apply(this, arguments);

    isThrottled = true;

    setTimeout(function() {
      isThrottled = false;
      if (savedArgs) {
        wrapper.apply(savedThis, savedArgs);
        savedArgs = savedThis = null;
      }
    }, wait);
  }

  return wrapper;
}


export function debounce(func, wait, immediate = false) {
  let timeout;

  return function wrapper() {
    const savedThis = this;
    const savedArgs = arguments;

    const later = function() {
      timeout = null;
      if (!immediate) func.apply(savedThis, savedArgs);
    };

    const callNow = immediate && !timeout;

    clearTimeout(timeout);

    timeout = setTimeout(later, wait);

    if (callNow) func.apply(savedThis, savedArgs);
  };
};

export function camelToKebabCase(word) {
  return word.replace(/([A-Z])/g, ch => '-' + ch.toLowerCase());
}