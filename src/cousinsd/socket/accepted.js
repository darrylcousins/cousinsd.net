/*
 * A follow request has been accepted and the accept shows up in the inbox, Yay.
 * Linked in the client/browser ui from inbox.
 * Update the following entry to include full object with accept message
 * This also indicates in the following display whether the follow has been accepted
 *
 * data: inbox entry id that can be fetched from mongo
 */
export default async ({ data, mongo, cb }) => {
  // remove the inbox item try/catch? check result for success
  const object = await mongo.findOne('inbox', {_id: data.id});
  try {
    delete object.data['@context'];
    await mongo.updateOne('following', {'actor.id': object.actor.id}, {
      '$set': { object: object.data, updated: new Date() }
    });
  } catch(err) {
    return {
      error: true,
      message: err.message,
      object
    }
  }
  try {
    await mongo.deleteOne('inbox', {_id: data.id});
  } catch(err) {
    return {
      error: true,
      message: err.message,
      object
    }
  }
  return {
    error: false,
    message: 'Inbox entry removed and following entry updated.',
    object
  };
}

