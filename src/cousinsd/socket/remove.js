import Worker from './worker.js';

/*
 * NOTE this is me removing a follower
 * Linked in the client/browser ui from followers.
 *
 * data: followers entry id that can be fetched from mongo
 */
export default async ({ data, mongo, cb }) => {

  // get the item from following
  const follower = await mongo.findOne('followers', { _id: data.id });
  data.actor = follower.actor;
  data.object = follower.object.object; // the follow request only

  const worker = new Worker(data, mongo, cb);
  let body;
  let response;

  try {
    await worker.build();
    body = worker.makeBody('Undo', data.object);
    await worker.logActivity({ body, inbox: worker.data.actor.inbox });

    response = await worker.postData(body);
  } catch(e) {
    return {
      error: true,
      message: `${e.message}\n${e.stack}`,
    };
  }

  console.log(response);
  if (response.status === 202 && response.statusText === 'Accepted') { // accepted
    // remove the following
    await mongo.deleteOne('followers', { _id: data.id });
    return {
      error: null,
      message: `Undo ${data.type} actioned and following entry removed`,
    };
  } else {
    return {
      error: true,
      message: 'Failed',
    };
  }
}



