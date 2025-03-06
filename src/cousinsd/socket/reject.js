import Worker from './worker.js';

/*
 * Reject a follow from a user on another platform.
 * Linked in the client/browser ui from inbox.
 *
 * data: inbox entry id that can be fetched from mongo
 */
export default async ({ data, mongo, cb }) => {

  const worker = new Worker(data, mongo, cb);
  let body;
  let response;

  // get the follow request from inbox
  const object = await mongo.findOne('inbox', { _id: data.id });

  // add actor id to data for the worker to fetch
  data.actor = object.actor;
  data.object = object.data;
  delete data.object['@context'];

  try {
    await worker.build();
    body = worker.makeBody('Reject', data.object);
    console.log(body);
    await worker.logActivity({ body, inbox: worker.data.actor.inbox });
    response = await worker.postData(body);
  } catch(e) {
    return {
      error: true,
      message: `${e.message}\n${e.stack}`,
    };
  }
  if (response.status === 202 && response.statusText === 'Accepted') { // accepted
    // remove the entry from inbox
    await mongo.deleteOne('inbox', {_id: data.id});
    return {
      error: null,
      message: 'Follow rejected and inbox entry removed',
    };
  } else {
    return {
      error: true,
      message: 'Failed',
    };
  }
}

