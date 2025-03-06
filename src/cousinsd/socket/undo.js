import Worker from './worker.js';

/*
 * This is an undo found in my inbox, so a follower has undone a follow
 * i.e. I need to delete some local data and correct followers
 * NB check 'type', could be 'follow', ... ?
 *
 * Undo a follow does not I think require a reply to sender, simply delete that user from followers
 *
 * data: inbox entry id that can be fetched from mongo
 */
export default async ({ data, mongo, cb }) => {

  // get the follow request from inbox
  const object = await mongo.findOne('inbox', { _id: data.id });

  // if this was a follow that is being undone
  // all that needs to done is to remove the follower
  // do not need activitylog because that was logged when message received to inbox

  if (object.data.object.type === 'Follow') {
    await mongo.deleteOne('followers', { 'actor.id': object.actor.id });
    await mongo.deleteOne('inbox', {_id: data.id});
    // also check inbox for the follow which may not yet been accepted
    await mongo.deleteOne('inbox', {'data.id': object.data.object.id, 'data.type': object.data.object.type});
    return {
      error: false,
      message: `Follower ${object.actor.id} removed and inbox entry deleted`,
    };
  }
  return {
    error: true,
    message: 'Failed, was this a follow that was being undone?',
  };

}

