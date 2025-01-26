// #!/usr/bin/env node
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { suite, test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import Signature from '../lib/signature.js';
import Mongo from '../lib/mongo.js';
import Logger from '../lib/logger.js';
import Server from '../lib/server.js';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: join(__dirname, '..', '.env.test') });

const main = async () => {
  const mongo = new Mongo(process.env.MONGO_URI);
  const domain = process.env.DOMAIN;
  const name = process.env.NAME;
  const host = `https://${domain}`;
  const username = `${host}/${name}`;
  const keyId = `${username}/publicKey`;
  const keys = await mongo.findOne("keys", {id: username});
  const actor = await mongo.findOne("actors", {id: username});
  const signature = new Signature();
  const reqBody = "{'bleh': 'blah'}";
  const inbox = `${username}/inbox`;
  //const sig = signature.sign(reqBody);
  const headers = signature.headers({ inbox, reqBody, privateKey: keys.privateKey, keyId });
  //console.log(headers);
  //console.log('');

  const server = {};
  for (let name in process.env) {
    let value = process.env[name];
    name = name.toLowerCase();
    if (name.indexOf('http_') === 0) {
      server[ name.substring('http_'.length) ] = value;
    } else {
      server[name] = value;
    }
  }
  const logger = new Logger(server);
  logger.access();
  logger.app({ inbox, reqBody, headers, publicKey: keys.publicKey });
  const path = '/cousinsd/inbox';
  assert.ok(signature.validate({ path, reqBody, headers, publicKey: actor.publicKey.publicKeyPem }));

  await mongo.close();
}

main();

