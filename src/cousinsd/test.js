#!/usr/bin/env node
import Signature from './lib/signature.js';
import Mongo from './lib/mongo.js';
import Logger from './lib/logger.js';
import Server from './cgi-lib/server.js';
import dotenv from 'dotenv';

dotenv.config();

const main = async () => {
  const mongo = new Mongo(process.env.MONGO_URI);
  const domain = process.env.DOMAIN;
  const name = process.env.NAME;
  const host = `https://${domain}`;
  const actor = `${host}/${name}`;
  const keyId = `${actor}/publicKey`;
  const keys = await mongo.findOne("keys", {id: actor});
  const signature = new Signature();
  const reqBody = "{'bleh': 'blah'}";
  const inbox = `${actor}/inbox`;
  //const sig = signature.sign(reqBody);
  const headers = signature.headers({ inbox, reqBody, privateKey: keys.privateKey, keyId });
  console.log(headers);
  console.log('');

  const logger = new Logger({});
  logger.access({ inbox, reqBody, headers, publicKey: keys.publicKey });
  const path = '/cousinsd/inbox';
  console.log(signature.validate({ path, reqBody, headers, publicKey: keys.publicKey }));

  await mongo.close();
}

main();

