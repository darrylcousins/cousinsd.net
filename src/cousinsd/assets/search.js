import { IOConnect } from "/cousinsd/socket.js";
import { collapseElement, expandElement } from "./animator.js";

const closeResponse = async (event) => {
  for (const id of ['search', 'follow', 'undo']) {
    const el = document.querySelector(`#action-${id}`);
    if (el) collapseElement(el);
  }
}

/*
 * Follow or Undo 
 */ 
const followAction = async (action) => {
  const actionEl = document.querySelector('[id^="action-"]');
  collapseElement(actionEl, () => {
    const actor = JSON.parse(document.querySelector(`#data-search`).textContent);
    const token = document.querySelector('token').getAttribute('value');
    const agent = document.querySelector('agent').getAttribute('value');

    actionEl.id = `action-${action.toLowerCase()}`;
    actionEl.innerHTML = `
      <div class="mt3 ba br1">
        <div id="response-${action.toLowerCase()}"
          class="fr f2 b pt1 pr3 code pointer dn"
          title="Close and continue">x</div>
        <div id="feedback-${action.toLowerCase()}" class="code pa3"></div>
      </div>
    `;
    
    const close = document.querySelector(`#response-${action.toLowerCase()}`);
    close.addEventListener('click', closeResponse);

    const data = {
      actor: `${actor.id}`, // actor id
      agent,
      type: action,
      token
    };

    const callback = () => console.log('Got callback from server');
    const opts = { id: action.toLowerCase(), token, data, callback };
    console.log('Sending:\n', JSON.stringify(data, null, 2));
    IOConnect(opts);
  });
}

export const performSearch = async (event) => {
  const el = event.target;
  const input = document.querySelector('#search');

  const tokenElement = document.querySelector('token');
  const token = tokenElement.getAttribute('value');

  const actionEl = document.querySelector('[id^="action-"]');
  actionEl.id = 'action-search';
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
        <div class="light-green pa4 mt3 ba br1 w-100">
          <div class="fl w-50">
            ${result.icon ? `
              <div class="dib mr3">
                <img src="${result.icon.url}" alt="${result.preferredUsername}" class="w3 br3">
              </div>
            ` : ''}
            <div class="dib v-top">
              <span class="gold b">${result.name}</span>
              <a class="hover-white no-underline light-blue"
                  href="${result.id}"
                  >@${result.preferredUsername}@${url.hostname}</a>
              <div class="white-60 mt2">${result.followersCount} followers, ${result.followingCount} following.</div>
              ${result.follower ? `
                <div class="white-60 mt2">Follows you</div>
              ` : ``}
            </div>
          </div>
          <div class="fl w-50 tr">
            ${result.following ? `
            <button
              id="button-undo" 
              class="v-top bg-dark-red hover-bg-red pointer br1 ba white b--moon-gray pv2 ph4 ml1 mv1 bg-animate border-box relative"
              title="Unfollow" type="button">Unfollow</button>
            ` : `
            <button
              id="button-follow" 
              class="v-top bg-navy hover-bg-dark-blue pointer br1 ba white b--moon-gray pv2 ph4 ml1 mv1 bg-animate border-box relative"
              title="Follow" type="button">Follow</button>
            `}
          </div>
          <span class="cf"></span>
          <script id="data-search" type="application/json">${JSON.stringify(result)}</script>
        </div>

      `;
      expandElement(finalEl);
      let follow = document.querySelector('#button-follow');
      if (follow) follow.addEventListener('click', (ev) => followAction('Follow', ev));
      let unfollow = document.querySelector('#button-undo');
      if (unfollow) unfollow.addEventListener('click', (ev) => followAction('Undo', ev));
    } catch(e) {
      console.error(e);
    }
  }

  const opts = { id: 'search', token, data, callback };
  IOConnect(opts);
}
