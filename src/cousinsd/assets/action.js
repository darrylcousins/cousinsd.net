import { IOConnect } from "./socket.js";
import { collapseElement, expandElement } from "./animator.js";

const closeResponse = async (event) => {
  const el = event.target;
  const [name, id, error] = el.id.split('-');
  console.log(name, id, error);
  if (error === 'false') {
    const section = document.querySelector(`#wrapper-${id}`);
    collapseElement(section);
  } else {
    const actionEl = document.querySelector(`#action-${id}`);
    collapseElement(actionEl);
  }
}

export const performAction = async (event) => {
  const el = event.target;
  const [action, type, id] = el.id.split('-');
  console.log(action, type, id);
  /*
  const tokenElement = document.querySelector('token');
  const token = tokenElement.getAttribute('value');
  const objectEl = document.querySelector(`#object-${id}`);
  let object = JSON.parse(objectEl.textContent);
  */

  const object = JSON.parse(document.querySelector(`#object-${id}`).textContent);
  const token = document.querySelector('token').getAttribute('value');
  const agent = document.querySelector('agent').getAttribute('value');

  // to allow other data to be included in dropdown, e.g. actor and object for followers/ing
  //if (Object.hasOwnProperty.call(object, 'object')) object = object.object;

  const actionEl = document.querySelector(`#action-${id}`);

  const err = 'false';
  actionEl.innerHTML = `
    <div class="mt3 ba br1">
      <div id="response-${id}-${err}"
        class="fr f2 b pt1 pr3 code pointer dn"
        title="Close and continue">x</div>
      <div id="feedback-${id}" class="code pa3"></div>
    </div>
  `;

  const data = {
    id,
    agent,
    // actor, the actor id will be stored in the object found from the id
    type: action,
    token
  };

  console.log('Sending:\n', JSON.stringify(data, null, 2));

  const close = document.querySelector(`#response-${id}-false`);
  close.addEventListener('click', closeResponse);

  const opts = { id, token, data };
  IOConnect(opts);
}
