import { ObjectId } from 'mongodb';
import Signature from '../lib/signature.js';

export default async ({ data, mongo, cb }) => {
  const signature = new Signature();
  const actor = await mongo.findOne('actor', { preferredUsername: process.env.NAME });
  cb('Fetching actor');
  data.actor = await fetch(data.actor, {
    method: 'GET',
    headers: {
      accept: 'application/activity+json'
    }
  }).then(response => response.json());

  // if we don't find the actor
  if (Object.hasOwnProperty.call(data.actor, 'error') || !data.actor.id) {
    return {
      error: true,
      message: 'Failed to fetch actor',
    };
  }
  cb(`Got actor: ${data.actor.preferredUsername} <${data.actor.url}>`);

  // send accept post request
  const _id = new ObjectId();
  const message = {
    '@context': 'https://www.w3.org/ns/activitystreams',
    id: `${actor.id}/messages/${_id.toString()}`,
    type: 'Accept',
    actor: `${actor.id}`,
    object: data, // ?
  }
  const reqBody = JSON.stringify(message);

  message._id = _id;
  message.inserted = new Date();
  message.updated = new Date();
  await mongo.insertOne('messages', message);

  // create signed headers and send accept message
  const keys = await mongo.findOne('keys', {id: actor.id});
  const headers = signature.headers({ 
    inbox: data.actor.inbox,
    reqBody,
    privateKey: keys.privateKey,
    keyId: actor.id
  });
  const response = await fetch(data.actor.inbox, {
    headers,
    method: 'POST',
    accept: 'application/activity+json',
    body: reqBody
  });
  if (response.status === 202 && response.statusText === 'Accepted') { // accepted
    // store as followed and remove the entry from inbox
    await mongo.insertOne('followers',
      { actor: data.actor,
        inserted: new Date(),
        updated: new Date() // in case, for example when an update call is received
      }
    );
    await mongo.deleteOne('inbox', {_id: data.id});
    return {
      error: null,
      message: 'Follow accepted',
    };
  } else {
    console.log('status fail');
    // bugger I've been rejected, possibly it would have json info else just store the status and statusText
    return {
      error: true,
      message: 'Failed',
    };
  }
}
