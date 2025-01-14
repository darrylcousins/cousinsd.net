#!/usr/bin/env node

import dotenv from 'dotenv';
dotenv.config();

import boxen from 'boxen';
import chalk from 'chalk';
import _yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { select, Separator } from '@inquirer/prompts';

const yargs = _yargs(hideBin(process.argv));

import Mongo from '../lib/mongo.js';

const main = async () => {
  const mongo = new Mongo(process.env.MONGO_URI);

  const options = yargs
   .scriptName('federated-social')
   .usage("Usage: -n <name>")
   .option("n", { alias: "name", describe: "Your name", type: "string", demandOption: true })
   .argv;

  const actor = await mongo.findOne('actors', { preferredUsername: options.name });

  let items;
  items = await mongo.findMany('inbox', {
    'data.type': 'Follow'
  }, {
    sort: { inserted: 1 },
    projection: { inserted: 1, actor: 1 }
  }); // date selection?
  //console.log(items);
  const dateFormat = new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'full',
    timeStyle: 'short',
    hour12: false,
    timeZone: 'Pacific/Auckland',
  });
  const choices = items.map(el => {
    return {
      name: `\
${dateFormat.format(el.inserted)} \
      ${chalk.bold(el.actor.id.padEnd(40, ' '))}`,
      value: el._id,
    }
  });

  // header
  console.log(chalk.white.bold('\n   Follow Requests:'));
  console.log(chalk.white.bold('  ----------------\n'));
  const object_id = await select({
    message: 'Select a follow request to action\n',
    choices,
  });
  console.log(object_id);
  let action = await select({
    message: 'Select an action\n',
    choices: ['Accept', 'Reject'],
  });
  console.log(action);
  const obj = await mongo.findOne('inbox', {'_id': object_id});
  console.log(obj);
  switch (action) {
    case 'Accept':
      // send accept post request
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
