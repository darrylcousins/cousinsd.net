import { collapseElement, expandElement } from "/cousinsd/animator.js";

const closeResponse = async (event) => {
  const el = event.target;
  const [name, id, error] = el.id.split('-');
  console.log(name, id, error);
  const section = document.querySelector(`#wrapper-${id}`);
  collapseElement(section);
}

export const performAction = async (event) => {
  const el = event.target;
  const [action, type, id] = el.id.split('-');
  console.log(el.id);
  const objectEl = document.querySelector(`#object-${id}`);
  const object = JSON.parse(objectEl.textContent);
  const data = {
    '@context': 'https://www.w3.org/ns/activitystreams',
    actor: `${object.actor}`,
    type: action,
    object,
    id
  };
  const tokenElement = document.querySelector('token');
  const token = tokenElement.getAttribute('value');
  const response = await fetch('/cousinsd/action', {
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

