import { IOConnect } from "/cousinsd/socket.js";

export const performSearch = async (event) => {
  const el = event.target;
  console.log(el);
  const input = document.querySelector('#search');

  const tokenElement = document.querySelector('token');
  const token = tokenElement.getAttribute('value');

  const id = 'search';
  const actionEl = document.querySelector(`#action-${id}`);

  const err = 'false';
  actionEl.innerHTML = `
    <div class="mt3 ba br1">
      <div id="response-search-${err}"
        class="fr f2 b pt1 pr3 code pointer dn"
        title="Close and continue">x</div>
      <div id="feedback-search" class="code pa3"></div>
    </div>
  `;

  const data = {
    id,
    type: 'search',
    token,
    q: input.value
  };

  const opts = { id, token, data };
  IOConnect(opts);
}
