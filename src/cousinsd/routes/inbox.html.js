import { dateString, createButton, caret } from './lib.js';

// build the body of the document
export default (req, res, doc) => {
  let result = '';
  if (doc.length === 0) {
    return `
    <div> Nothing to see here. </div>
    `;
  }
  for (let [index, entry] of doc.entries()) {
    const { _id, actor, data, inserted } = entry;
    const id = _id;
    result += `
      <div id="wrapper-${id}" class="mb4 collapsible" data-collapsed="false">
        <div class="orange bt pt2 mt3">${dateString(inserted)}</div>
        ${data.type === 'Follow' ? createButton('Reject', 'red', id, data.type, index) : ''}
        ${data.type === 'Follow' ? createButton('Accept', 'green', id, data.type, index) : ''}
        ${data.type === 'Undo' ? createButton('Undo', 'green', id, data.type, index) : ''}
        ${data.type === 'Delete' ? createButton('Delete', 'blue', id, data.type, index) : ''}
        ${createButton(data.type === 'Accept' ? 'Yay' : 'Ignore', 'gold', id, data.type, index)}
        <div class="mb1 cf"></div>
        <div class="mb3">
          <div class="dib w4">Actor:</div>
          <div class="dib">
            <a href="${actor.id}" target="_blank" class="no-underline underline-hover light-blue dim">${actor.id}</a>
          </div>
        </div>
        <div>
          <div class="dib w4">Type:</div>
          <div class="dib"><b>${data.type}</b></div>
        </div>
        <div id="action-${id}" class="collapsible" data-collapsed="true"></div>
        <div id="controller-${id}" class="pointer">
          <div class="dib w4">Data:</div>
          <div class="dib">${caret}</div>
        </div>
        </div>
        <div id="data-${id}" class="collapsible">
          <div id="object-${id}" class="code">${JSON.stringify(data, null, 2)}</div>
        </div>
      </div>
    `;
  }
  return result;
}
