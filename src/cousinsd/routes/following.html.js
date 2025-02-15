import json from './following.json.js';

// build the body of the document
export default (req, res, doc) => {
  return `<pre>${ JSON.stringify(json(req, res, doc), null, 2) }</pre>`;
}

