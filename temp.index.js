import { io } from "https://cdn.socket.io/4.8.1/socket.io.esm.min.js";

// from https://css-tricks.com/using-css-transitions-auto-dimensions/
const collapseElement = (element) => {
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

const closeResponse = async (event) => {
  const el = event.target;
  const [name, id, error] = el.id.split('-');
  console.log(name, id, error);
  const section = document.querySelector(`#wrapper-${id}`);
  collapseElement(section);
}

const IOConnect = async () => {
  console.log(io);
}

const performAction = async (event) => {
  const el = event.target;
  const [action, type, id] = el.id.split('-');
  const objectEl = document.querySelector(`#object-${id}`);
  const object = JSON.parse(objectEl.textContent);
  const data = {
    '@context': 'https://www.w3.org/ns/activitystreams',
    actor: `${object.actor}`,
    type: action,
    object,
    id
  };
  const response = await fetch('https://cousinsd.net/cousinsd/action', {
    method: 'POST',
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Token ${token}`
    }
  });
  if (response.status === 200) {
    console.log(`#action-${id}`);
    const result = await response.json();
    const actionEl = document.querySelector(`#action-${id}`);
    actionEl.innerHTML = `
      <div class="mt3 ba br1">
        <div id="response-${id}-${result.error}"
          class="fr f2 b pt1 pr3 code pointer"
          title="Close and continue">x</div>
        <div class="pa3">
          <div class="pv2">
            <div class="dib w4">Error:</div>
            <div class="dib">${result.error}</div>
          </div>
          <div class="pv2">
            <div class="dib w4">Message:</div>
            <div class="dib">${result.body}</div>
          </div>
          <div class="pv2">
            <div class="dib w4">Actor:</div>
            <div class="dib">${result.actor}</div>
          </div>
        </div>
      </div>
    `;
    expandElement(actionEl);

    const close = document.querySelector(`#response-${id}-${result.error}`);
    close.addEventListener('click', closeResponse);
  }
}

let token;

const app = async () => {

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
    console.log(name, id);
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
  document.querySelector("main").classList.toggle("visible");

  IOConnect();

}

document.addEventListener('DOMContentLoaded', app, false);

