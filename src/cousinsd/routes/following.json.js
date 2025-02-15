import { dateString } from './lib.js';

export default (req, res, doc) => {
  const { actor } = doc;
  return {
    "@context": "https://www.w3.org/ns/activitystreams",
    id: `${actor}/following`,
    type: 'OrderedCollection',
    totalItems: doc.length,
    items: doc.map((el) => {
      return {
        name: el.actor.name,
        inserted: dateString(el.inserted)
      }
    }),
    first: `${actor}/following?page=1`
  };
}

