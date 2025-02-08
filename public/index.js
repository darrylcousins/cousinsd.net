// from https://css-tricks.com/using-css-transitions-auto-dimensions/
const collapseElement = (element) => {
  const sectionHeight = element.scrollHeight;
  const elementTransition = element.style.transition;
  element.style.transition = '';
  requestAnimationFrame(() => {
    element.style.height = sectionHeight + 'px';
    element.style.transition = elementTransition;
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
const expandElement = (element) => {
  const sectionHeight = element.scrollHeight;
  element.style.height = sectionHeight + 'px';
  const end = () => {
    // remove this event listener so it only gets triggered once
    element.removeEventListener('transitionend', end);
    element.style.height = null;
  }
  element.addEventListener('transitionend', end);
  element.setAttribute('data-collapsed', 'false');
}

const performAction = (event) => {
  const el = event.target;
  const [action, type, id] = el.id.split('-');
  console.log(action, type, id);
  console.log(token);
}

let token;

const app = async () => {

  // find the buttons and attach event listener
  document.querySelectorAll('button').forEach((el, idx) => {
    const [action, type, id] = el.id.split('-');
    el.addEventListener('click', performAction);
  });

  // find the collapsible data elements and attach event listeners
  const dataArray = document.querySelectorAll('[id^="data"]');
  // collapse them now
  dataArray.forEach(el => collapseElement(el));
  const controllerArray = document.querySelectorAll('[id^="controller"]');
  controllerArray.forEach((el, idx) => {
    el.addEventListener('click', (e) => {
      const section = document.querySelector(`#data-${idx}`);
      const isCollapsed = section.getAttribute('data-collapsed') === 'true';
      const caret = el.querySelector('svg');
      if(isCollapsed) {
        expandElement(section)
        section.setAttribute('data-collapsed', 'false')
      } else {
        collapseElement(section)
      }
      caret.classList.toggle('rotate');
    });
  });

  // find the token
  const tokenElement = document.querySelector('token');
  token = tokenElement.getAttribute('value');

  // finally, show the content
  document.querySelector("main").classList.toggle("visible");

  const url = "https://cousinsd.net:443/cousinsd/quic";
  const transport = new WebTransport(url);
  console.log(transport);
  await transport.ready();
}

document.addEventListener('DOMContentLoaded', app, false);

