import { dateString } from './lib.js';

export default (req, res, doc) => {
  const { actor } = doc;
  return {
    "@context": "https://www.w3.org/ns/activitystreams",
    id: `${actor}/outbox`,
    type: 'OrderedCollection',
    totalItems: doc.length,
    first: `${actor}/outbox?page=true`,
    last: `${actor}/outbox?min_id=0&page=true`,
  };
}


