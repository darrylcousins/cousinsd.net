import Worker from './worker.js';

/*
 * NOTE this is me undoing a follow that I have created
 * Unfollow a user on another platform by sending 'undo' on the original 'follow'
 * Linked in the client/browser ui from following.
 *
 * data: following entry id that can be fetched from mongo
 */
export default async ({ data, mongo, cb }) => {

  // get the item from following
  const following = await mongo.findOne('following', { _id: data.id });
  data.actor = following.actor;
  data.object = following.object;

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

  if (response.status === 202 && response.statusText === 'Accepted') { // accepted
    // remove the following
    await mongo.deleteOne('following', { _id: data.id });
    return {
      error: null,
      message: `Undo ${data.type} actioned and following entry removed`,
    };
  } else {
    console.log('status fail');
    return {
      error: true,
      message: 'Failed',
    };
  }
}


