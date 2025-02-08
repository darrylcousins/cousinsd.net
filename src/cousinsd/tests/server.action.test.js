import fs from 'node:fs';
import crypto from 'node:crypto';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { suite, test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import Mongo from '../lib/mongo.js';
import mockActor from './mock.actor.js';
import { mockServer,
  cleanLogs,
  actor,
  headerStringToObject,
  logString,
  getSigHeaders
} from './server.lib.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

suite("Server action tests", async () => {

  let mongo;

  before(() => {
    mongo = new Mongo(process.env.MONGO_URI);
  });

  after(async () => {
    cleanLogs();
    mongo.close();
  });

  test('action should reject non POST requests', async () => {
    process.env['REQUEST_METHOD'] = 'PUT';
    process.env['REQUEST_URI'] = '/cousinsd/action';
    const output = await mockServer({
      method: 'run',
      data: null,
    }, {
      data: '',
    });
    const parts = output.split('\n\n');
    const headers = headerStringToObject(parts[0].split('\n'));
    assert.match(headers.status, new RegExp('400 Bad Request'));
    assert.match(headers.status, new RegExp('No Post'));
    assert.match(logString('app'), new RegExp('No Post'));
  });

  const data =  {
    '@context': 'https://www.w3.org/ns/activitystreams',
    'type': 'Follow',
    'actor': `${mockActor.id}`,
    'object': `${actor}`
  };

  test('action should fail without an authorization header', async () => {
    // push these into process.env to be picked up by request object headers
    process.env['REQUEST_METHOD'] = 'POST';
    process.env['REQUEST_URI'] = '/cousinsd/action';
    const output = await mockServer({
      method: 'run',
      data: null,
    }, {
      data: JSON.stringify(data)
    });
    const parts = output.split('\n\n');
    const headers = headerStringToObject(parts[0].split('\n'));
    assert.match(headers.status, new RegExp('401 No authorization token'));
    assert.match(headers.status, new RegExp('No authorization token'));
    assert.match(logString('app'), new RegExp('No authorization token'));
  });

  test('action should fail without an incorrect token', async () => {
    // push these into process.env to be picked up by request object headers
    process.env['REQUEST_METHOD'] = 'POST';
    process.env['REQUEST_URI'] = '/cousinsd/action';
    // all post requests from our app should have a authorization header
    // containing a random token rebuilt and stored in mongo everytime the
    // action page is loaded by the user

    const oldguid = crypto.randomBytes(16).toString('hex');
    const guid = crypto.randomBytes(16).toString('hex');
    await mongo.updateOne('tokens', { name: process.env.NAME }, { '$set': { name: process.env.NAME, token: guid }});
    process.env['HTTP_AUTHORIZATION'] = `Token ${oldguid}`;
    const output = await mockServer({
      method: 'run',
      data: null,
    }, {
      data: JSON.stringify(data)
    });
    const parts = output.split('\n\n');
    const headers = headerStringToObject(parts[0].split('\n'));
    assert.match(headers.status, new RegExp('401 Incorrect authorization token'));
    assert.match(headers.status, new RegExp('Incorrect authorization token'));
    assert.match(logString('app'), new RegExp('Incorrect authorization token'));
  });

  // all the actions called from our app are associated with an external actor
  // and so that actor should always be fetchable
  const id = crypto.randomBytes(16).toString('hex');
  const doc = {
    id,
    actor: {
      id: mockActor.id,
      inbox: mockActor.inbox,
    },
    data,
    body: JSON.stringify(data),
    inserted: new Date(),
    updated: new Date(),
  }

  test('ignore action should remove the inbox entry', async () => {
    // push these into process.env to be picked up by request object headers
    process.env['REQUEST_METHOD'] = 'POST';
    process.env['REQUEST_URI'] = '/cousinsd/action';
    // all post requests from our app should have a authorization header
    // containing a random token rebuilt and stored in mongo everytime the
    // action page is loaded by the user
    const guid = crypto.randomBytes(16).toString('hex');
    await mongo.updateOne('tokens', { name: process.env.NAME }, { '$set': { name: process.env.NAME, token: guid }});
    process.env['HTTP_AUTHORIZATION'] = `Token ${guid}`;

    // insert the item that we will call an action on
    await mongo.insertOne('inbox', doc);

    const body = {
      '@context': 'https://www.w3.org/ns/activitystreams',
      actor: `${mockActor.id}`,
      type: 'Ignore', // one of ignore, accept, reject
      object: data,
      id
    };
    const output = await mockServer({
      method: 'run',
      data: null,
    }, {
      data: JSON.stringify(body)
    });
    const parts = output.split('\n\n');
    const headers = headerStringToObject(parts[0].split('\n'));
    assert.ok(await mongo.findOne('inbox', {id}) === null);
  });

});
