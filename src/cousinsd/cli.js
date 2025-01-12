#!/usr/bin/env node

import dotenv from 'dotenv';
dotenv.config();

import boxen from 'boxen';
import chalk from 'chalk';
import _yargs from 'yargs';
import { hideBin } from 'yargs/helpers';
import { select, Separator } from '@inquirer/prompts';

const yargs = _yargs(hideBin(process.argv));

import Mongo from './lib/mongo.js';

const main = async () => {
  const mongo = new Mongo(process.env.MONGO_URI);

  const options = yargs
   .scriptName('federated-social')
   .usage("Usage: -n <name>")
   .option("n", { alias: "name", describe: "Your name", type: "string", demandOption: true })
   .argv;

  const actor = await mongo.findOne('actors', { preferredUsername: options.name });
  /*
  let greeting;
  if (actor) {
    const hello = `Hello, ${actor.preferredUsername} <${actor.id}>`;
    greeting = chalk.white.bold(hello);
  } else {
    greeting = chalk.white.bold(`${options.name} not found`);
  }
  const boxenOptions = {
     padding: 1,
     margin: 1,
     borderStyle: "round",
     borderColor: "green",
     backgroundColor: "#555555"
  };
  const msgBox = boxen( greeting, boxenOptions );
  */

  let items;
  /*
  const answer = await select({
    message: 'Select a table',
    choices: [
      { name: 'inbox', value: 'inbox', description: 'Actions waiting in the inbox' },
      { name: 'messages', value: 'messages', description: 'Messages waiting' },
    ],
  });
  switch (answer) {
    case 'inbox':
      items = await mongo.findMany('inbox'); // date selection?
      break;
    case 'messages':
      break;
    default:
      break;
  }
  */
  items = await mongo.findMany('inbox'); // date selection?
  //console.log(items);
  const choices = items.map(el => {
    return {
      name: `${el.data.type.padEnd(10, ' ')}| ${el.actor.id.padEnd(40, ' ')}`,
      value: {type: el.data.type, id: el.id},
    }
  });
  console.log(chalk.white.bold('\n   Inbox:'));
  console.log(chalk.white.bold('---------\n'));
  const bleh = await select({
    message: 'Select an inbox item to action\n',
    choices,
  });
  console.log(bleh);
  let action;
  switch (bleh.type) {
    case 'Follow':
      action = await select({
        message: 'Select an action\n',
        choices: ['Accept', 'Reject'],
      });
      break;
    default:
      break;
  }
  console.log(action);
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

  await mongo.close();
}

main().catch((e) => console.log(e));
