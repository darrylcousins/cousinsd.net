import Worker from './worker.js';

/* 
 * First struck delete of an actor, could be it is also used for other objects
 * For an actor we remove from followers and following and any other data we
 * may have (none)
 *
 * data: inbox entry id that can be fetched from mongo
 */
export default async ({ data, mongo, cb }) => {

  // initialize id for the actor and store the inbox item id
  const inboxId = `${data.id}`;
  
  // get the follow request from inbox
  data.object = await mongo.findOne('inbox', { _id: data.id });

  const worker = new Worker(data, mongo, cb);

  let body;
  let response;
  try {
    // await worker.build(); no build because actor is unfetchable
    // but assign actor to the worker
    worker.actor = data.object.actor;
    body = worker.makeBody('Delete', data.object);
    await worker.logActivity({ body, inbox: null });
  } catch(e) {
    return {
      error: true,
      message: `${e.message}\n${e.stack}`,
    };
  }

  let result;
  result = await mongo.deleteOne('followers',
    { 'actor.id': worker.actor.id }
  );
  if (result.deletedCount === 1) {
    cb(`Deleted ${worker.actor.id} from followers`);
  } else {
    cb(`${worker.actor.id} not in followers`);
  }
  result = await mongo.deleteOne('following',
    { 'actor.id': worker.actor.id}
  );
  if (result.deletedCount === 1) {
    cb(`Deleted ${worker.actor.id} from following`);
  } else {
    cb(`${worker.actor.id} not in following`);
  }

  cb(`${worker.actor.id} removed from system`);
  const object = await mongo.findOne('inbox', {_id: inboxId});
  result = await mongo.deleteOne('inbox', {_id: inboxId});
  if (result.deletedCount === 1) {
    return {
      error: null,
      message: `Inbox entry actioned and removed`,
      object
    };
  } else {
    return {
      error: true,
      message: 'Item not removed, unknown error',
      object
    };
  }
}

