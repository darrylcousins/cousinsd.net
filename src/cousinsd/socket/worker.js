import { ObjectId } from 'mongodb';
import Signature from '../lib/signature.js';

class Worker {
  constructor(data, mongo, cb) {
    this.data = data;
    this.mongo = mongo;
    this.callback = cb;
    this.signature = new Signature();
    this._id = new ObjectId();
  }

  async build() {
    this.actor = await this.mongo.findOne('actor', { id: this.data.agent }); // agent refers to the local actor
    if (Object.hasOwnProperty.call(this.data.actor, 'id')) this.data.actor = this.data.actor.id;
    this.data.actor = await this.fetchActor(this.data.actor); // i.e turn an id into an object
  }

  async logActivity({ body, inbox, _id }) {
    body = { ...body }; // avoid mutating the original
    delete body['@context'];
    if (Object.hasOwnProperty.call(body, 'object')) delete body.object['@context'];
    const activity = {
      _id: _id ? _id : this._id,
      id: body.id,
      actor: body.actor,
      to: inbox,
      object: body,
      inserted: new Date(),
      updated: new Date()
    }
    await this.mongo.insertOne('activitylog', activity);
  }

  async fetchActor(actorId) {
    this.callback('Fetching actor');
    const actor = await fetch(actorId, {
      method: 'GET',
      headers: {
        accept: 'application/activity+json'
      }
    }).then(response => response.json());

    // if we don't find the actor
    if (Object.hasOwnProperty.call(actor, 'error') || !actor.id) {
      throw new Error('Failed to fetch actor');
    }
    this.callback(`Got actor: ${actor.preferredUsername} <${actor.url}>`);
    // only need id and inbox, other details are also stored in followers/following
    const { id, type, preferredUsername, name, inbox, outbox, icon, alsoKnownAs, endpoints } = actor;
    return { id, type, preferredUsername, name, inbox, outbox, icon, alsoKnownAs, endpoints };
  }

  makeBody(type, object) {
    return {
      '@context': 'https://www.w3.org/ns/activitystreams',
      id: `${this.actor.id}/activitylog/${this._id.toString()}`,
      type,
      actor: `${this.actor.id}`,
      object
    }
  }

  async postData(body) {
    const reqBody = JSON.stringify(body);
    const keys = await this.mongo.findOne('keys', {id: this.actor.id});
    const headers = this.signature.headers({ 
      inbox: this.data.actor.inbox,
      reqBody,
      privateKey: keys.privateKey,
      keyId: this.actor.id
    });
    return await fetch(this.data.actor.inbox, {
      headers,
      method: 'POST',
      body: reqBody
    });
  }
}

export default Worker;
