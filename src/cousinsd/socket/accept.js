import Worker from './worker.js';

/*
 * Accept a follow from a user on another platform.
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
    body = worker.makeBody('Accept', data.object);
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
    // store as followed and remove the entry from inbox
    delete body['@context'];
    //const object = body;
    //object.object = object.object.data; // remove some unnecessary info i.e. gives object['Accept']['Follow'] sort of
    await mongo.insertOne('followers',
      { actor: data.actor, // This is not the full actor, see worker.fetchActor
        object: body, // the accept request in case we want to undo it! also stored in activitylog
        inserted: new Date(),
        updated: new Date() // in case, for example when an update call is received
      }
    );
    await mongo.deleteOne('inbox', {_id: data.id});
    return {
      error: null,
      message: 'Follow accepted and inbox entry removed',
    };
  } else {
    return {
      error: true,
      message: 'Failed',
    };
  }
}
