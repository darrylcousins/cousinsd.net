import { dateString, createButton, caret } from './lib.js';
import json from './activitylog.json.js';

const drawObject = (object, depth) => {
  if (typeof object === 'string') {
    return object;
  }
  let result = `${object.type}`;
  if (Object.hasOwnProperty.call(object, 'id') && depth > 0) {
    result += `<a href="${object.id}" target="_blank" class="no-underline underline-hover silver dim ml2">(${object.id})</a>`;
  }
  depth += 1;
  if (Object.hasOwnProperty.call(object, 'object')) {
    result += `<div class="mt2 ml2"><span class="pr2">&#x21AA;</span>`;
    result += drawObject(object.object, depth);
    result += `</div>`;
  }
  result += `</div>`;
  return result;
}

const buildItem = (item) => {
  const { _id, inserted, updated, id, actor, to, object } = item;
  item.inserted = dateString(item.inserted);
  item.updated = dateString(item.updated);
  delete item._id;
  return `
    <div id="wrapper-${_id}" class="mb2 mt3 collapsible" data-collapsed="false">
      <div class="orange bt pt2 mt3">${dateString(inserted)}</div>
      <div class="mb1 cf"></div>
      <div class="mt3">
        <div class="mb3">
          <div class="dib w3 gray">Actor:</div>
          <div class="dib">
            <a href="${actor}" target="_blank" class="no-underline underline-hover gold dim">${actor}</a>
          </div>
        </div>
        <div class="mb3">
          <div class="dib w3 gray">To:</div>
          <div class="dib">
            <a href="${to}" target="_blank" class="no-underline underline-hover light-blue dim">${to}</a>
          </div>
        </div>
        <div class="mb3">
          <div class="dib w3 gray">Link:</div>
          <div class="dib">
            <a href="${id}" target="_blank" class="no-underline underline-hover light-gray dim">${id}</a>
          </div>
        </div>
        <div class="">
          <div class="dib w3 gray v-top">Object:</div>
          <div class="dib v-top light-gray">
            ${drawObject(object, 0)}
          </div>
        </div>
      </div>
      <div id="controller-${_id}" class="pointer">
        <div class="dib w3 gray">More:</div>
        <div class="dib">${caret}</div>
      </div>
      </div>
      <div id="data-${_id}" class="collapsible">
        <div id="object-${_id}" class="code">${JSON.stringify(item, null, 2)}</div>
      </div>
    </div>
  `;
}

// build the body of the document
export default (req, res, doc) => {
  if (doc.length === 0) {
    return `<div> Nothing to see here. </div>`;
  }
  let result = '';
  if (doc.length) {
    result += `<p>Total Count: ${doc.length}</p>`;
    doc.forEach(item => {
      result += buildItem(item);
    });
  } else {
    result += buildItem(doc);
  }
  return result;
}

