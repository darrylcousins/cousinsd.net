import { IOConnect } from "/cousinsd/socket.js";
import { collapseElement, expandElement } from "./animator.js";

const closeResponse = async (event) => {
  const actionEl = document.querySelector(`#action-search`);
  collapseElement(actionEl);
  const followEl = document.querySelector(`#action-follow`);
  collapseElement(followEl);
}

const followActor = async (event) => {
  const actionEl = document.querySelector(`#action-search`);
  collapseElement(actionEl, () => {
    const dataEl = document.querySelector(`#data-search`);
    const data = JSON.parse(dataEl.textContent);
    const tokenElement = document.querySelector('token');
    const token = tokenElement.getAttribute('value');

    const actionEl = document.querySelector(`#action-follow`);
    actionEl.innerHTML = `
      <div class="mt3 ba br1">
        <div id="response-follow"
          class="fr f2 b pt1 pr3 code pointer dn"
          title="Close and continue">x</div>
        <div id="feedback-follow" class="code pa3"></div>
      </div>
    `;
    
    const close = document.querySelector(`#response-follow`);
    close.addEventListener('click', closeResponse);

    const callback = () => console.log('Got callback from server');
    data.type = "Follow";
    const opts = { id: 'follow', token, data, callback };
    IOConnect(opts);
  });
}

export const performSearch = async (event) => {
  const el = event.target;
  const input = document.querySelector('#search');

  const tokenElement = document.querySelector('token');
  const token = tokenElement.getAttribute('value');

  const actionEl = document.querySelector(`#action-search`);
  actionEl.innerHTML = `
    <div class="mt3 ba br1">
      <div id="response-search"
        class="fr f2 b pt1 pr3 code pointer dn"
        title="Close and continue">x</div>
      <div id="feedback-search" class="code pa3"></div>
    </div>
  `;

  const data = {
    id: 'search',
    type: 'search',
    token,
    q: input.value
  };

  const close = document.querySelector(`#response-search`);
  close.addEventListener('click', closeResponse);

  const callback = (message) => {
    let result;
    try {
      result = JSON.parse(message);
      const url = new URL(result.id);
      const finalEl = document.querySelector(`#final-search`);
      finalEl.innerHTML = `
        <div class="pa3 mt3 ba br1 w-100">
          <div class="fl w-50">
            ${result.icon ? `
              <div class="dib">
                <img src="${result.icon.url}" alt="${result.preferredUsername}" class="w3 br3">
              </div>
            ` : ''}
            <div class="dib v-top">
              <span class="b">${result.name}</span>
              <a class="hover-white no-underline white-70">@${result.preferredUsername}@${url.hostname}</a>
              <div class="mt2">${result.followersCount} followers</div>
            </div>
          </div>
          <div class="fl w-50 tr">
            <button
              id="follow-search" 
              class="v-top bg-navy hover-bg-dark-blue pointer br1 ba white b--moon-gray pv2 ph4 ml1 mv1 bg-animate border-box relative"
              title="Follow" type="button">Follow</button>
          </div>
          <span class="cf"></span>
          <script id="data-search" type="application/json">${JSON.stringify(result)}</script>
        </div>

      `;
      expandElement(finalEl);
      const button = document.querySelector('#follow-search');
      button.addEventListener('click', followActor);
    } catch(e) {
      console.error(e);
    }
  }

  const opts = { id: 'search', token, data, callback };
  IOConnect(opts);
}
