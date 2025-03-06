import { dateString, createButton, caret } from './lib.js';

// build the body of the document
export default async (req, res, doc, mongo) => {
  let result = '';
  result += `<p>Total Count: ${doc.length}</p>`;
  if (doc.length === 0) {
    result += `
    <div> Nothing to see here. </div>
    `;
    return result;
  }

  const items = doc.map((el) => {
    return {
      _id: el._id,
      name: el.actor.name,
      id: el.actor.id,
      inserted: dateString(el.inserted),
      updated: dateString(el.updated),
      actor: el.actor,
      object: el.object,
    }
  });
  for (let [index, entry] of items.entries()) {
    const { _id, actor, inserted, updated, object } = entry;

    const url = new URL(actor.id);
    result += `
      <div id="wrapper-${_id}" class="mb4 collapsible" data-collapsed="false">
        <div class="orange bt pt2 mt3">${dateString(inserted)}</div>
        ${createButton('Unfollow', 'red', _id, 'unfollow', index)}
        <div class="mb1 cf"></div>
        <div class="">
          ${actor.icon ? `
            <div class="dib mr3">
              <img src="${actor.icon.url}" alt="${actor.preferredUsername}" class="w3 br2">
            </div>
          ` : `
            <div class="dib mr3 w3 h3 ba br2">
              &nbsp;
            </div>
          `}
          <div class="dib v-top">
            <div class="gold b mb2">${actor.name}</div>
            <div class="mb2">
              <a class="hover-white no-underline light-blue"
                  href="${actor.id}"
                  >@${actor.preferredUsername}@${url.hostname}</a>
            </div>
            <a class="hover-white no-underline silver"
                href="${actor.id}"
                >${actor.id}</a>

          ${object.type === 'Follow' ? `<div class="mt2 b orange">Pending</div>` : ''}
          </div>
        </div>
        <div id="action-${_id}" class="collapsible" data-collapsed="true"></div>
        <div id="controller-${_id}" class="pointer">
          <div class="dib w3 mr2">More:</div>
          <div class="dib">${caret}</div>
        </div>
        </div>
        <div id="data-${_id}" class="collapsible">
          <div id="object-${_id}" class="code">${JSON.stringify({ actor, object, inserted, updated }, null, 2)}</div>
        </div>
      </div>
    `;
  }
  return result;
}

