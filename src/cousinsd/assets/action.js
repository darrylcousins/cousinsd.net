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
  const tokenElement = document.querySelector('token');
  const token = tokenElement.getAttribute('value');
  const objectEl = document.querySelector(`#object-${id}`);
  const object = JSON.parse(objectEl.textContent);
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
    '@context': 'https://www.w3.org/ns/activitystreams',
    actor: `${object.actor}`,
    type: action,
    token,
    object,
    id
  };

  const close = document.querySelector(`#response-${id}-false`);
  close.addEventListener('click', closeResponse);

  const opts = { id, token, data };
  IOConnect(opts);
}
