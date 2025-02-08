import crypto from 'node:crypto';
import Signature from '../lib/signature.js';

export default ({ data, mongo }) => {
  const signature = new Signature();
  const actor = await mongo.findOne('actor', { preferredUsername: process.env.NAME });
  // send accept post request
  const guid = crypto.randomBytes(16).toString('hex');
  const message = {
    "@context": "https://www.w3.org/ns/activitystreams",
    "id": `${actor.id}/messages/${guid}`,
    "type": "Accept",
    "actor": `${actor.id}`,
    "object": data // ?
  }
  await mongo.insertOne('messages', message);

  const reqBody = JSON.stringify(message);
  // create signed headers and send accept message
  const keys = await mongo.findOne('keys', {id: actor.id});
  const headers = signature.headers({ 
    inbox: data.actor.inbox,
    reqBody,
    privateKey: keys.privateKey,
    keyId: actor.id
  });
  console.log(headers);
  const response = await fetch(data.actor.inbox, {
    headers,
    method: 'POST',
    accept: 'application/activity+json',
    body: reqBody
  });
  let result;
  if (response) {
    try {
      result = await response.json();
    } catch(e) {
      // we can ignore this as they may not send data back
      console.log(response);
    }
  }
  if (result) {
    console.log(result);
    // this may be an error, eg unable to verify signature so store somewhere
  } else {
    // store the success somewhere
  }
  if (response.status === 202) { // accepted
    // store as followed
  } else {
    // bugger I've been rejected, possibly it would have json info else just store the status and statusText
  }
}
