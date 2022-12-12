/**
 * Provide some helper methods
 *
 * @module app/helpers
 */

/*
 * @ function stringTemplate
 * @example:
 * let template = "I'm ${name}. I'm almost ${age} years old."
 * parseStringTemplate({name: 'Darryl', age: 60}) => I'm Darryl. I'm almost 60 years old
 *
 * <form
 *   data-template="I'm ${name}. I'm almost ${age} years old."
 *   data-name="Darryl"
 *   data-age="60"> ... </form>
 */
export const parseStringTemplate = (template, args) => {
  const result = Object.entries(args).reduce(
    (result, [arg, val]) => result.replace(`$\{${arg}}`, `${val}`),
    template,
  );
  return result;
};

/*
 * Capitalize an array of words and return
 */
export const capWords = (arr) => {
  if (arr[0] === "CSA") return arr; // old style subscriptions
  return arr.map(el => el.charAt(0).toUpperCase() + el.substring(1).toLowerCase());
};

/*
 * Title case a sentence of words
 */
export const titleCase = (str) => capWords(str.split(" ").map(el => el.trim()).filter(el => el !== "")).join(" ");

/*
 * @function camelCaseToWords
 * @params {string} str e.g addOnProducts
 * @result {string} e.g "add on product"
 */
export const camelCaseToWords = (str) => str.replace(/[A-Z]/g, letter => ` ${letter.toLowerCase()}`);

export const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/**
 * Sort an object by it's keys.
 *
 * @function sortObjectByKeys
 * @param {object} o An object
 * @returns {object} The sorted object
 * @example
 * sortObjectByKeys({'c': 0, 'a': 2, 'b': 1});
 * // returns {'a': 2, 'b': 1, 'c': 0}
 */
export const sortObjectByKeys = (o, options) => {
  if (Object.hasOwnProperty.call(options, 'reverse')) {
    return Object.keys(o)
      .sort()
      .reverse()
      .reduce((r, k) => ((r[k] = o[k]), r), {});
  } else {
    return Object.keys(o)
      .sort()
      .reduce((r, k) => ((r[k] = o[k]), r), {});
  };
};

/**
 * Sort an array of objects by key.
 *
 * @function sortObjectByKey
 * @param {object} o An object
 * @param {string} key The attribute to sort
 * @returns {object} The sorted object
 * @example
 * sortObjectByKey([{'s1': 5, 's2': 'e'}, {'s1': 2, 's2': 'b'}], 's1');
 * // returns [{'s1': 2, 's2': 'b'}, {'s1': 5, 's2': 'e'}]
 * sortObjectByKey([{'s1': 5, 's2': 'e'}, {'s1': 2, 's2': 'b'}], 's2');
 * // returns [{'s1': 2, 's2': 'b'}, {'s1': 5, 's2': 'e'}]
 */
export const sortObjectByKey = (o, key, reverse) => {
  o.sort((a, b) => {
    let nameA = a[key];
    let nameB = b[key];
    if (!Number.isInteger) {
      nameA = a[key].toUpperCase(); // ignore upper and lowercase
      nameB = b[key].toUpperCase(); // ignore upper and lowercase
    }
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });
  if (reverse) {
    return o.reverse();
  };
  return o;
};

/**
 * Method to pass to sort an array of date strings
 *
 * @function dateStringSort
 */
export const dateStringSort = (a, b) => {
  if (Date.parse(a) && Date.parse(b)) {
    let dateA = new Date(Date.parse(a));
    let dateB = new Date(Date.parse(b));
    if (dateA < dateB) return -1;
    if (dateA > dateB) return 1;
    return 0;
  } else {
    return 0;
  }
};

/** Provide standard animationOptions
 *
 * @member {object} animationOptions
 */
export const animationOptions = {
  duration: 400,
  easing: "ease",
  fill: "both",
};

/**
 * Animate a fade and execute an action on end
 *
 * @function animateFadeForAction
 */
export const animateFadeForAction = (id, action, duration) => {
  let target;
  if (typeof id === "string") {
    target = document.getElementById(id);
  } else {
    target = id;
  };
  const options = { ...animationOptions };
  if (duration) options.duration = duration;
  const animate = target.animate(
    {
      opacity: 0.1,
    },
    options
  );
  animate.addEventListener("finish", async () => {
    if (action) {
      await action();
    }
    target.animate(
      {
        opacity: 1,
      },
      options
    );
  });
};

/**
 * Animate a fade
 *
 * @function animateFade
 */
export const animateFade = (id, opacity) => {
  let target;
  if (typeof id === "string") {
    target = document.getElementById(id);
  } else {
    target = id;
  }
  const animate = target.animate(
    {
      opacity,
    },
    animationOptions
  );
};

/*
 * @function collapseElement
 * from https://css-tricks.com/using-css-transitions-auto-dimensions/
 *
 */
export const collapseElement = (element) => {
  if (!element) return;
  const elementHeight = element.scrollHeight;
  var elementTransition = element.style.transition;
  element.style.transition = "";
  requestAnimationFrame(() => {
    element.style.height = elementHeight + "px";
    element.style.transition = elementTransition;
    requestAnimationFrame(() => {
      element.style.height = 0 + "px";
    });
  });
}

/*
 * @function transitionElementHeight
 * from https://css-tricks.com/using-css-transitions-auto-dimensions/
 * .collapsible {
 *   overflow:hidden;
 *   transition: height 0.8s ease-out;
 *   height:auto;
 * }
 *
 */
export const transitionElementHeight = (element, start) => {
  if (!element) return;
  let calculatedHeight = start ? start : 5;
  // simply using el.scrollHeight can give some odd results when element is shrinking
  element.childNodes.forEach(el => {
    if (typeof el.scrollHeight !== "undefined") calculatedHeight += el.scrollHeight;
  });
  element.style.height = calculatedHeight + "px";
}

/*
 * @function delay
 * Wait for a time
 * await delay(2000) - 2 secs
 *
 */
export const delay = (t) => {
  return new Promise(resolve => setTimeout(resolve, t));
};

/*
 * @function sleepUntil
 * Wait for element to be rendered
 * From https://levelup.gitconnected.com/javascript-wait-until-something-happens-or-timeout-82636839ea93
 *
 */
export const sleepUntil = async (f, timeoutMs) => {
  return new Promise((resolve, reject) => {
    let timeWas = new Date();
    let wait = setInterval(function() {
      if (f()) {
        try {
          clearInterval(wait);
        } catch(e) {
        };
        resolve();
      } else if (new Date() - timeWas > timeoutMs) { // Timeout
        try {
          clearInterval(wait);
        } catch(e) {
        };
        reject();
      }
      }, 20);
    });
}


