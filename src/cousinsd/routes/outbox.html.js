import json from './outbox.json.js';

// build the body of the document
export default (req, res, doc) => {
  if (doc.length === 0) {
    return `
    <div> Nothing to see here. </div>
    `;
  }
  return `<pre>${ JSON.stringify(json(req, res, doc), null, 2) }</pre>`;
}

