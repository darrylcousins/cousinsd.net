/*
 * Ignore any items in the inbox
 * Linked in the client/browser ui from inbox.
 *
 * data: inbox entry id that can be fetched from mongo
 */
export default async ({ data, mongo, cb }) => {
  // remove the inbox item try/catch? check result for success
  const object = await mongo.findOne('inbox', {_id: data.id});
  let result;
  try {
    result = await mongo.deleteOne('inbox', {_id: data.id});
  } catch(err) {
    return {
      error: true,
      message: err.message,
      object
    }
  }
  if (result.deletedCount === 1) {
    return {
      error: null,
      message: 'Ignore message received\nInbox entry removed',
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
