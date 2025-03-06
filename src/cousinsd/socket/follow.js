import { ObjectId } from 'mongodb';
import Worker from './worker.js';

/*
 * Follow a user on another platform.
 * Linked in the client/browser ui from search (home) and followers.
 *
 * data:can be a 'follower' id or actor id to be fetched
 */
export default async ({ data, mongo, cb }) => {

  const worker = new Worker(data, mongo, cb);
  let body;
  let response;

  if (Object.hasOwnProperty.call(data, 'id')) {
    // get the follower from mongo
    const follower = await mongo.findOne('followers', { _id: data.id });
    data.actor = follower.actor;
  }

  try {
    await worker.build();
    body = worker.makeBody('Follow', worker.data.actor.id);
    await worker.logActivity({ body, inbox: worker.data.actor.inbox });
    response = await worker.postData(body);
  } catch(e) {
    return {
      error: true,
      message: `${e.message}\n${e.stack}`,
    };
  }
  if (response.status === 202 && response.statusText === 'Accepted') { // accepted
    await mongo.insertOne('following',
      { actor: worker.data.actor,
        object: body, // keep the original in case we send an 'Undo' in the future
        inserted: new Date(),
        updated: new Date() // in case, for example when an update call is received
      }
    );
    // the accept or otherwise will be logged to activitylog upon receipt to inbox
    // and the object will be updated when acknowledged from the inbox ui
    return {
      error: null,
      message: 'Follow accepted',
    };
  } else {
    return {
      error: true,
      message: 'Failed',
    };
  }
}

