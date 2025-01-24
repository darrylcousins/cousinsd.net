#!/usr/bin/env node

import crypto from 'node:crypto';
import boxen from 'boxen';
import chalk from 'chalk';
import _yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { select, Separator } from '@inquirer/prompts';

import Signature from '../lib/signature.js';
import dotenv from 'dotenv';
dotenv.config();

const yargs = _yargs(hideBin(process.argv));

import Mongo from '../lib/mongo.js';

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'full',
  timeStyle: 'short',
  hour12: false,
  timeZone: 'Pacific/Auckland',
});

const main = async () => {
  const mongo = new Mongo(process.env.MONGO_URI);
  const signature = new Signature();

  const options = yargs
   .scriptName('federated-social')
   .usage('Usage: -n <name>')
   .option('n', { alias: 'name', describe: 'Your name', type: 'string', demandOption: false })
   .default('n', 'cousinsd')
   .argv;

  console.log(chalk.white.bold(`Hello ${options.name}\n`));

  const actor = await mongo.findOne('actors', { preferredUsername: options.name });

  let items;
  items = await mongo.findMany('inbox', {
    'data.type': 'Follow'
  }, {
    sort: { inserted: 1 },
    projection: { inserted: 1, actor: 1 }
  });

  const choices = items.map(el => {
    return {
      name: `\
${dateFormat.format(el.inserted)} \
      ${chalk.bold(el.actor.id.padEnd(40, ' '))}`,
      value: el._id,
    }
  });

  if (choices.length === 0) {
    console.log(chalk.white.bold('Inbox is empty, exiting\n'));
    process.exit();
  }
  // header
  console.log(chalk.white.bold('   Follow Requests:'));
  console.log(chalk.white.bold('  ----------------\n'));

  // select follow request from list
  const object_id = await select({
    message: 'Select a follow request to action\n',
    choices,
  });

  // select action on the follow request
  let action = await select({
    message: 'Select an action\n',
    choices: ['Accept', 'Reject'],
  });


  let followRequest = await mongo.findOne('inbox', {'_id': object_id});

  switch (action) {
    case 'Accept':
      // send accept post request
      const guid = crypto.randomBytes(16).toString('hex');
      const message = {
        "@context": "https://www.w3.org/ns/activitystreams",
        "id": `${actor.id}/messages/${guid}`,
        "type": "Accept",
        "actor": `${actor.id}`,
        "object": followRequest.data
      }
      await mongo.insertOne('messages', message);

      const reqBody = JSON.stringify(message);
      // create signed headers and send accept message
      const keys = await mongo.findOne('keys', {id: actor.id});
      const headers = signature.headers({ 
        inbox: followRequest.actor.inbox,
        reqBody,
        privateKey: keys.privateKey,
        keyId: actor.id
      });
      console.log(headers);
      const response = await fetch(followRequest.actor.inbox, {
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
          console.log(response);
        }
      }
      console.log(result);
      break;
    case 'Reject':
      // delete the inbox entry
      break;
    default:
      break;
  }
  // choices: accept, reject

    /*
crossroads.addRoute("/boxes/box-rules", () => import(`/src/resources/admin/components/routes/box-rules`).then(({ default: BoxRules }) => {
  return renderer.render(<BoxRules />, document.getElementById("app"));
}));
*/

  await mongo.close();
}

main().catch((e) => console.log(e));
