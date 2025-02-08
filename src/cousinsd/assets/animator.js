
// from https://css-tricks.com/using-css-transitions-auto-dimensions/
export const collapseElement = (element) => {
  const sectionHeight = element.scrollHeight;
  //const elementTransition = element.style.transition; // always an empty string
  //console.log(element.style.transition);
  //transition: height 0.8s ease-out;
  //element.style.transition = '';
  requestAnimationFrame(() => {
    element.style.height = sectionHeight + 'px';
    //element.style.transition = elementTransition;
    requestAnimationFrame(() => element.style.height = 0 + 'px');
  });
  element.setAttribute('data-collapsed', 'true');
}

/* from https://css-tricks.com/using-css-transitions-auto-dimensions/
 * .collapsible {
 *   overflow:hidden;
 *   transition: height 0.8s ease-out;
 *   height:auto; }
 */
export const expandElement = (element, callback) => {
  const sectionHeight = element.scrollHeight;
  element.style.height = sectionHeight + 'px';
  const end = () => {
    // remove this event listener so it only gets triggered once
    element.removeEventListener('transitionend', end);
    element.style.height = null;
    if (callback) {
      callback();
    }
  }
  element.addEventListener('transitionend', end);
  element.setAttribute('data-collapsed', 'false');
}

