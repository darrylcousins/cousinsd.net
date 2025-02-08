import { IOConnect } from '/cousinsd/socket.js';
import { collapseElement, expandElement } from '/cousinsd/animator.js';
import { performAction } from '/cousinsd/action.js';

let token;

const app = async () => {

  // finally, show the content
  document.querySelectorAll('.content').forEach((el) => {
    el.classList.toggle('dn');
  });

  // find the buttons and attach event listener
  document.querySelectorAll('button').forEach((el, idx) => {
    el.addEventListener('click', performAction);
  });

  // find the collapsible data elements and attach event listeners
  const dataArray = document.querySelectorAll('[id^="data"]');
  const actionArray = document.querySelectorAll('[id^="action"]');
  // collapse them now
  [...actionArray, ...dataArray].forEach(el => collapseElement(el));
  const controllerArray = document.querySelectorAll('[id^="controller"]');
  controllerArray.forEach((el, idx) => {
    const [name, id] = el.id.split('-');
    el.addEventListener('click', (e) => {
      const section = document.querySelector(`#data-${id}`);
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
  setTimeout(() => {
    document.querySelectorAll('.content').forEach((el) => {
      el.classList.toggle('visible');
    });
  }, 500);

}

document.addEventListener('DOMContentLoaded', app, false);
  
