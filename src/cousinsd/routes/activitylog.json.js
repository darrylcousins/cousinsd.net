import { dateString } from './lib.js';

const renderEl = (el) => {
  //delete el._id;
  return {
    ...el,
    inserted: dateString(el.inserted),
    updated: dateString(el.updated)
  }
}

export default (req, res, doc) => {
  if (doc.length) {
    return doc.map(el => renderEl(el));
  } else {
    return renderEl(doc);
  }
}
